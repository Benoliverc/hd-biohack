"""Product usage events + admin allowlist helpers."""

from __future__ import annotations

import logging
from datetime import date, datetime, timedelta
from typing import Any, Literal

from sqlalchemy.orm import Session

from .config import get_settings
from .database import SessionLocal
from .models import NatalChart, UsageEvent, User, WeeklyProtocol

logger = logging.getLogger(__name__)

EventType = Literal["login", "chart_generated", "protocol_generated"]
EVENT_TYPES = ("login", "chart_generated", "protocol_generated")


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
    if uid is None and not snap_email:
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


def _aggregate_bucket(
    db: Session,
    start: datetime,
    end: datetime,
) -> dict[str, int]:
    rows = (
        db.query(UsageEvent.event_type, UsageEvent.user_id)
        .filter(UsageEvent.created_at >= start, UsageEvent.created_at < end)
        .all()
    )
    logins = 0
    login_users: set[int] = set()
    charts = 0
    protocols = 0
    for et, uid in rows:
        if et == "login":
            logins += 1
            if uid is not None:
                login_users.add(uid)
        elif et == "chart_generated":
            charts += 1
        elif et == "protocol_generated":
            protocols += 1
    return {
        "logins": logins,
        "unique_users_logged_in": len(login_users),
        "charts_generated": charts,
        "protocols_generated": protocols,
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
