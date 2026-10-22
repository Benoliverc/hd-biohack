from __future__ import annotations

from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..biohack import build_protocol, maybe_synthesize
from ..checkin import derive_today_indication
from ..database import get_db
from ..geocode import geocode_city, suggest_cities, list_seed_cities
from ..hd.chart import calculate_chart, calculate_transits, overlay_transits
from ..hd.soul_sync import CONTEXT_WEIGHTS, compute_soul_sync
from ..models import (
    NatalChart,
    SupplementInventory,
    User,
    UserBiometricsDaily,
    WeeklyProtocol,
)
from ..auth import verify_password
from ..usage import (
    backfill_usage_from_history,
    list_usage_events,
    record_usage_event,
    require_admin_user,
    stats_daily,
    stats_monthly,
    stats_weekly,
)
from ..schemas import (
    BirthDataIn,
    ChartLabelPatch,
    ChartResponse,
    GeocodeOut,
    GeocodeSuggestOut,
    InventoryItemIn,
    LoginIn,
    ProtocolRequest,
    TelemetryIn,
    TransitResponse,
    UsageEventsPage,
    UsageStatsDay,
    UsageStatsMonth,
    UsageStatsWeek,
    SoulSyncIn,
    SoulSyncOut,
    UserCreate,
    UserOut,
)

MAX_CHARTS_PER_USER = 10

router = APIRouter()


def _parse_birth(data: BirthDataIn) -> tuple[int, int, int, int, int, int]:
    y, m, d = (int(x) for x in data.birth_date.split("-"))
    parts = data.birth_time.split(":")
    hour = int(parts[0])
    minute = int(parts[1]) if len(parts) > 1 else 0
    second = int(parts[2]) if len(parts) > 2 else 0
    return y, m, d, hour, minute, second


@router.get("/health")
def health():
    return {"status": "ok", "service": "baseline"}



@router.post("/auth/login", response_model=UserOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    """Username + password login for test / demo accounts."""
    username = body.username.strip()
    user = db.query(User).filter(User.username == username).first()
    if not user:
        # Case-insensitive fallback for convenience
        user = (
            db.query(User)
            .filter(func.lower(User.username) == username.lower())
            .first()
        )
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid username or password")
    record_usage_event(user=user, event_type="login")
    return user

@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id).all()


@router.post("/users", response_model=UserOut)
def create_user(body: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        return existing
    user = User(
        email=body.email,
        display_name=body.display_name or body.email.split("@")[0],
        auth_provider=body.auth_provider,
        subscription_tier=body.subscription_tier,
        biohacking_enabled=body.biohacking_enabled or body.subscription_tier == "biohacker_pro",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/tier", response_model=UserOut)
def set_tier(user_id: int, tier: str = Query(...), db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if tier not in ("free", "biohacker_pro"):
        raise HTTPException(400, "tier must be free|biohacker_pro")
    user.subscription_tier = tier
    user.biohacking_enabled = tier == "biohacker_pro"
    db.commit()
    db.refresh(user)
    return user


@router.get("/geocode", response_model=GeocodeOut)
def geocode(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    try:
        return geocode_city(q, db)
    except ValueError as e:
        raise HTTPException(404, str(e)) from e


@router.get("/geocode/suggest", response_model=GeocodeSuggestOut)
def geocode_suggest(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Autocomplete birth cities (seed/cache first, Open-Meteo for free-text)."""
    return {"results": suggest_cities(q, db)}


@router.get("/geocode/seeds", response_model=list[GeocodeOut])
def geocode_seeds():
    """Quick-pick seeded cities that never need live geocoding."""
    return list_seed_cities()


@router.post("/chart/calculate", response_model=ChartResponse)
def calc_chart(body: BirthDataIn, db: Session = Depends(get_db)):
    if body.lat is not None and body.lon is not None:
        geo = {
            "display_name": body.birth_city,
            "lat": body.lat,
            "lon": body.lon,
            "cached": False,
        }
    else:
        try:
            geo = geocode_city(body.birth_city, db)
        except ValueError as e:
            raise HTTPException(400, str(e)) from e

    y, m, d, hour, minute, second = _parse_birth(body)
    try:
        chart = calculate_chart(
            y, m, d, hour, minute, second,
            lat=geo["lat"], lon=geo["lon"],
        )
    except Exception as e:  # noqa: BLE001
        raise HTTPException(500, f"Chart calculation failed: {e}") from e

    natal_id = None
    if body.save and body.user_id:
        user = db.get(User, body.user_id)
        if not user:
            raise HTTPException(404, "User not found")
        label = (body.label or "").strip() or ("Me" if body.slot_kind == "self" else "Friend")
        slot_kind = body.slot_kind if body.slot_kind in ("self", "friend") else "self"

        row = None
        if body.natal_chart_id is not None:
            row = db.get(NatalChart, body.natal_chart_id)
            if not row or row.user_id != body.user_id:
                raise HTTPException(404, "Chart not found")
            row.label = label[:128]
            row.slot_kind = slot_kind
            row.birth_date = body.birth_date
            row.birth_time = body.birth_time
            row.birth_city = body.birth_city
            row.lat = geo["lat"]
            row.lon = geo["lon"]
            row.timezone = chart.get("timezone")
            row.chart_json = chart
            db.commit()
            db.refresh(row)
            natal_id = row.id
        else:
            count = db.query(NatalChart).filter(NatalChart.user_id == body.user_id).count()
            if count >= MAX_CHARTS_PER_USER:
                raise HTTPException(
                    400,
                    f"Chart limit reached ({MAX_CHARTS_PER_USER}/user). "
                    "Delete a saved person before adding another.",
                )
            row = NatalChart(
                user_id=body.user_id,
                label=label[:128],
                slot_kind=slot_kind,
                birth_date=body.birth_date,
                birth_time=body.birth_time,
                birth_city=body.birth_city,
                lat=geo["lat"],
                lon=geo["lon"],
                timezone=chart.get("timezone"),
                chart_json=chart,
            )
            db.add(row)
            db.commit()
            db.refresh(row)
            natal_id = row.id

    if body.user_id:
        user_for_event = db.get(User, body.user_id)
        if user_for_event:
            record_usage_event(
                user=user_for_event,
                event_type="chart_generated",
                metadata={
                    "natal_chart_id": natal_id,
                    "saved": bool(body.save and natal_id),
                    "slot_kind": body.slot_kind,
                },
            )
    return ChartResponse(chart=chart, natal_chart_id=natal_id)


@router.get("/charts/{user_id}")
def get_user_charts(user_id: int, db: Session = Depends(get_db)):
    rows = db.query(NatalChart).filter(NatalChart.user_id == user_id).order_by(NatalChart.id.desc()).all()
    return [
        {
            "id": r.id,
            "label": getattr(r, "label", None) or "Me",
            "slot_kind": getattr(r, "slot_kind", None) or "self",
            "birth_date": r.birth_date,
            "birth_time": r.birth_time,
            "birth_city": r.birth_city,
            "lat": r.lat,
            "lon": r.lon,
            "timezone": r.timezone or (r.chart_json or {}).get("timezone"),
            "type": (r.chart_json or {}).get("type"),
            "profile": (r.chart_json or {}).get("profile"),
            "authority": (r.chart_json or {}).get("authority"),
            "strategy": (r.chart_json or {}).get("strategy"),
            "chart": r.chart_json,
        }
        for r in rows
    ]


@router.patch("/charts/{chart_id}")
def rename_chart(chart_id: int, body: ChartLabelPatch, db: Session = Depends(get_db)):
    row = db.get(NatalChart, chart_id)
    if not row:
        raise HTTPException(404, "Chart not found")
    label = body.label.strip()
    if not label:
        raise HTTPException(400, "Label is required")
    row.label = label[:128]
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "label": row.label,
        "slot_kind": row.slot_kind,
    }


@router.delete("/charts/{chart_id}")
def delete_chart(
    chart_id: int,
    user_id: int = Query(..., description="Owner user id"),
    db: Session = Depends(get_db),
):
    row = db.get(NatalChart, chart_id)
    if not row or row.user_id != user_id:
        raise HTTPException(404, "Chart not found")
    db.delete(row)
    db.commit()
    return {"ok": True, "id": chart_id}


@router.get("/transits/today", response_model=TransitResponse)
def transits_today(
    natal_chart_id: int | None = None,
    db: Session = Depends(get_db),
):
    transit = calculate_transits()
    overlay = None
    natal = None
    if natal_chart_id:
        row = db.get(NatalChart, natal_chart_id)
        if not row:
            raise HTTPException(404, "Natal chart not found")
        natal = row.chart_json
        overlay = overlay_transits(natal, transit)
    indication = derive_today_indication(natal, transit, overlay)
    return TransitResponse(transit=transit, overlay=overlay, indication=indication)


@router.post("/inventory")
def add_inventory(body: InventoryItemIn, db: Session = Depends(get_db)):
    user = db.get(User, body.user_id)
    if not user:
        raise HTTPException(404, "User not found")
    name = body.name.strip()
    if not name:
        raise HTTPException(400, "Name is required")

    # Case-insensitive dedupe among active items — return existing (no duplicate row).
    existing = (
        db.query(SupplementInventory)
        .filter(
            SupplementInventory.user_id == body.user_id,
            func.lower(SupplementInventory.name) == name.lower(),
            SupplementInventory.active.is_(True),
        )
        .first()
    )
    if existing:
        return {
            "id": existing.id,
            "name": existing.name,
            "active": existing.active,
            "duplicate": True,
        }

    # Re-activate a soft-deleted match instead of inserting another row.
    inactive = (
        db.query(SupplementInventory)
        .filter(
            SupplementInventory.user_id == body.user_id,
            func.lower(SupplementInventory.name) == name.lower(),
            SupplementInventory.active.is_(False),
        )
        .first()
    )
    if inactive:
        inactive.active = True
        inactive.name = name
        if body.notes:
            inactive.notes = body.notes
        db.commit()
        db.refresh(inactive)
        return {
            "id": inactive.id,
            "name": inactive.name,
            "active": inactive.active,
            "duplicate": False,
        }

    item = SupplementInventory(
        user_id=body.user_id, name=name, notes=body.notes, active=body.active
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "name": item.name, "active": item.active, "duplicate": False}


@router.delete("/inventory/{item_id}")
def delete_inventory(
    item_id: int,
    user_id: int = Query(..., description="Owner user id"),
    db: Session = Depends(get_db),
):
    item = db.get(SupplementInventory, item_id)
    if not item or item.user_id != user_id:
        raise HTTPException(404, "Inventory item not found")
    item.active = False
    db.commit()
    return {"ok": True, "id": item_id}


@router.get("/inventory/{user_id}")
def list_inventory(user_id: int, db: Session = Depends(get_db)):
    rows = db.query(SupplementInventory).filter(
        SupplementInventory.user_id == user_id,
        SupplementInventory.active.is_(True),
    ).all()
    return [{"id": r.id, "name": r.name, "notes": r.notes} for r in rows]


@router.post("/biohack/protocol")
def protocol(body: ProtocolRequest, db: Session = Depends(get_db)):
    user = db.get(User, body.user_id)
    if not user:
        raise HTTPException(404, "User not found")

    q = db.query(NatalChart).filter(NatalChart.user_id == body.user_id)
    if body.natal_chart_id:
        q = q.filter(NatalChart.id == body.natal_chart_id)
    natal_row = q.order_by(NatalChart.id.desc()).first()
    if not natal_row:
        raise HTTPException(404, "No natal chart for user — calculate & save one first")

    transit = calculate_transits()
    overlay = overlay_transits(natal_row.chart_json, transit)
    inv = [
        r.name
        for r in db.query(SupplementInventory).filter(
            SupplementInventory.user_id == body.user_id,
            SupplementInventory.active.is_(True),
        ).all()
    ]
    proto = build_protocol(natal_row.chart_json, overlay, inv)
    proto = maybe_synthesize(proto)

    # Persist weekly snapshot
    week_start = date.today()
    snap = WeeklyProtocol(user_id=body.user_id, week_start=week_start, protocol_json=proto)
    db.add(snap)
    db.commit()
    db.refresh(snap)
    record_usage_event(
        user=user,
        event_type="protocol_generated",
        metadata={
            "protocol_id": snap.id,
            "natal_chart_id": natal_row.id,
        },
    )

    return {
        "entitlement": {
            "subscription_tier": user.subscription_tier,
            "biohacking_enabled": user.biohacking_enabled,
        },
        "overlay": overlay,
        "protocol": proto,
    }




@router.get("/admin/usage/events", response_model=UsageEventsPage)
def admin_usage_events(
    actor_user_id: int = Query(..., description="Acting admin user id"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    day: str | None = Query(None, description="UTC calendar day YYYY-MM-DD"),
    event_type: str | None = Query(None, description="login|chart_generated|protocol_generated"),
    db: Session = Depends(get_db),
):
    require_admin_user(db, actor_user_id)
    total, items = list_usage_events(
        db, limit=limit, offset=offset, day=day, event_type=event_type
    )
    return {"total": total, "items": items}


@router.get("/admin/usage/stats/daily", response_model=list[UsageStatsDay])
def admin_usage_stats_daily(
    actor_user_id: int = Query(..., description="Acting admin user id"),
    from_day: str | None = Query(None, alias="from", description="YYYY-MM-DD UTC"),
    to_day: str | None = Query(None, alias="to", description="YYYY-MM-DD UTC"),
    db: Session = Depends(get_db),
):
    require_admin_user(db, actor_user_id)
    fd = date.fromisoformat(from_day) if from_day else None
    td = date.fromisoformat(to_day) if to_day else None
    return stats_daily(db, from_day=fd, to_day=td)


@router.get("/admin/usage/stats/weekly", response_model=list[UsageStatsWeek])
def admin_usage_stats_weekly(
    actor_user_id: int = Query(..., description="Acting admin user id"),
    weeks: int = Query(12, ge=1, le=52),
    db: Session = Depends(get_db),
):
    require_admin_user(db, actor_user_id)
    return stats_weekly(db, weeks=weeks)


@router.get("/admin/usage/stats/monthly", response_model=list[UsageStatsMonth])
def admin_usage_stats_monthly(
    actor_user_id: int = Query(..., description="Acting admin user id"),
    months: int = Query(12, ge=1, le=36),
    db: Session = Depends(get_db),
):
    require_admin_user(db, actor_user_id)
    return stats_monthly(db, months=months)


@router.post("/admin/usage/backfill")
def admin_usage_backfill(
    actor_user_id: int = Query(..., description="Acting admin user id"),
    db: Session = Depends(get_db),
):
    """Optional idempotent historical backfill from natal_charts / weekly_protocols."""
    require_admin_user(db, actor_user_id)
    return backfill_usage_from_history(db)

@router.post("/api/v2/telemetry/ingest")
@router.post("/v2/telemetry/ingest")
def telemetry_ingest(body: TelemetryIn, db: Session = Depends(get_db)):
    """V2 stub: accept wearable daily metrics for future protocol merge."""
    user = db.get(User, body.user_id)
    if not user:
        raise HTTPException(404, "User not found")
    existing = (
        db.query(UserBiometricsDaily)
        .filter(UserBiometricsDaily.user_id == body.user_id, UserBiometricsDaily.day == body.day)
        .first()
    )
    if existing:
        for field in (
            "hrv_ms", "resting_hr", "sleep_score", "deep_sleep_mins",
            "steps", "active_calories", "source_device",
        ):
            val = getattr(body, field)
            if val is not None:
                setattr(existing, field, val)
        db.commit()
        row = existing
    else:
        row = UserBiometricsDaily(**body.model_dump())
        db.add(row)
        db.commit()
        db.refresh(row)
    return {"status": "accepted", "id": row.id, "note": "V2 stub — not yet merged into protocols"}

@router.post("/soul/sync", response_model=SoulSyncOut)
def soul_sync(body: SoulSyncIn, db: Session = Depends(get_db)):
    """Bio-Sync Index between two natal charts owned by the same user."""
    if body.self_chart_id == body.friend_chart_id:
        raise HTTPException(400, "Pick two different charts")
    if body.context not in CONTEXT_WEIGHTS:
        raise HTTPException(400, "Invalid context")

    user = db.get(User, body.user_id)
    if not user:
        raise HTTPException(404, "User not found")

    self_row = db.get(NatalChart, body.self_chart_id)
    friend_row = db.get(NatalChart, body.friend_chart_id)
    if not self_row or not friend_row:
        raise HTTPException(404, "Chart not found")
    if self_row.user_id != body.user_id or friend_row.user_id != body.user_id:
        raise HTTPException(403, "Chart not owned by user")

    chart_a = self_row.chart_json or {}
    chart_b = friend_row.chart_json or {}
    result = compute_soul_sync(
        chart_a,
        chart_b,
        context=body.context,
        protocols=body.protocols or [],
        self_meta={
            "id": self_row.id,
            "label": getattr(self_row, "label", None) or "Me",
            "type": chart_a.get("type"),
            "profile": chart_a.get("profile"),
            "authority": chart_a.get("authority"),
        },
        friend_meta={
            "id": friend_row.id,
            "label": getattr(friend_row, "label", None) or "Friend",
            "type": chart_b.get("type"),
            "profile": chart_b.get("profile"),
            "authority": chart_b.get("authority"),
        },
    )
    return result

