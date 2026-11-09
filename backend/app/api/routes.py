from __future__ import annotations

from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..biohack import build_protocol, maybe_synthesize
from ..checkin import derive_today_indication
from ..checkin.novelty import hkt_bucket_instant, hkt_today
from ..database import get_db
from ..geocode import geocode_city, suggest_cities, list_seed_cities
from ..hd.chart import calculate_chart, calculate_transits, overlay_transits
from ..hd.soul_sync import CONTEXT_IDS, compute_soul_sync
from ..models import (
    NatalChart,
    ProtocolCompletion,
    SupplementInventory,
    User,
    UserBiometricsDaily,
    UserDailyIntention,
    WeeklyProtocol,
)
from ..session_auth import (
    GENERIC_AUTH_ERROR,
    GENERIC_RESET_OK,
    create_password_reset_token,
    create_session,
    consume_password_reset_token,
    get_current_user,
    get_optional_user,
    rate_limit,
    require_self,
    revoke_all_sessions_for_user,
    revoke_session,
    bearer_from_header,
)
from ..mail import send_password_reset_email
from ..config import get_settings
from ..auth import hash_password, verify_password
from ..usage import (
    backfill_usage_from_history,
    list_usage_events,
    record_page_view,
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
    DailyIntentionIn,
    DailyIntentionOut,
    GeocodeOut,
    GeocodeSuggestOut,
    InventoryItemIn,
    LoginIn,
    ProtocolCompletionIn,
    ProtocolCompletionOut,
    ProtocolCompletionsOut,
    ProtocolRequest,
    TelemetryIn,
    TransitResponse,
    PageViewIn,
    UsageEventsPage,
    UsageStatsDay,
    UsageStatsMonth,
    UsageStatsWeek,
    SoulSyncIn,
    SoulSyncOut,
    UserCreate,
    UserOut,
    UserSettingsPatch,
    AuthSessionOut,
    RegisterIn,
    ForgotPasswordIn,
    ResetPasswordIn,
    MessageOut,
)

MAX_CHARTS_PER_USER = 10


def _user_has_biohacking(user: User) -> bool:
    from ..entitlements import user_has_biohacking

    return user_has_biohacking(user)


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



@router.post("/auth/login", response_model=AuthSessionOut)
def login(body: LoginIn, request: Request, db: Session = Depends(get_db)):
    """Email or username + password → opaque bearer session."""
    rate_limit("login", limit=20, window_sec=300, request=request)
    ident = body.username.strip()
    user = None
    if "@" in ident:
        user = (
            db.query(User)
            .filter(func.lower(User.email) == ident.lower())
            .first()
        )
    if user is None:
        user = db.query(User).filter(User.username == ident).first()
    if user is None:
        user = (
            db.query(User)
            .filter(func.lower(User.username) == ident.lower())
            .first()
        )
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, GENERIC_AUTH_ERROR)
    token = create_session(db, user)
    record_usage_event(user=user, event_type="login")
    return AuthSessionOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/auth/register", response_model=AuthSessionOut)
def register(body: RegisterIn, request: Request, db: Session = Depends(get_db)):
    """Create a password account. Tier is always free; caller cannot pick Pro."""
    rate_limit("register", limit=10, window_sec=600, request=request)
    email = body.email.strip().lower()
    if "@" not in email or "." not in email.split("@", 1)[-1]:
        raise HTTPException(400, GENERIC_AUTH_ERROR)
    if len(body.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        # Generic — do not reveal that the email exists
        raise HTTPException(401, GENERIC_AUTH_ERROR)
    first = (body.first_name or "").strip() or None
    if first and len(first) > 64:
        raise HTTPException(400, "first_name must be at most 64 characters")
    display = first or email.split("@")[0]
    user = User(
        email=email,
        display_name=display,
        first_name=first,
        auth_provider="password",
        subscription_tier="free",
        biohacking_enabled=False,
        password_hash=hash_password(body.password),
        username=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_session(db, user)
    record_usage_event(user=user, event_type="login")
    return AuthSessionOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/auth/logout", response_model=MessageOut)
def logout(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    revoke_session(db, bearer_from_header(authorization))
    return MessageOut(message="Signed out")


@router.get("/auth/me", response_model=UserOut)
def auth_me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)


@router.post("/auth/forgot-password", response_model=MessageOut)
def forgot_password(body: ForgotPasswordIn, request: Request, db: Session = Depends(get_db)):
    rate_limit("forgot", limit=10, window_sec=600, request=request)
    email = body.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if user and user.password_hash:
        raw = create_password_reset_token(db, user)
        settings = get_settings()
        base = (settings.frontend_base_url or "").rstrip("/") or "http://localhost:3000"
        reset_url = f"{base}/reset-password?token={raw}"
        send_password_reset_email(to_email=user.email, reset_url=reset_url)
    return MessageOut(message=GENERIC_RESET_OK)


@router.post("/auth/reset-password", response_model=AuthSessionOut)
def reset_password(body: ResetPasswordIn, request: Request, db: Session = Depends(get_db)):
    """Consume one-time token, set password, start a signed session (go home)."""
    rate_limit("reset", limit=10, window_sec=600, request=request)
    if len(body.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    user = consume_password_reset_token(db, body.token.strip())
    if not user:
        raise HTTPException(400, "This reset link expired. Request a new one.")
    user.password_hash = hash_password(body.password)
    user.auth_provider = "password"
    db.commit()
    db.refresh(user)
    revoke_all_sessions_for_user(db, user.id)
    token = create_session(db, user)
    record_usage_event(user=user, event_type="login")
    return AuthSessionOut(access_token=token, user=UserOut.model_validate(user))


@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Admin-only user list (was public — locked for signup beta)."""
    from ..usage import is_admin_email

    if not is_admin_email(user.email):
        raise HTTPException(403, "Admin only")
    return db.query(User).order_by(User.id).all()


@router.post("/users", response_model=UserOut)
def create_user_legacy(_: UserCreate, db: Session = Depends(get_db)):
    """Locked — use POST /auth/register. Caller must not pick tier."""
    raise HTTPException(403, "Use POST /auth/register to create an account")


@router.patch("/users/{user_id}/tier", response_model=UserOut)
def set_tier(
    user_id: int,
    tier: str = Query(...),
    actor_user_id: int = Query(..., description="Acting admin user id"),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Admin-only plan switch. v1: actor must be allowlisted admin and may change self only."""
    require_self(current, actor_user_id)
    actor = require_admin_user(db, actor_user_id)
    if actor.id != user_id:
        raise HTTPException(403, "Admin may only change their own plan")
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




SUPPORTED_LOCALES = frozenset({"en", "nl", "de", "fr", "es"})


def _validate_preferred_locale(locale: str | None) -> str | None:
    """Return normalised locale code, or None when cleared. Reject unknown codes."""
    if locale is None:
        return None
    cleaned = locale.strip().lower().replace("_", "-")
    if not cleaned:
        return None
    # Accept bare language tags only for v1 (en, nl, de, fr, es).
    primary = cleaned.split("-", 1)[0]
    if primary not in SUPPORTED_LOCALES:
        raise HTTPException(
            400,
            f"Invalid preferred_locale: {locale!r}. Allowed: {', '.join(sorted(SUPPORTED_LOCALES))}",
        )
    return primary


def _validate_iana_timezone(tz: str | None) -> str | None:
    """Return stripped IANA name, or None when cleared. Reject unknown zones."""
    if tz is None:
        return None
    cleaned = tz.strip()
    if not cleaned:
        return None
    try:
        ZoneInfo(cleaned)
    except ZoneInfoNotFoundError as e:
        raise HTTPException(400, f"Invalid IANA timezone: {cleaned}") from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(400, f"Invalid IANA timezone: {cleaned}") from e
    return cleaned



def _account_today(user: User | None) -> date:
    """Calendar day for Protocols / I-did-it completions — preferred TZ, else HKT."""
    from datetime import datetime as _dt

    tz_name = (getattr(user, "preferred_timezone", None) or "").strip() or "Asia/Hong_Kong"
    try:
        zone = ZoneInfo(tz_name)
    except Exception:
        zone = ZoneInfo("Asia/Hong_Kong")
    return _dt.now(zone).date()

def _validate_first_name(name: str | None) -> str | None:
    """Trim optional first name; empty clears to None. Max 64 (schema-enforced)."""
    if name is None:
        return None
    cleaned = name.strip()
    if not cleaned:
        return None
    if len(cleaned) > 64:
        raise HTTPException(400, "first_name must be at most 64 characters")
    return cleaned


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    require_self(current, user_id)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.patch("/users/{user_id}/settings", response_model=UserOut)
def patch_user_settings(
    user_id: int,
    body: UserSettingsPatch,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    require_self(current, user_id)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if "preferred_timezone" in body.model_fields_set:
        user.preferred_timezone = _validate_iana_timezone(body.preferred_timezone)
    if "preferred_locale" in body.model_fields_set:
        user.preferred_locale = _validate_preferred_locale(body.preferred_locale)
    if "first_name" in body.model_fields_set:
        user.first_name = _validate_first_name(body.first_name)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users/{user_id}/intention", response_model=DailyIntentionOut)
def get_daily_intention(
    user_id: int,
    day: date = Query(..., description="YYYY-MM-DD in account timezone"),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    require_self(current, user_id)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    row = (
        db.query(UserDailyIntention)
        .filter(UserDailyIntention.user_id == user_id, UserDailyIntention.day == day)
        .first()
    )
    if not row:
        return DailyIntentionOut(day=day, text="")
    return row


@router.put("/users/{user_id}/intention", response_model=DailyIntentionOut)
def upsert_daily_intention(
    user_id: int,
    body: DailyIntentionIn,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    require_self(current, user_id)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    text = (body.text or "").strip()[:200]
    row = (
        db.query(UserDailyIntention)
        .filter(UserDailyIntention.user_id == user_id, UserDailyIntention.day == body.day)
        .first()
    )
    if row:
        row.text = text
        row.updated_at = datetime.utcnow()
    else:
        row = UserDailyIntention(user_id=user_id, day=body.day, text=text)
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get(
    "/users/{user_id}/protocol-completions", response_model=ProtocolCompletionsOut
)
def list_protocol_completions(
    user_id: int,
    chart_id: int = Query(...),
    day_from: date | None = Query(None, alias="from"),
    day_to: date | None = Query(None, alias="to"),
    day: date | None = Query(None, description="Single day shorthand"),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    require_self(current, user_id)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    chart = db.get(NatalChart, chart_id)
    if not chart or chart.user_id != user_id:
        raise HTTPException(404, "Chart not found")
    q = db.query(ProtocolCompletion).filter(
        ProtocolCompletion.user_id == user_id,
        ProtocolCompletion.chart_id == chart_id,
    )
    if day is not None:
        q = q.filter(ProtocolCompletion.day == day)
    else:
        if day_from is not None:
            q = q.filter(ProtocolCompletion.day >= day_from)
        if day_to is not None:
            q = q.filter(ProtocolCompletion.day <= day_to)
    rows = q.order_by(ProtocolCompletion.day, ProtocolCompletion.item_id).all()
    return ProtocolCompletionsOut(items=rows)


@router.put(
    "/users/{user_id}/protocol-completions", response_model=ProtocolCompletionOut
)
def upsert_protocol_completion(
    user_id: int,
    body: ProtocolCompletionIn,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    require_self(current, user_id)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    chart = db.get(NatalChart, body.chart_id)
    if not chart or chart.user_id != user_id:
        raise HTTPException(404, "Chart not found")
    kind = body.kind if body.kind in ("move", "baseline", "evening") else "move"
    label = (body.label or "").strip()[:255] or body.item_id
    note = None
    if body.note is not None:
        trimmed = body.note.strip()[:120]
        note = trimmed or None
    row = (
        db.query(ProtocolCompletion)
        .filter(
            ProtocolCompletion.user_id == user_id,
            ProtocolCompletion.chart_id == body.chart_id,
            ProtocolCompletion.day == body.day,
            ProtocolCompletion.item_id == body.item_id,
        )
        .first()
    )
    if row:
        row.kind = kind
        row.label = label
        row.done = bool(body.done)
        row.note = note if body.done else None
        row.updated_at = datetime.utcnow()
    else:
        row = ProtocolCompletion(
            user_id=user_id,
            chart_id=body.chart_id,
            day=body.day,
            item_id=body.item_id,
            kind=kind,
            label=label,
            done=bool(body.done),
            note=note if body.done else None,
        )
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


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
            # Freeze role on update — FE must create a new row to change Me ↔ Friend.
            if slot_kind != (row.slot_kind or "self"):
                raise HTTPException(
                    400,
                    "Use update without changing role, or save as a new person.",
                )
            row.label = label[:128]
            # Relationship label: people may be person|partner; self stays self.
            if slot_kind == "friend":
                role_in = (getattr(body, "role", None) or getattr(row, "role", None) or "person")
                row.role = role_in if role_in in ("person", "partner") else "person"
            else:
                row.role = "self"
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
            # Free: create Me only (one self). Friend creates require Pro.
            if not _user_has_biohacking(user):
                if slot_kind == "friend":
                    raise HTTPException(
                        403,
                        "Saving people charts requires Pro. Free can save your Me chart only.",
                    )
                existing_self = (
                    db.query(NatalChart)
                    .filter(
                        NatalChart.user_id == body.user_id,
                        NatalChart.slot_kind != "friend",
                    )
                    .count()
                )
                if existing_self >= 1:
                    raise HTTPException(
                        403,
                        "Free can keep one Me chart — update your existing chart instead of creating another.",
                    )
            count = db.query(NatalChart).filter(NatalChart.user_id == body.user_id).count()
            if count >= MAX_CHARTS_PER_USER:
                raise HTTPException(
                    400,
                    f"Chart limit reached ({MAX_CHARTS_PER_USER}/user). "
                    "Delete a saved person before adding another.",
                )
            if slot_kind == "friend":
                role_in = getattr(body, "role", None) or "person"
                chart_role = role_in if role_in in ("person", "partner") else "person"
            else:
                chart_role = "self"
            row = NatalChart(
                user_id=body.user_id,
                label=label[:128],
                slot_kind=slot_kind,
                role=chart_role,
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
def get_user_charts(
    user_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    require_self(current, user_id)
    rows = db.query(NatalChart).filter(NatalChart.user_id == user_id).order_by(NatalChart.id.desc()).all()
    return [
        {
            "id": r.id,
            "label": getattr(r, "label", None) or "Me",
            "slot_kind": getattr(r, "slot_kind", None) or "self",
            "role": (
                getattr(r, "role", None)
                or ("self" if (getattr(r, "slot_kind", None) or "self") != "friend" else "person")
            ),
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
    if body.role is not None:
        if (row.slot_kind or "self") == "friend":
            if body.role not in ("person", "partner"):
                raise HTTPException(400, "People role must be person or partner")
            row.role = body.role
        elif body.role != "self":
            raise HTTPException(400, "Me charts keep role self")
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "label": row.label,
        "slot_kind": row.slot_kind,
        "role": getattr(row, "role", None)
        or ("self" if (row.slot_kind or "self") != "friend" else "person"),
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
    user_id: int | None = Query(
        None,
        description="When set, join owned kit + Pro entitlement + I-did-it history into Today",
    ),
    preview_as_free: bool = Query(
        False,
        description="Client Preview-as-Free — force kit placeholder even for Pro accounts",
    ),
    db: Session = Depends(get_db),
):
    # Bucket ephemeris at fixed 07:00 Asia/Hong_Kong for calendar day D and D-1
    # so refreshes are stable within the day (Daily Novelty Contract).
    day = hkt_today()
    when_today = hkt_bucket_instant(day)
    when_yest = hkt_bucket_instant(day - timedelta(days=1))

    transit = calculate_transits(when_today)
    prev_transit = calculate_transits(when_yest)
    overlay = None
    prev_overlay = None
    natal = None
    if natal_chart_id:
        row = db.get(NatalChart, natal_chart_id)
        if not row:
            raise HTTPException(404, "Natal chart not found")
        natal = row.chart_json
        overlay = overlay_transits(natal, transit)
        prev_overlay = overlay_transits(natal, prev_transit)

    owned_names: list[str] = []
    inventory_notes: dict[str, str] = {}
    bio_unlocked = False
    history: list[dict] = []
    # Completions share Protocols' account-TZ day key (fallback HKT). Ephemeris `day` stays HKT.
    completion_day = day
    if user_id is not None:
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(404, "User not found")
        bio_unlocked = _user_has_biohacking(user) and not preview_as_free
        completion_day = _account_today(user)
        inv_rows = (
            db.query(SupplementInventory)
            .filter(
                SupplementInventory.user_id == user_id,
                SupplementInventory.active.is_(True),
            )
            .all()
        )
        owned_names = [r.name for r in inv_rows]
        inventory_notes = {
            r.name: (r.notes or "") for r in inv_rows if (r.notes or "").strip()
        }
        if natal_chart_id:
            hist_from = completion_day - timedelta(days=21)
            hist_rows = (
                db.query(ProtocolCompletion)
                .filter(
                    ProtocolCompletion.user_id == user_id,
                    ProtocolCompletion.chart_id == natal_chart_id,
                    ProtocolCompletion.day >= hist_from,
                    ProtocolCompletion.day <= completion_day,
                    ProtocolCompletion.item_id.like("today-move:%"),
                )
                .all()
            )
            history = [
                {
                    "item_id": r.item_id,
                    "done": bool(r.done),
                    "day": r.day.isoformat(),
                }
                for r in hist_rows
            ]

    prev_indication = None
    if natal is not None:
        # Chip baseline for vs_yesterday energy/space deltas (no novelty recurse)
        prev_indication = derive_today_indication(natal, prev_transit, prev_overlay)

    indication = derive_today_indication(
        natal,
        transit,
        overlay,
        prev_transit=prev_transit,
        prev_overlay=prev_overlay,
        prev_indication=prev_indication,
        day=day,
        calc_transit=calculate_transits,
        calc_overlay=overlay_transits if natal else None,
        owned_names=owned_names,
        inventory_notes=inventory_notes,
        biohacking_unlocked=bio_unlocked,
        history=history,
    )

    # Seed "offered" Move for the account day (done=False) so Pro down-ranking sees ignored history.
    # Never overwrite an existing tap (especially done=True). Same day key as Protocols completions.
    if (
        user_id is not None
        and natal_chart_id is not None
        and isinstance(indication, dict)
        and indication.get("move_item_id")
    ):
        move_id = str(indication["move_item_id"])
        existing = (
            db.query(ProtocolCompletion)
            .filter(
                ProtocolCompletion.user_id == user_id,
                ProtocolCompletion.chart_id == natal_chart_id,
                ProtocolCompletion.day == completion_day,
                ProtocolCompletion.item_id == move_id,
            )
            .first()
        )
        if existing is None:
            db.add(
                ProtocolCompletion(
                    user_id=user_id,
                    chart_id=natal_chart_id,
                    day=completion_day,
                    item_id=move_id,
                    kind="move",
                    label=str(indication.get("main_action_text") or move_id)[:255],
                    done=False,
                    note=None,
                )
            )
            db.commit()

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
def list_inventory(
    user_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    require_self(current, user_id)
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

    # Same HKT 07:00 novelty buckets as /transits/today
    day = hkt_today()
    when_today = hkt_bucket_instant(day)
    when_yest = hkt_bucket_instant(day - timedelta(days=1))
    natal = natal_row.chart_json
    transit = calculate_transits(when_today)
    prev_transit = calculate_transits(when_yest)
    overlay = overlay_transits(natal, transit)
    prev_overlay = overlay_transits(natal, prev_transit)
    inv_rows = (
        db.query(SupplementInventory)
        .filter(
            SupplementInventory.user_id == body.user_id,
            SupplementInventory.active.is_(True),
        )
        .all()
    )
    inv = [r.name for r in inv_rows]
    inv_notes = {
        r.name: (r.notes or "") for r in inv_rows if (r.notes or "").strip()
    }
    bio_unlocked = _user_has_biohacking(user)
    prev_indication = derive_today_indication(natal, prev_transit, prev_overlay)
    indication = derive_today_indication(
        natal,
        transit,
        overlay,
        prev_transit=prev_transit,
        prev_overlay=prev_overlay,
        prev_indication=prev_indication,
        day=day,
        calc_transit=calculate_transits,
        calc_overlay=overlay_transits,
        owned_names=inv,
        inventory_notes=inv_notes,
        biohacking_unlocked=bio_unlocked,
    )
    # Prefer FE-persisted yesterday fingerprint; else recompute natural leads for D-1
    y_fp = (body.yesterday_lead_fingerprint or "").strip() or None
    if not y_fp:
        yest_proto = build_protocol(
            natal,
            prev_overlay,
            inv,
            indication=prev_indication,
            transit=prev_transit,
            yesterday_lead_fingerprint=None,
        )
        y_fp = yest_proto.get("lead_fingerprint") or yest_proto.get("natural_lead_fingerprint")
    proto = build_protocol(
        natal,
        overlay,
        inv,
        indication=indication,
        transit=transit,
        yesterday_lead_fingerprint=y_fp,
    )
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
        "indication": indication,
        "protocol": proto,
    }





@router.post("/usage/page-view", status_code=204)
def usage_page_view(body: PageViewIn):
    """Best-effort primary-nav page visit. Always 204; never fails the caller."""
    try:
        record_page_view(path=body.path, user_id=body.user_id)
    except Exception:  # noqa: BLE001
        pass
    return Response(status_code=204)


@router.get("/admin/usage/events", response_model=UsageEventsPage)
def admin_usage_events(
    actor_user_id: int = Query(..., description="Acting admin user id"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    day: str | None = Query(None, description="UTC calendar day YYYY-MM-DD"),
    event_type: str | None = Query(None, description="login|chart_generated|protocol_generated|page_view"),
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
    """Aura Alchemy between two natal charts owned by the same user."""
    if body.self_chart_id == body.friend_chart_id:
        raise HTTPException(400, "Pick two different charts")
    if body.context not in CONTEXT_IDS:
        raise HTTPException(400, "Invalid context")

    user = db.get(User, body.user_id)
    if not user:
        raise HTTPException(404, "User not found")
    # Soft Pro gate (same truth as Protocols FE): Free cannot run Soul sync.
    # Preview-as-Free is FE-only; DB-Pro accounts still pass here.
    if not _user_has_biohacking(user):
        raise HTTPException(403, "Soul sync requires Pro")

    self_row = db.get(NatalChart, body.self_chart_id)
    friend_row = db.get(NatalChart, body.friend_chart_id)
    if not self_row or not friend_row:
        raise HTTPException(404, "Chart not found")
    if self_row.user_id != body.user_id or friend_row.user_id != body.user_id:
        raise HTTPException(403, "Chart not owned by user")

    chart_a = self_row.chart_json or {}
    chart_b = friend_row.chart_json or {}
    # protocols ignored (Aura Alchemy dropped Fit-era co-reg toggles)
    result = compute_soul_sync(
        chart_a,
        chart_b,
        context=body.context,
        self_meta={
            "id": self_row.id,
            "label": getattr(self_row, "label", None) or "Me",
            "type": chart_a.get("type"),
            "profile": chart_a.get("profile"),
            "authority": chart_a.get("authority"),
            "role": getattr(self_row, "role", None) or "self",
        },
        friend_meta={
            "id": friend_row.id,
            "label": getattr(friend_row, "label", None) or "Friend",
            "type": chart_b.get("type"),
            "profile": chart_b.get("profile"),
            "authority": chart_b.get("authority"),
            "role": (
                getattr(friend_row, "role", None)
                if getattr(friend_row, "role", None) in ("partner", "person")
                else "person"
            ),
        },
    )
    return result

