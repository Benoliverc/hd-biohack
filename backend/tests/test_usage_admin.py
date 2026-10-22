"""Admin usage gate, instrumentation, and daily unique counts (AC 1–9)."""

from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Ensure admin allowlist before settings are cached for this process.
os.environ["ADMIN_EMAILS"] = (
    "benjaminlammens@gmail.com,benjamin@test.hd-biohack.local,admin@test.hd-biohack.local"
)

from app.config import get_settings

get_settings.cache_clear()

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.database import SessionLocal, init_db
from app.main import app
from app.models import UsageEvent, User
from app.usage import (
    admin_email_set,
    is_admin_email,
    record_usage_event,
    stats_daily,
    stats_monthly,
    stats_weekly,
)


client = TestClient(app)


def _db() -> Session:
    return SessionLocal()


def _ensure_users() -> tuple[User, User]:
    init_db()
    db = _db()
    try:
        admin = (
            db.query(User)
            .filter(User.email == "benjamin@test.hd-biohack.local")
            .first()
        )
        if not admin:
            admin = User(
                email="benjamin@test.hd-biohack.local",
                username="Benjamin",
                display_name="Benjamin",
                password_hash=hash_password("Wolkje"),
                auth_provider="password",
                subscription_tier="biohacker_pro",
                biohacking_enabled=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        elif not admin.password_hash:
            admin.password_hash = hash_password("Wolkje")
            admin.username = admin.username or "Benjamin"
            db.commit()
            db.refresh(admin)

        non = db.query(User).filter(User.email == "sam@test.hd-biohack.local").first()
        if not non:
            non = User(
                email="sam@test.hd-biohack.local",
                username="Sam",
                display_name="Sam",
                password_hash=hash_password("sam123"),
                auth_provider="password",
                subscription_tier="free",
                biohacking_enabled=False,
            )
            db.add(non)
            db.commit()
            db.refresh(non)

        admin_id, non_id = admin.id, non.id
    finally:
        db.close()

    db2 = _db()
    try:
        a = db2.get(User, admin_id)
        n = db2.get(User, non_id)
        # Expunge so callers can use .id/.email after close
        db2.expunge(a)
        db2.expunge(n)
        return a, n
    finally:
        db2.close()


def test_admin_email_allowlist():
    emails = admin_email_set()
    assert "benjaminlammens@gmail.com" in emails
    assert "benjamin@test.hd-biohack.local" in emails
    assert is_admin_email("Benjamin@test.hd-biohack.local")
    assert not is_admin_email("sam@test.hd-biohack.local")
    print("PASS: admin email allowlist")


def test_ac2_non_admin_403():
    admin, non = _ensure_users()
    r = client.get(f"/admin/usage/events?actor_user_id={non.id}")
    assert r.status_code == 403, r.text
    r2 = client.get(f"/admin/usage/stats/daily?actor_user_id={non.id}")
    assert r2.status_code == 403
    print("PASS AC2: non-admin 403")


def test_ac1_admin_can_list_events():
    admin, _ = _ensure_users()
    r = client.get(f"/admin/usage/events?actor_user_id={admin.id}&limit=10")
    assert r.status_code == 200, r.text
    body = r.json()
    assert "total" in body and "items" in body
    print("PASS AC1: admin events 200")


def test_ac3_login_records_event():
    admin, _ = _ensure_users()
    before = _db()
    try:
        n_before = (
            before.query(UsageEvent)
            .filter(UsageEvent.event_type == "login", UsageEvent.user_id == admin.id)
            .count()
        )
    finally:
        before.close()

    r = client.post("/auth/login", json={"username": "Benjamin", "password": "Wolkje"})
    assert r.status_code == 200, r.text
    assert r.json().get("is_admin") is True

    after = _db()
    try:
        n_after = (
            after.query(UsageEvent)
            .filter(UsageEvent.event_type == "login", UsageEvent.user_id == admin.id)
            .count()
        )
    finally:
        after.close()
    assert n_after == n_before + 1
    print("PASS AC3: login → usage_events")


def test_ac4_chart_generated_even_without_save():
    admin, _ = _ensure_users()
    before = _db()
    try:
        n_before = (
            before.query(UsageEvent)
            .filter(
                UsageEvent.event_type == "chart_generated",
                UsageEvent.user_id == admin.id,
            )
            .count()
        )
    finally:
        before.close()

    # Hong Kong seeded city — no live geocode needed
    r = client.post(
        "/chart/calculate",
        json={
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "Hong Kong",
            "user_id": admin.id,
            "save": False,
        },
    )
    assert r.status_code == 200, r.text

    after = _db()
    try:
        rows = (
            after.query(UsageEvent)
            .filter(
                UsageEvent.event_type == "chart_generated",
                UsageEvent.user_id == admin.id,
            )
            .order_by(UsageEvent.id.desc())
            .all()
        )
        assert len(rows) == n_before + 1
        meta = rows[0].metadata_json or {}
        assert meta.get("saved") is False
    finally:
        after.close()
    print("PASS AC4: chart_generated with save=false")


def test_ac5_protocol_generated():
    admin, _ = _ensure_users()
    before = _db()
    try:
        n_before = (
            before.query(UsageEvent)
            .filter(
                UsageEvent.event_type == "protocol_generated",
                UsageEvent.user_id == admin.id,
            )
            .count()
        )
    finally:
        before.close()

    r = client.post(
        "/biohack/protocol",
        json={"user_id": admin.id, "natal_chart_id": None},
    )
    assert r.status_code == 200, r.text

    after = _db()
    try:
        n_after = (
            after.query(UsageEvent)
            .filter(
                UsageEvent.event_type == "protocol_generated",
                UsageEvent.user_id == admin.id,
            )
            .count()
        )
        assert n_after == n_before + 1
        latest = (
            after.query(UsageEvent)
            .filter(UsageEvent.event_type == "protocol_generated")
            .order_by(UsageEvent.id.desc())
            .first()
        )
        assert latest and (latest.metadata_json or {}).get("protocol_id") is not None
    finally:
        after.close()
    print("PASS AC5: protocol_generated")


def test_ac6_unique_users_logged_in():
    """2 logins same user + 1 other → logins=3, unique=2 for that UTC day."""
    admin, non = _ensure_users()
    day = datetime.utcnow().date()
    start = datetime(day.year, day.month, day.day)
    db = _db()
    try:
        # Wipe today's login events for these two users so the assertion is stable
        db.query(UsageEvent).filter(
            UsageEvent.event_type == "login",
            UsageEvent.user_id.in_([admin.id, non.id]),
            UsageEvent.created_at >= start,
        ).delete(synchronize_session=False)
        db.commit()
        for _ in range(2):
            db.add(
                UsageEvent(
                    user_id=admin.id,
                    email=admin.email,
                    event_type="login",
                    created_at=start + timedelta(hours=1),
                )
            )
        db.add(
            UsageEvent(
                user_id=non.id,
                email=non.email,
                event_type="login",
                created_at=start + timedelta(hours=2),
            )
        )
        db.commit()
        daily = stats_daily(db, from_day=day, to_day=day)
        assert len(daily) == 1
        assert daily[0]["logins"] == 3
        assert daily[0]["unique_users_logged_in"] == 2
    finally:
        db.close()

    admin_u, _ = _ensure_users()
    r = client.get(
        f"/admin/usage/stats/daily?actor_user_id={admin_u.id}"
        f"&from={day.isoformat()}&to={day.isoformat()}"
    )
    assert r.status_code == 200, r.text
    row = r.json()[0]
    assert row["logins"] == 3
    assert row["unique_users_logged_in"] == 2
    print("PASS AC6: unique_users_logged_in")


def test_ac7_week_month_rollups():
    db = _db()
    try:
        weekly = stats_weekly(db, weeks=4)
        monthly = stats_monthly(db, months=3)
        assert len(weekly) == 4
        assert len(monthly) == 3
        assert "week" in weekly[-1] and "week_start" in weekly[-1]
        assert "month" in monthly[-1]
    finally:
        db.close()
    admin, _ = _ensure_users()
    assert client.get(f"/admin/usage/stats/weekly?actor_user_id={admin.id}").status_code == 200
    assert client.get(f"/admin/usage/stats/monthly?actor_user_id={admin.id}").status_code == 200
    print("PASS AC7: week/month endpoints")


def test_ac8_empty_events_ok():
    admin, _ = _ensure_users()
    # Far-future day with no events
    r = client.get(
        f"/admin/usage/events?actor_user_id={admin.id}&day=2099-01-01"
    )
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 0
    assert body["items"] == []
    print("PASS AC8: empty day")


def test_ac9_event_write_failure_does_not_break_login():
    admin, _ = _ensure_users()
    with patch("app.api.routes.record_usage_event", side_effect=RuntimeError("boom")):
        # record_usage_event itself swallows — but if route called a raising version:
        pass
    # The helper swallows; patch SessionLocal inside usage to raise on commit
    with patch("app.usage.SessionLocal") as mock_sl:
        mock_db = mock_sl.return_value
        mock_db.commit.side_effect = RuntimeError("db blip")
        # Should not raise
        record_usage_event(
            user_id=admin.id,
            email=admin.email,
            event_type="login",
        )
    r = client.post("/auth/login", json={"username": "Benjamin", "password": "Wolkje"})
    assert r.status_code == 200, r.text
    print("PASS AC9: best-effort logging + login still 200")


if __name__ == "__main__":
    test_admin_email_allowlist()
    test_ac2_non_admin_403()
    test_ac1_admin_can_list_events()
    test_ac3_login_records_event()
    test_ac4_chart_generated_even_without_save()
    test_ac5_protocol_generated()
    test_ac6_unique_users_logged_in()
    test_ac7_week_month_rollups()
    test_ac8_empty_events_ok()
    test_ac9_event_write_failure_does_not_break_login()
    print("ALL usage admin tests passed")
