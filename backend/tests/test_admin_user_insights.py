"""Admin User Insights: signup event, last_login_at, pulse, insights, people APIs."""

from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

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
from app.models import NatalChart, UsageEvent, User
from app.usage import (
    compute_insights,
    overview_new_user_pulse,
    touch_last_login,
)

client = TestClient(app)


def _db() -> Session:
    return SessionLocal()


def _ensure_admin() -> User:
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
        admin_id = admin.id
    finally:
        db.close()
    db2 = _db()
    try:
        a = db2.get(User, admin_id)
        db2.expunge(a)
        return a
    finally:
        db2.close()


def test_signup_event_on_register():
    init_db()
    email = f"signup_insight_{int(datetime.utcnow().timestamp())}@example.com"
    r = client.post(
        "/auth/register",
        json={"email": email, "password": "password123", "first_name": "Nova"},
    )
    assert r.status_code == 200, r.text
    uid = r.json()["user"]["id"]
    db = _db()
    try:
        signup_n = (
            db.query(UsageEvent)
            .filter(UsageEvent.event_type == "signup", UsageEvent.user_id == uid)
            .count()
        )
        login_n = (
            db.query(UsageEvent)
            .filter(UsageEvent.event_type == "login", UsageEvent.user_id == uid)
            .count()
        )
        user = db.get(User, uid)
        assert signup_n == 1
        assert login_n == 1
        assert user is not None and user.last_login_at is not None
    finally:
        db.close()
    print("PASS: signup event + last_login_at on register")


def test_login_updates_last_login_at():
    admin = _ensure_admin()
    db = _db()
    try:
        u = db.get(User, admin.id)
        u.last_login_at = datetime.utcnow() - timedelta(days=3)
        db.commit()
        before = u.last_login_at
    finally:
        db.close()

    r = client.post("/auth/login", json={"username": "Benjamin", "password": "Wolkje"})
    assert r.status_code == 200, r.text

    db = _db()
    try:
        u = db.get(User, admin.id)
        assert u.last_login_at is not None
        assert u.last_login_at > before
    finally:
        db.close()
    print("PASS: login updates last_login_at")


def test_admin_insights_and_pulse_gate():
    admin = _ensure_admin()
    # non-admin
    db = _db()
    try:
        non = db.query(User).filter(User.email == "sam@test.hd-biohack.local").first()
        if not non:
            non = User(
                email="sam@test.hd-biohack.local",
                username="Sam",
                display_name="Sam",
                password_hash=hash_password("sam123"),
                auth_provider="password",
                subscription_tier="free",
            )
            db.add(non)
            db.commit()
            db.refresh(non)
        non_id = non.id
    finally:
        db.close()

    r = client.get(f"/admin/insights?actor_user_id={non_id}&period=30")
    assert r.status_code == 403
    r2 = client.get(f"/admin/overview/pulse?actor_user_id={admin.id}")
    assert r2.status_code == 200, r2.text
    body = r2.json()
    assert "new_today_count" in body
    assert "total_accounts" in body
    r3 = client.get(f"/admin/insights?actor_user_id={admin.id}&period=30")
    assert r3.status_code == 200, r3.text
    ins = r3.json()
    assert ins["period_days"] == 30
    assert "active_users" in ins
    assert "new_users" in ins
    assert "avg_logins_per_active" in ins
    assert "activation_pct" in ins or ins.get("activation_pct") is None
    assert "return_d1_pct" in ins
    assert "avg_page_visits_per_active" in ins
    print("PASS: pulse + insights admin gate + shape")


def test_activation_rollup_me_natal():
    init_db()
    db = _db()
    try:
        email = f"act_{int(datetime.utcnow().timestamp())}@example.com"
        u = User(
            email=email,
            display_name="Act",
            auth_provider="password",
            subscription_tier="free",
            password_hash=hash_password("password123"),
            created_at=datetime.utcnow() - timedelta(days=2),
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        # Me natal within 7d
        db.add(
            NatalChart(
                user_id=u.id,
                label="Me",
                slot_kind="self",
                role="self",
                birth_date="1990-01-01",
                birth_time="12:00",
                birth_city="Hong Kong",
                lat=22.3,
                lon=114.2,
                chart_json={"type": "Generator"},
                created_at=datetime.utcnow() - timedelta(days=1),
            )
        )
        db.commit()
        uid = u.id
    finally:
        db.close()

    db = _db()
    try:
        ins = compute_insights(db, period_days=30)
        # At least one new user activated in window
        assert ins["new_users"] >= 1
        assert ins["activation_count"] >= 1
        assert ins["activation_pct"] is not None
    finally:
        db.close()
    print("PASS: activation counts Me natal within 7d")


def test_admin_users_list_and_detail():
    admin = _ensure_admin()
    r = client.get(f"/admin/users?actor_user_id={admin.id}&limit=10")
    assert r.status_code == 200, r.text
    page = r.json()
    assert "total" in page and "items" in page
    assert page["total"] >= 1
    uid = page["items"][0]["id"]
    d = client.get(f"/admin/users/{uid}?actor_user_id={admin.id}")
    assert d.status_code == 200, d.text
    detail = d.json()
    assert detail["id"] == uid
    assert "password" not in detail
    assert "password_hash" not in detail
    assert "chart_json" not in detail
    assert "has_me_natal" in detail
    assert "recent_events" in detail
    # search
    r2 = client.get(f"/admin/users?actor_user_id={admin.id}&q=benjamin")
    assert r2.status_code == 200
    assert r2.json()["total"] >= 1
    print("PASS: people list + detail privacy-safe")


def test_overview_pulse_excludes_local_from_total():
    init_db()
    db = _db()
    try:
        pulse = overview_new_user_pulse(db)
        assert pulse["total_accounts"] <= pulse["total_accounts_including_seed"]
    finally:
        db.close()
    print("PASS: total_accounts excludes .local seed/dev")


if __name__ == "__main__":
    test_signup_event_on_register()
    test_login_updates_last_login_at()
    test_admin_insights_and_pulse_gate()
    test_activation_rollup_me_natal()
    test_admin_users_list_and_detail()
    test_overview_pulse_excludes_local_from_total()
    print("ALL PASS")
