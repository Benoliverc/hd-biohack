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
    record_page_view,
    record_usage_event,
    stats_daily,
    stats_monthly,
    stats_weekly,
    _page_view_recent,
    _page_view_lock,
)


client = TestClient(app)


def _clear_page_view_debounce() -> None:
    with _page_view_lock:
        _page_view_recent.clear()


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
    # Protocol endpoint now requires a saved natal chart for the user.
    save = client.post(
        "/chart/calculate",
        json={
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "Hong Kong",
            "user_id": admin.id,
            "save": True,
        },
    )
    assert save.status_code == 200, save.text
    natal_id = save.json().get("natal_chart_id")
    assert natal_id is not None

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
        json={"user_id": admin.id, "natal_chart_id": natal_id},
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
    test_page_view_known_path_records_metadata()
    test_page_view_unknown_path_writes_nothing()
    test_page_view_logged_out_counts_views_not_unique()
    test_page_view_logged_in_increments_views_and_unique()
    test_page_visits_in_week_month_rollups()
    test_default_events_exclude_page_view_pages_filter_includes()
    test_page_view_path_normalization()
    test_non_admin_still_403_on_usage_stats()
    print("ALL usage admin tests passed")



def test_page_view_known_path_records_metadata():
    _clear_page_view_debounce()
    admin, _ = _ensure_users()
    before = _db()
    try:
        n_before = (
            before.query(UsageEvent)
            .filter(UsageEvent.event_type == "page_view")
            .count()
        )
    finally:
        before.close()

    r = client.post("/usage/page-view", json={"path": "/biohack", "user_id": admin.id})
    assert r.status_code == 204, r.text

    after = _db()
    try:
        rows = (
            after.query(UsageEvent)
            .filter(UsageEvent.event_type == "page_view")
            .order_by(UsageEvent.id.desc())
            .all()
        )
        assert len(rows) == n_before + 1
        meta = rows[0].metadata_json or {}
        assert meta.get("page") == "protocols"
        assert meta.get("path") == "/biohack"
        assert rows[0].user_id == admin.id
        assert rows[0].email == admin.email
    finally:
        after.close()
    print("PASS: known path page_view metadata")


def test_page_view_unknown_path_writes_nothing():
    _clear_page_view_debounce()
    admin, _ = _ensure_users()
    before = _db()
    try:
        n_before = before.query(UsageEvent).filter(UsageEvent.event_type == "page_view").count()
    finally:
        before.close()

    r = client.post("/usage/page-view", json={"path": "/settings", "user_id": admin.id})
    assert r.status_code == 204
    r2 = client.post("/usage/page-view", json={"path": "/login"})
    assert r2.status_code == 204
    r3 = client.post("/usage/page-view", json={"path": "/admin"})
    assert r3.status_code == 204

    after = _db()
    try:
        n_after = after.query(UsageEvent).filter(UsageEvent.event_type == "page_view").count()
        assert n_after == n_before
    finally:
        after.close()
    print("PASS: unknown path no write")


def test_page_view_logged_out_counts_views_not_unique():
    _clear_page_view_debounce()
    day = __import__("datetime").datetime.utcnow().date()
    start = __import__("datetime").datetime(day.year, day.month, day.day)

    db = _db()
    try:
        db.query(UsageEvent).filter(
            UsageEvent.event_type == "page_view",
            UsageEvent.created_at >= start,
        ).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()

    _clear_page_view_debounce()
    r = client.post("/usage/page-view", json={"path": "/"})
    assert r.status_code == 204

    db = _db()
    try:
        row = (
            db.query(UsageEvent)
            .filter(UsageEvent.event_type == "page_view")
            .order_by(UsageEvent.id.desc())
            .first()
        )
        assert row is not None
        assert row.user_id is None
        assert row.email == ""
        meta = row.metadata_json or {}
        assert meta.get("page") == "home"
        assert meta.get("path") == "/"

        daily = stats_daily(db, from_day=day, to_day=day)
        assert daily[0]["page_visits"]["home"]["views"] >= 1
        assert daily[0]["page_visits"]["home"]["unique_users"] == 0
    finally:
        db.close()
    print("PASS: logged-out home views, unique=0")


def test_page_view_logged_in_increments_views_and_unique():
    _clear_page_view_debounce()
    admin, non = _ensure_users()
    day = __import__("datetime").datetime.utcnow().date()
    start = __import__("datetime").datetime(day.year, day.month, day.day)

    db = _db()
    try:
        db.query(UsageEvent).filter(
            UsageEvent.event_type == "page_view",
            UsageEvent.created_at >= start,
        ).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()

    _clear_page_view_debounce()
    assert client.post("/usage/page-view", json={"path": "/soul", "user_id": admin.id}).status_code == 204
    _clear_page_view_debounce()
    assert client.post("/usage/page-view", json={"path": "/soul", "user_id": admin.id}).status_code == 204
    _clear_page_view_debounce()
    assert client.post("/usage/page-view", json={"path": "/soul", "user_id": non.id}).status_code == 204

    db = _db()
    try:
        daily = stats_daily(db, from_day=day, to_day=day)
        soul = daily[0]["page_visits"]["soul"]
        assert soul["views"] == 3
        assert soul["unique_users"] == 2
    finally:
        db.close()
    print("PASS: logged-in views + unique")


def test_page_visits_in_week_month_rollups():
    db = _db()
    try:
        weekly = stats_weekly(db, weeks=2)
        monthly = stats_monthly(db, months=2)
        assert "page_visits" in weekly[-1]
        assert "page_visits" in monthly[-1]
        for key in ("home", "today", "chart", "protocols", "soul"):
            assert "views" in weekly[-1]["page_visits"][key]
            assert "unique_users" in weekly[-1]["page_visits"][key]
    finally:
        db.close()
    admin, _ = _ensure_users()
    r = client.get(f"/admin/usage/stats/weekly?actor_user_id={admin.id}")
    assert r.status_code == 200
    assert "page_visits" in r.json()[-1]
    r2 = client.get(f"/admin/usage/stats/monthly?actor_user_id={admin.id}")
    assert r2.status_code == 200
    assert "page_visits" in r2.json()[-1]
    print("PASS: week/month page_visits")


def test_default_events_exclude_page_view_pages_filter_includes():
    _clear_page_view_debounce()
    admin, _ = _ensure_users()
    # Ensure at least one page_view exists
    client.post("/usage/page-view", json={"path": "/transits", "user_id": admin.id})

    r_all = client.get(f"/admin/usage/events?actor_user_id={admin.id}&limit=200")
    assert r_all.status_code == 200
    items_all = r_all.json()["items"]
    assert all(i["event_type"] != "page_view" for i in items_all)

    r_pages = client.get(
        f"/admin/usage/events?actor_user_id={admin.id}&event_type=page_view&limit=200"
    )
    assert r_pages.status_code == 200
    items_pages = r_pages.json()["items"]
    assert r_pages.json()["total"] >= 1
    assert all(i["event_type"] == "page_view" for i in items_pages)
    print("PASS: default excludes page_view; filter returns only those")


def test_page_view_path_normalization():
    _clear_page_view_debounce()
    admin, _ = _ensure_users()
    r = client.post(
        "/usage/page-view",
        json={"path": "/profile?x=1#hash", "user_id": admin.id},
    )
    assert r.status_code == 204
    db = _db()
    try:
        row = (
            db.query(UsageEvent)
            .filter(UsageEvent.event_type == "page_view")
            .order_by(UsageEvent.id.desc())
            .first()
        )
        assert row is not None
        meta = row.metadata_json or {}
        assert meta.get("page") == "chart"
        assert meta.get("path") == "/profile"
        # No query in stored path
        assert "?" not in meta.get("path", "")
    finally:
        db.close()
    print("PASS: path normalization strips query/hash")


def test_non_admin_still_403_on_usage_stats():
    _, non = _ensure_users()
    assert client.get(f"/admin/usage/stats/daily?actor_user_id={non.id}").status_code == 403
    assert client.get(f"/admin/usage/events?actor_user_id={non.id}&event_type=page_view").status_code == 403
    print("PASS: non-admin 403 on usage (incl page_view filter)")

def test_set_tier_requires_admin_and_self_only():
    """PATCH /users/{id}/tier: admin + self only; open call rejected."""
    admin, non = _ensure_users()

    # Missing actor → 422
    r0 = client.patch(f"/users/{admin.id}/tier?tier=free")
    assert r0.status_code == 422, r0.text

    # Non-admin actor → 403
    r1 = client.patch(
        f"/users/{non.id}/tier?tier=biohacker_pro&actor_user_id={non.id}"
    )
    assert r1.status_code == 403, r1.text

    # Admin changing someone else → 403 (v1 self-only)
    r2 = client.patch(
        f"/users/{non.id}/tier?tier=biohacker_pro&actor_user_id={admin.id}"
    )
    assert r2.status_code == 403, r2.text

    # Admin self Free → Pro
    r3 = client.patch(
        f"/users/{admin.id}/tier?tier=free&actor_user_id={admin.id}"
    )
    assert r3.status_code == 200, r3.text
    body = r3.json()
    assert body["subscription_tier"] == "free"
    assert body["biohacking_enabled"] is False

    r4 = client.patch(
        f"/users/{admin.id}/tier?tier=biohacker_pro&actor_user_id={admin.id}"
    )
    assert r4.status_code == 200, r4.text
    body4 = r4.json()
    assert body4["subscription_tier"] == "biohacker_pro"
    assert body4["biohacking_enabled"] is True
    print("PASS: set_tier admin+self auth + Free↔Pro")

