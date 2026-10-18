from __future__ import annotations

from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..biohack import build_protocol, maybe_synthesize
from ..database import get_db
from ..geocode import geocode_city
from ..hd.chart import calculate_chart, calculate_transits, overlay_transits
from ..models import (
    NatalChart,
    SupplementInventory,
    User,
    UserBiometricsDaily,
    WeeklyProtocol,
)
from ..schemas import (
    BirthDataIn,
    ChartResponse,
    GeocodeOut,
    InventoryItemIn,
    ProtocolRequest,
    TelemetryIn,
    TransitResponse,
    UserCreate,
    UserOut,
)

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
    return {"status": "ok", "service": "hd-biohack"}


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
def geocode(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    try:
        return geocode_city(q, db)
    except ValueError as e:
        raise HTTPException(404, str(e)) from e


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
        row = NatalChart(
            user_id=body.user_id,
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

    return ChartResponse(chart=chart, natal_chart_id=natal_id)


@router.get("/charts/{user_id}")
def get_user_charts(user_id: int, db: Session = Depends(get_db)):
    rows = db.query(NatalChart).filter(NatalChart.user_id == user_id).order_by(NatalChart.id.desc()).all()
    return [
        {
            "id": r.id,
            "birth_date": r.birth_date,
            "birth_time": r.birth_time,
            "birth_city": r.birth_city,
            "type": r.chart_json.get("type"),
            "profile": r.chart_json.get("profile"),
            "chart": r.chart_json,
        }
        for r in rows
    ]


@router.get("/transits/today", response_model=TransitResponse)
def transits_today(
    natal_chart_id: int | None = None,
    db: Session = Depends(get_db),
):
    transit = calculate_transits()
    overlay = None
    if natal_chart_id:
        row = db.get(NatalChart, natal_chart_id)
        if not row:
            raise HTTPException(404, "Natal chart not found")
        overlay = overlay_transits(row.chart_json, transit)
    return TransitResponse(transit=transit, overlay=overlay)


@router.post("/inventory")
def add_inventory(body: InventoryItemIn, db: Session = Depends(get_db)):
    user = db.get(User, body.user_id)
    if not user:
        raise HTTPException(404, "User not found")
    item = SupplementInventory(
        user_id=body.user_id, name=body.name, notes=body.notes, active=body.active
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "name": item.name, "active": item.active}


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

    return {
        "entitlement": {
            "subscription_tier": user.subscription_tier,
            "biohacking_enabled": user.biohacking_enabled,
        },
        "overlay": overlay,
        "protocol": proto,
    }


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
