"""Product usage events + admin allowlist helpers."""

from __future__ import annotations

import logging
import threading
import time
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Any, Literal
from urllib.parse import urlsplit

from sqlalchemy.orm import Session

from .config import get_settings
from .database import SessionLocal
from .models import NatalChart, ProtocolCompletion, SupplementInventory, UsageEvent, User, WeeklyProtocol

logger = logging.getLogger(__name__)

EventType = Literal["login", "signup", "chart_generated", "protocol_generated", "page_view"]
EVENT_TYPES = ("login", "signup", "chart_generated", "protocol_generated", "page_view")
ACTION_EVENT_TYPES = ("login", "signup", "chart_generated", "protocol_generated")

# Primary nav pages only (Header.tsx). Stats key → exact path.
PAGE_PATHS: dict[str, str] = {
    "home": "/",
    "protocols": "/biohack",
    "today": "/transits",
    "chart": "/profile",
    "soul": "/soul",
}
PATH_TO_PAGE: dict[str, str] = {v: k for k, v in PAGE_PATHS.items()}
PAGE_KEYS = tuple(PAGE_PATHS.keys())

# Best-effort in-process debounce for Strict Mode double-mount.
_PAGE_VIEW_DEBOUNCE_SEC = 2.0
_page_view_lock = threading.Lock()
_page_view_recent: dict[tuple[str, str], float] = {}


def admin_email_set() -> set[str]:
    raw = get_settings().admin_emails or ""
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


def is_admin_email(email: str | None) -> bool:
    if not email:
        return False
    return email.strip().lower() in admin_email_set()


def require_admin_user(db: Session, actor_user_id: int) -> User:
    from fastapi import HTTPException

    user = db.get(User, actor_user_id)
    if not user or not is_admin_email(user.email):
        raise HTTPException(status_code=403, detail="Admin only")
    return user


def normalize_page_path(raw: str | None) -> str:
    """Strip query/hash; collapse empty/trailing slash to /; keep known prefixes exact."""
    if raw is None:
        return "/"
    s = str(raw).strip()
    if not s:
        return "/"
    # Drop scheme/host if a full URL sneaks in; keep path only.
    try:
        parts = urlsplit(s if "://" in s else f"http://local{s if s.startswith('/') else '/' + s}")
        path = parts.path or "/"
    except Exception:  # noqa: BLE001
        path = s.split("?", 1)[0].split("#", 1)[0]
    if not path.startswith("/"):
        path = "/" + path
    if path != "/" and path.endswith("/"):
        path = path.rstrip("/") or "/"
    return path or "/"


def page_key_for_path(path: str) -> str | None:
    return PATH_TO_PAGE.get(normalize_page_path(path))


def _empty_page_visits() -> dict[str, dict[str, int]]:
    return {k: {"views": 0, "unique_users": 0} for k in PAGE_KEYS}


def record_usage_event(
    *,
    user: User | None = None,
    user_id: int | None = None,
    email: str | None = None,
    event_type: str,
    metadata: dict[str, Any] | None = None,
) -> None:
    """Best-effort append. Never raises to callers — primary request must stay 200."""
    if event_type not in EVENT_TYPES:
        logger.warning("unknown usage event_type=%s", event_type)
        return
    uid = user_id if user_id is not None else (user.id if user else None)
    snap_email = (email if email is not None else (user.email if user else "")) or ""
    # Anonymous allowed only for page_view (logged-out Home visits).
    if uid is None and not snap_email and event_type != "page_view":
        return
    db = SessionLocal()
    try:
        db.add(
            UsageEvent(
                user_id=uid,
                email=snap_email[:255],
                event_type=event_type,
                created_at=datetime.utcnow(),
                metadata_json=metadata or None,
            )
        )
        db.commit()
    except Exception:  # noqa: BLE001
        logger.exception("usage event write failed type=%s user_id=%s", event_type, uid)
        try:
            db.rollback()
        except Exception:  # noqa: BLE001
            pass
    finally:
        db.close()


def _page_view_debounced(uid: int | None, page: str) -> bool:
    """Return True if this write should be skipped (recent duplicate)."""
    key = (str(uid) if uid is not None else "anon", page)
    now = time.monotonic()
    with _page_view_lock:
        last = _page_view_recent.get(key)
        # Prune stale entries opportunistically
        stale = [k for k, t in _page_view_recent.items() if now - t > _PAGE_VIEW_DEBOUNCE_SEC * 5]
        for k in stale:
            _page_view_recent.pop(k, None)
        if last is not None and (now - last) < _PAGE_VIEW_DEBOUNCE_SEC:
            return True
        _page_view_recent[key] = now
        return False


def record_page_view(*, path: str, user_id: int | None = None) -> bool:
    """
    Best-effort page_view for a known primary-nav path.
    Returns True if a row was attempted/written, False if ignored (unknown path / debounce).
    Never raises.
    """
    try:
        norm = normalize_page_path(path)
        page = page_key_for_path(norm)
        if page is None:
            return False
        if _page_view_debounced(user_id, page):
            return False
        snap_email = ""
        if user_id is not None:
            db = SessionLocal()
            try:
                u = db.get(User, user_id)
                if u and u.email:
                    snap_email = u.email
            except Exception:  # noqa: BLE001
                logger.exception("page_view email lookup failed user_id=%s", user_id)
            finally:
                db.close()
        record_usage_event(
            user_id=user_id,
            email=snap_email,
            event_type="page_view",
            metadata={"page": page, "path": PAGE_PATHS[page]},
        )
        return True
    except Exception:  # noqa: BLE001
        logger.exception("record_page_view failed path=%s user_id=%s", path, user_id)
        return False


def _parse_day(s: str) -> date:
    y, m, d = (int(x) for x in s.split("-"))
    return date(y, m, d)


def _day_bounds(d: date) -> tuple[datetime, datetime]:
    start = datetime(d.year, d.month, d.day)
    end = start + timedelta(days=1)
    return start, end


def list_usage_events(
    db: Session,
    *,
    limit: int = 50,
    offset: int = 0,
    day: str | None = None,
    event_type: str | None = None,
) -> tuple[int, list[dict[str, Any]]]:
    q = db.query(UsageEvent)
    if event_type:
        if event_type not in EVENT_TYPES:
            return 0, []
        q = q.filter(UsageEvent.event_type == event_type)
    else:
        # Default logbook: action types only — do not flood with page_view.
        q = q.filter(UsageEvent.event_type.in_(ACTION_EVENT_TYPES))
    if day:
        d = _parse_day(day)
        start, end = _day_bounds(d)
        q = q.filter(UsageEvent.created_at >= start, UsageEvent.created_at < end)
    total = q.count()
    rows = (
        q.order_by(UsageEvent.created_at.desc(), UsageEvent.id.desc())
        .offset(max(0, offset))
        .limit(min(max(1, limit), 200))
        .all()
    )
    user_ids = {r.user_id for r in rows if r.user_id is not None}
    users = (
        {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()}
        if user_ids
        else {}
    )
    items: list[dict[str, Any]] = []
    for r in rows:
        u = users.get(r.user_id) if r.user_id is not None else None
        items.append(
            {
                "id": r.id,
                "user_id": r.user_id,
                "email": r.email,
                "display_name": (u.display_name if u else "") or "",
                "username": (u.username if u else None),
                "event_type": r.event_type,
                "created_at": r.created_at,
                "metadata": r.metadata_json or {},
            }
        )
    return total, items


def _page_from_meta(meta: dict[str, Any] | None) -> str | None:
    if not meta:
        return None
    page = meta.get("page")
    if isinstance(page, str) and page in PAGE_PATHS:
        return page
    path = meta.get("path")
    if isinstance(path, str):
        return page_key_for_path(path)
    return None


def _aggregate_bucket(
    db: Session,
    start: datetime,
    end: datetime,
) -> dict[str, Any]:
    rows = (
        db.query(UsageEvent.event_type, UsageEvent.user_id, UsageEvent.metadata_json)
        .filter(UsageEvent.created_at >= start, UsageEvent.created_at < end)
        .all()
    )
    logins = 0
    login_users: set[int] = set()
    charts = 0
    protocols = 0
    page_visits = _empty_page_visits()
    page_users: dict[str, set[int]] = {k: set() for k in PAGE_KEYS}
    for et, uid, meta in rows:
        if et == "login":
            logins += 1
            if uid is not None:
                login_users.add(uid)
        elif et == "chart_generated":
            charts += 1
        elif et == "protocol_generated":
            protocols += 1
        elif et == "page_view":
            page = _page_from_meta(meta if isinstance(meta, dict) else None)
            if page is None:
                continue
            page_visits[page]["views"] += 1
            if uid is not None:
                page_users[page].add(uid)
    for k in PAGE_KEYS:
        page_visits[k]["unique_users"] = len(page_users[k])
    return {
        "logins": logins,
        "unique_users_logged_in": len(login_users),
        "charts_generated": charts,
        "protocols_generated": protocols,
        "page_visits": page_visits,
    }


def stats_daily(
    db: Session,
    *,
    from_day: date | None = None,
    to_day: date | None = None,
) -> list[dict[str, Any]]:
    today = datetime.utcnow().date()
    end_d = to_day or today
    start_d = from_day or (end_d - timedelta(days=13))
    if start_d > end_d:
        start_d, end_d = end_d, start_d
    out: list[dict[str, Any]] = []
    d = start_d
    while d <= end_d:
        start, end = _day_bounds(d)
        agg = _aggregate_bucket(db, start, end)
        out.append({"day": d.isoformat(), **agg})
        d += timedelta(days=1)
    return out


def stats_weekly(
    db: Session,
    *,
    weeks: int = 12,
) -> list[dict[str, Any]]:
    today = datetime.utcnow().date()
    # Monday of current ISO week
    monday = today - timedelta(days=today.weekday())
    out: list[dict[str, Any]] = []
    for i in range(weeks - 1, -1, -1):
        week_start = monday - timedelta(weeks=i)
        week_end = week_start + timedelta(days=7)
        start = datetime(week_start.year, week_start.month, week_start.day)
        end = datetime(week_end.year, week_end.month, week_end.day)
        iso = week_start.isocalendar()
        key = f"{iso.year}-W{iso.week:02d}"
        agg = _aggregate_bucket(db, start, end)
        out.append({"week": key, "week_start": week_start.isoformat(), **agg})
    return out


def stats_monthly(
    db: Session,
    *,
    months: int = 12,
) -> list[dict[str, Any]]:
    today = datetime.utcnow().date()
    # First day of current month, then walk back
    first = date(today.year, today.month, 1)
    months_list: list[date] = []
    cur = first
    for _ in range(months):
        months_list.append(cur)
        if cur.month == 1:
            cur = date(cur.year - 1, 12, 1)
        else:
            cur = date(cur.year, cur.month - 1, 1)
    months_list.reverse()
    out: list[dict[str, Any]] = []
    for m_start in months_list:
        if m_start.month == 12:
            m_end = date(m_start.year + 1, 1, 1)
        else:
            m_end = date(m_start.year, m_start.month + 1, 1)
        start = datetime(m_start.year, m_start.month, m_start.day)
        end = datetime(m_end.year, m_end.month, m_end.day)
        key = f"{m_start.year:04d}-{m_start.month:02d}"
        agg = _aggregate_bucket(db, start, end)
        out.append({"month": key, **agg})
    return out


def backfill_usage_from_history(db: Session) -> dict[str, int]:
    """Idempotent synthetic events from natal_charts / weekly_protocols."""
    added_charts = 0
    added_protocols = 0

    existing_chart_ids: set[int] = set()
    existing_protocol_ids: set[int] = set()
    for ev in db.query(UsageEvent).filter(
        UsageEvent.event_type.in_(("chart_generated", "protocol_generated"))
    ).all():
        meta = ev.metadata_json or {}
        if ev.event_type == "chart_generated" and meta.get("natal_chart_id") is not None:
            try:
                existing_chart_ids.add(int(meta["natal_chart_id"]))
            except (TypeError, ValueError):
                pass
        if ev.event_type == "protocol_generated" and meta.get("protocol_id") is not None:
            try:
                existing_protocol_ids.add(int(meta["protocol_id"]))
            except (TypeError, ValueError):
                pass

    users = {u.id: u for u in db.query(User).all()}

    for row in db.query(NatalChart).all():
        if row.id in existing_chart_ids:
            continue
        u = users.get(row.user_id)
        db.add(
            UsageEvent(
                user_id=row.user_id,
                email=(u.email if u else "")[:255],
                event_type="chart_generated",
                created_at=row.created_at or datetime.utcnow(),
                metadata_json={
                    "natal_chart_id": row.id,
                    "saved": True,
                    "slot_kind": getattr(row, "slot_kind", None) or "self",
                    "backfill": True,
                },
            )
        )
        added_charts += 1

    for row in db.query(WeeklyProtocol).all():
        if row.id in existing_protocol_ids:
            continue
        u = users.get(row.user_id)
        db.add(
            UsageEvent(
                user_id=row.user_id,
                email=(u.email if u else "")[:255],
                event_type="protocol_generated",
                created_at=row.created_at or datetime.utcnow(),
                metadata_json={
                    "protocol_id": row.id,
                    "natal_chart_id": None,
                    "backfill": True,
                },
            )
        )
        added_protocols += 1

    if added_charts or added_protocols:
        db.commit()
    return {"charts": added_charts, "protocols": added_protocols}


# --- Admin User Insights (Overview pulse / Insights / People) -----------------

HKT = ZoneInfo("Asia/Hong_Kong")


def _utcnow() -> datetime:
    return datetime.utcnow()


def _as_naive_utc(dt: datetime) -> datetime:
    """Normalize aware/naive datetimes to naive UTC for comparisons with stored columns."""
    if dt.tzinfo is None:
        return dt
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def hkt_day_bounds_utc(d: date) -> tuple[datetime, datetime]:
    """UTC-naive [start, end) covering one Asia/Hong_Kong calendar day."""
    start_hkt = datetime(d.year, d.month, d.day, 0, 0, 0, tzinfo=HKT)
    end_hkt = start_hkt + timedelta(days=1)
    return _as_naive_utc(start_hkt), _as_naive_utc(end_hkt)


def hkt_today_date() -> date:
    return datetime.now(HKT).date()


def is_seed_or_dev_user(user: User) -> bool:
    """Heuristic: local/test emails are seed/dev accounts for total-account pulse."""
    email = (user.email or "").strip().lower()
    if email.endswith(".local"):
        return True
    if email.endswith("@test.hd-biohack.local"):
        return True
    return False


def touch_last_login(db: Session, user: User, when: datetime | None = None) -> None:
    """Persist last_login_at on the request session (caller commits)."""
    user.last_login_at = when or _utcnow()


def overview_new_user_pulse(db: Session) -> dict[str, Any]:
    """Overview pulse: new today (HKT), new this week vs last week, total accounts."""
    today = hkt_today_date()
    start_today, end_today = hkt_day_bounds_utc(today)
    # This week = last 7 HKT days including today
    week_start_day = today - timedelta(days=6)
    start_week, _ = hkt_day_bounds_utc(week_start_day)
    prev_week_start_day = week_start_day - timedelta(days=7)
    start_prev, end_prev = hkt_day_bounds_utc(prev_week_start_day)
    # end_prev should be start of this week window
    end_prev = start_week

    users = db.query(User).all()
    new_today: list[dict[str, Any]] = []
    new_week = 0
    new_prev_week = 0
    total_real = 0
    for u in users:
        created = u.created_at
        if created is None:
            continue
        if not is_seed_or_dev_user(u):
            total_real += 1
        if start_today <= created < end_today:
            new_today.append(
                {
                    "id": u.id,
                    "display_name": u.display_name or "",
                    "username": u.username,
                    "email": u.email,
                    "created_at": created,
                }
            )
        if start_week <= created < end_today:
            new_week += 1
        if start_prev <= created < end_prev:
            new_prev_week += 1

    new_today.sort(key=lambda x: x["created_at"], reverse=True)

    # 24h signup banner from usage_events (best-effort) + created_at names
    since_24h = _utcnow() - timedelta(hours=24)
    signup_rows = (
        db.query(UsageEvent)
        .filter(UsageEvent.event_type == "signup", UsageEvent.created_at >= since_24h)
        .order_by(UsageEvent.created_at.desc())
        .limit(20)
        .all()
    )
    banner: list[dict[str, Any]] = []
    seen_ids: set[int] = set()
    user_map = {u.id: u for u in users}
    for r in signup_rows:
        u = user_map.get(r.user_id) if r.user_id is not None else None
        banner.append(
            {
                "user_id": r.user_id,
                "display_name": (u.display_name if u else "") or "",
                "email": r.email or (u.email if u else ""),
                "created_at": r.created_at,
                "source": "signup_event",
            }
        )
        if r.user_id is not None:
            seen_ids.add(r.user_id)
    # Also surface created_at in last 24h if event missing
    for u in users:
        if u.id in seen_ids or u.created_at is None:
            continue
        if u.created_at >= since_24h:
            banner.append(
                {
                    "user_id": u.id,
                    "display_name": u.display_name or "",
                    "email": u.email,
                    "created_at": u.created_at,
                    "source": "created_at",
                }
            )
    banner.sort(key=lambda x: x["created_at"], reverse=True)

    spark_delta = new_week - new_prev_week
    return {
        "new_today_count": len(new_today),
        "new_today": new_today,
        "new_this_week": new_week,
        "new_last_week": new_prev_week,
        "week_spark_delta": spark_delta,
        "total_accounts": total_real,
        "total_accounts_including_seed": len(users),
        "signups_last_24h": banner[:10],
    }


def _median(nums: list[float]) -> float | None:
    if not nums:
        return None
    s = sorted(nums)
    n = len(s)
    mid = n // 2
    if n % 2:
        return float(s[mid])
    return float((s[mid - 1] + s[mid]) / 2.0)


def _has_me_natal(db: Session, user_id: int) -> bool:
    row = (
        db.query(NatalChart.id)
        .filter(NatalChart.user_id == user_id, NatalChart.slot_kind != "friend")
        .first()
    )
    return row is not None


def _me_natal_within_days(db: Session, user: User, days: int = 7) -> bool:
    if user.created_at is None:
        return False
    deadline = user.created_at + timedelta(days=days)
    row = (
        db.query(NatalChart)
        .filter(
            NatalChart.user_id == user.id,
            NatalChart.slot_kind != "friend",
            NatalChart.created_at <= deadline,
        )
        .order_by(NatalChart.created_at.asc())
        .first()
    )
    return row is not None


def compute_insights(db: Session, *, period_days: int = 30) -> dict[str, Any]:
    """Cohort averages for Insights tab. period_days in {7,30,90}."""
    if period_days not in (7, 30, 90):
        period_days = 30
    now = _utcnow()
    start = now - timedelta(days=period_days)

    # Active = distinct users with ≥1 login in period
    login_rows = (
        db.query(UsageEvent.user_id, UsageEvent.created_at)
        .filter(
            UsageEvent.event_type == "login",
            UsageEvent.created_at >= start,
            UsageEvent.user_id.isnot(None),
        )
        .all()
    )
    login_by_user: dict[int, list[datetime]] = {}
    for uid, created in login_rows:
        if uid is None:
            continue
        login_by_user.setdefault(uid, []).append(created)
    active_ids = set(login_by_user.keys())
    active_users = len(active_ids)
    total_logins = sum(len(v) for v in login_by_user.values())
    avg_logins = (total_logins / active_users) if active_users else 0.0

    # New users by created_at
    new_users_list = (
        db.query(User).filter(User.created_at >= start, User.created_at <= now).all()
    )
    new_users = len(new_users_list)

    # Median days since last login (all accounts with a last_login_at or login event)
    days_since: list[float] = []
    all_users = db.query(User).all()
    for u in all_users:
        last = u.last_login_at
        if last is None:
            # fallback: latest login event
            last_ev = (
                db.query(UsageEvent.created_at)
                .filter(UsageEvent.user_id == u.id, UsageEvent.event_type == "login")
                .order_by(UsageEvent.created_at.desc())
                .first()
            )
            last = last_ev[0] if last_ev else None
        if last is None:
            continue
        days_since.append(max(0.0, (now - last).total_seconds() / 86400.0))
    median_days = _median(days_since)

    # Activation %: new users who saved Me natal within 7 days
    activated = 0
    for u in new_users_list:
        if _me_natal_within_days(db, u, 7):
            activated += 1
    activation_pct = (100.0 * activated / new_users) if new_users else None

    # Page views in period for active users
    page_rows = (
        db.query(UsageEvent.user_id, UsageEvent.metadata_json)
        .filter(
            UsageEvent.event_type == "page_view",
            UsageEvent.created_at >= start,
            UsageEvent.user_id.isnot(None),
        )
        .all()
    )
    page_counts: dict[str, int] = {k: 0 for k in PAGE_KEYS}
    today_viewers: set[int] = set()
    for uid, meta in page_rows:
        if uid not in active_ids:
            continue
        page = _page_from_meta(meta if isinstance(meta, dict) else None)
        if page is None:
            continue
        page_counts[page] += 1
        if page == "today":
            today_viewers.add(uid)
    avg_page_visits = {
        k: (page_counts[k] / active_users) if active_users else 0.0 for k in PAGE_KEYS
    }
    today_engagement_pct = (
        (100.0 * len(today_viewers) / active_users) if active_users else None
    )

    # Charts & protocols among active
    chart_n = (
        db.query(UsageEvent)
        .filter(
            UsageEvent.event_type == "chart_generated",
            UsageEvent.created_at >= start,
            UsageEvent.user_id.in_(active_ids) if active_ids else False,
        )
        .count()
        if active_ids
        else 0
    )
    protocol_n = (
        db.query(UsageEvent)
        .filter(
            UsageEvent.event_type == "protocol_generated",
            UsageEvent.created_at >= start,
            UsageEvent.user_id.in_(active_ids) if active_ids else False,
        )
        .count()
        if active_ids
        else 0
    )
    avg_charts = (chart_n / active_users) if active_users else 0.0
    avg_protocols = (protocol_n / active_users) if active_users else 0.0

    # Return D1 / D7 among new users in period
    # D1: logged in again on calendar day after signup day (UTC day for simplicity vs HKT)
    d1_hit = 0
    d7_hit = 0
    for u in new_users_list:
        if u.created_at is None:
            continue
        signup_day = u.created_at.date()
        logins = (
            db.query(UsageEvent.created_at)
            .filter(UsageEvent.user_id == u.id, UsageEvent.event_type == "login")
            .all()
        )
        login_days = {row[0].date() for row in logins if row[0]}
        if (signup_day + timedelta(days=1)) in login_days:
            d1_hit += 1
        if (signup_day + timedelta(days=7)) in login_days:
            d7_hit += 1
    return_d1 = (100.0 * d1_hit / new_users) if new_users else None
    return_d7 = (100.0 * d7_hit / new_users) if new_users else None

    return {
        "period_days": period_days,
        "active_users": active_users,
        "new_users": new_users,
        "avg_logins_per_active": round(avg_logins, 2),
        "median_days_since_last_login": (
            round(median_days, 1) if median_days is not None else None
        ),
        "activation_pct": round(activation_pct, 1) if activation_pct is not None else None,
        "activation_count": activated,
        "today_engagement_pct": (
            round(today_engagement_pct, 1) if today_engagement_pct is not None else None
        ),
        "avg_page_visits_per_active": {k: round(v, 2) for k, v in avg_page_visits.items()},
        "avg_charts_per_active": round(avg_charts, 2),
        "avg_protocols_per_active": round(avg_protocols, 2),
        "return_d1_pct": round(return_d1, 1) if return_d1 is not None else None,
        "return_d7_pct": round(return_d7, 1) if return_d7 is not None else None,
    }


def list_admin_users(
    db: Session,
    *,
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
    sort: str = "joined_desc",
) -> tuple[int, list[dict[str, Any]]]:
    """Searchable People list — newest first by default."""
    from .config import get_settings
    from .entitlements import user_has_biohacking

    query = db.query(User)
    needle = (q or "").strip().lower()
    if needle:
        like = f"%{needle}%"
        query = query.filter(
            (User.email.ilike(like))
            | (User.username.ilike(like))
            | (User.display_name.ilike(like))
            | (User.first_name.ilike(like))
        )
    total = query.count()
    if sort == "last_login_desc":
        # SQLite-friendly: non-null last_login first, then newest.
        from sqlalchemy import case

        rows = (
            query.order_by(
                case((User.last_login_at.is_(None), 1), else_=0),
                User.last_login_at.desc(),
                User.id.desc(),
            )
            .offset(max(0, offset))
            .limit(min(max(1, limit), 200))
            .all()
        )
    else:
        rows = (
            query.order_by(User.created_at.desc(), User.id.desc())
            .offset(max(0, offset))
            .limit(min(max(1, limit), 200))
            .all()
        )

    beta = bool(get_settings().beta_full_access)
    items: list[dict[str, Any]] = []
    for u in rows:
        login_count = (
            db.query(UsageEvent)
            .filter(UsageEvent.user_id == u.id, UsageEvent.event_type == "login")
            .count()
        )
        me_natal = _has_me_natal(db, u.id)
        last_active_row = (
            db.query(UsageEvent.created_at)
            .filter(UsageEvent.user_id == u.id)
            .order_by(UsageEvent.created_at.desc())
            .first()
        )
        last_active = last_active_row[0] if last_active_row else u.last_login_at
        items.append(
            {
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "display_name": u.display_name or "",
                "first_name": u.first_name,
                "created_at": u.created_at,
                "last_login_at": u.last_login_at,
                "login_count": login_count,
                "subscription_tier": u.subscription_tier,
                "biohacking_enabled": bool(u.biohacking_enabled),
                "biohacking_unlocked": user_has_biohacking(u),
                "beta_full_access": beta,
                "has_me_natal": me_natal,
                "last_active_at": last_active,
                "is_seed_or_dev": is_seed_or_dev_user(u),
            }
        )
    return total, items


def get_admin_user_detail(db: Session, user_id: int) -> dict[str, Any] | None:
    """Per-user rollup — no passwords, tokens, birth data, or natal dumps."""
    from .config import get_settings
    from .entitlements import user_has_biohacking

    u = db.get(User, user_id)
    if not u:
        return None
    beta = bool(get_settings().beta_full_access)

    login_times = [
        r[0]
        for r in db.query(UsageEvent.created_at)
        .filter(UsageEvent.user_id == u.id, UsageEvent.event_type == "login")
        .order_by(UsageEvent.created_at.asc())
        .all()
    ]
    first_login = login_times[0] if login_times else None
    last_login = u.last_login_at or (login_times[-1] if login_times else None)
    days_since = None
    if last_login is not None:
        days_since = max(0.0, (_utcnow() - last_login).total_seconds() / 86400.0)

    charts = (
        db.query(NatalChart)
        .filter(NatalChart.user_id == u.id)
        .all()
    )
    me_natal = any((c.slot_kind or "self") != "friend" for c in charts)
    people_count = sum(1 for c in charts if (c.slot_kind or "self") == "friend")
    partner_tagged = any((getattr(c, "role", None) or "") == "partner" for c in charts)

    charts_gen = (
        db.query(UsageEvent)
        .filter(UsageEvent.user_id == u.id, UsageEvent.event_type == "chart_generated")
        .count()
    )
    protocols_gen = (
        db.query(UsageEvent)
        .filter(UsageEvent.user_id == u.id, UsageEvent.event_type == "protocol_generated")
        .count()
    )
    page_views: dict[str, int] = {k: 0 for k in PAGE_KEYS}
    for meta, in (
        db.query(UsageEvent.metadata_json)
        .filter(UsageEvent.user_id == u.id, UsageEvent.event_type == "page_view")
        .all()
    ):
        page = _page_from_meta(meta if isinstance(meta, dict) else None)
        if page:
            page_views[page] += 1

    recent_rows = (
        db.query(UsageEvent)
        .filter(UsageEvent.user_id == u.id)
        .order_by(UsageEvent.created_at.desc(), UsageEvent.id.desc())
        .limit(20)
        .all()
    )
    recent = [
        {
            "id": r.id,
            "user_id": r.user_id,
            "email": r.email,
            "display_name": u.display_name or "",
            "username": u.username,
            "event_type": r.event_type,
            "created_at": r.created_at,
            "metadata": r.metadata_json or {},
        }
        for r in recent_rows
    ]

    kit_count = (
        db.query(SupplementInventory)
        .filter(SupplementInventory.user_id == u.id, SupplementInventory.active.is_(True))
        .count()
    )
    move_completions = (
        db.query(ProtocolCompletion)
        .filter(
            ProtocolCompletion.user_id == u.id,
            ProtocolCompletion.done.is_(True),
            ProtocolCompletion.kind == "move",
        )
        .count()
    )

    return {
        "id": u.id,
        "email": u.email,
        "username": u.username,
        "display_name": u.display_name or "",
        "first_name": u.first_name,
        "created_at": u.created_at,
        "auth_provider": u.auth_provider,
        "subscription_tier": u.subscription_tier,
        "biohacking_enabled": bool(u.biohacking_enabled),
        "biohacking_unlocked": user_has_biohacking(u),
        "beta_full_access": beta,
        "login_count": len(login_times),
        "first_login_at": first_login,
        "last_login_at": last_login,
        "days_since_last_login": round(days_since, 1) if days_since is not None else None,
        "has_me_natal": me_natal,
        "people_count": people_count,
        "partner_tagged": partner_tagged,
        "charts_generated": charts_gen,
        "protocols_generated": protocols_gen,
        "page_views": page_views,
        "recent_events": recent,
        "kit_items_active": kit_count,
        "move_completions": move_completions,
        "is_seed_or_dev": is_seed_or_dev_user(u),
    }
