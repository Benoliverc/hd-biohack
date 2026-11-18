"""Register default Pro, set-tier any person, overlay-off entitlements, free-to-pro migration."""

from __future__ import annotations

import os
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ["SEED_DEV_USERS"] = "false"
os.environ["BETA_FULL_ACCESS"] = "false"
os.environ["SQLITE_PATH"] = str(Path("/tmp/hd-biohack-test-new-users-pro-admin-switch.db"))
os.environ["ADMIN_EMAILS"] = "admin@test.hd-biohack.local,benjamin@test.hd-biohack.local"

Path(os.environ["SQLITE_PATH"]).unlink(missing_ok=True)

from app.config import get_settings

get_settings.cache_clear()

import pytest
from fastapi.testclient import TestClient

from app.auth import hash_password
from app.database import (
    FREE_USERS_TO_PRO_MIGRATION,
    SessionLocal,
    init_db,
    upgrade_existing_free_users_to_pro,
)
from app.entitlements import user_has_biohacking
from app.main import app
from app.models import DataMigration, User


client = TestClient(app)


@pytest.fixture(autouse=True)
def _overlay_off_and_isolated_settings():
    prev = os.environ.get("BETA_FULL_ACCESS")
    os.environ["BETA_FULL_ACCESS"] = "false"
    os.environ["SEED_DEV_USERS"] = "false"
    get_settings.cache_clear()
    yield
    if prev is None:
        os.environ.pop("BETA_FULL_ACCESS", None)
    else:
        os.environ["BETA_FULL_ACCESS"] = prev
    get_settings.cache_clear()



def _db():
    return SessionLocal()


def _ensure_admin_and_member() -> tuple[User, User]:
    init_db()
    db = _db()
    try:
        admin = db.query(User).filter(User.email == "admin@test.hd-biohack.local").first()
        if not admin:
            admin = User(
                email="admin@test.hd-biohack.local",
                username="AdminSwitch",
                display_name="AdminSwitch",
                password_hash=hash_password("adminpass"),
                auth_provider="password",
                subscription_tier="biohacker_pro",
                biohacking_enabled=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        member = db.query(User).filter(User.email == "member@test.hd-biohack.local").first()
        if not member:
            member = User(
                email="member@test.hd-biohack.local",
                username="MemberSwitch",
                display_name="MemberSwitch",
                password_hash=hash_password("memberpass"),
                auth_provider="password",
                subscription_tier="free",
                biohacking_enabled=False,
            )
            db.add(member)
            db.commit()
            db.refresh(member)
        admin_id, member_id = admin.id, member.id
    finally:
        db.close()

    db2 = _db()
    try:
        a = db2.get(User, admin_id)
        n = db2.get(User, member_id)
        db2.expunge(a)
        db2.expunge(n)
        return a, n
    finally:
        db2.close()


def _auth_headers(username: str, password: str) -> dict[str, str]:
    r = client.post("/auth/login", json={"username": username, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_register_defaults_to_pro_and_caller_cannot_pick_tier():
    init_db()
    email = f"new.pro.{int(datetime.utcnow().timestamp())}@example.com"
    r = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "password1",
            "first_name": "Ada",
            "subscription_tier": "free",
            "biohacking_enabled": False,
        },
    )
    assert r.status_code == 200, r.text
    user = r.json()["user"]
    assert user["subscription_tier"] == "biohacker_pro"
    assert user["biohacking_enabled"] is True
    assert user["biohacking_unlocked"] is True
    assert get_settings().beta_full_access is False

    db = _db()
    try:
        row = db.get(User, user["id"])
        assert row is not None
        assert row.subscription_tier == "biohacker_pro"
        assert row.biohacking_enabled is True
        assert user_has_biohacking(row) is True
    finally:
        db.close()

    locked = client.post(
        "/users",
        json={"email": "hacker@example.com", "subscription_tier": "free", "display_name": "Nope"},
    )
    assert locked.status_code == 403
    print("PASS: register default is Pro; caller cannot pick a tier")


def test_set_tier_admin_may_change_any_person_non_admin_cannot():
    admin, member = _ensure_admin_and_member()
    admin_h = _auth_headers("AdminSwitch", "adminpass")
    member_h = _auth_headers("MemberSwitch", "memberpass")

    r_self = client.patch(
        f"/users/{member.id}/tier?tier=biohacker_pro&actor_user_id={member.id}",
        headers=member_h,
    )
    assert r_self.status_code == 403, r_self.text

    r_spoof = client.patch(
        f"/users/{member.id}/tier?tier=biohacker_pro&actor_user_id={admin.id}",
        headers=member_h,
    )
    assert r_spoof.status_code == 403, r_spoof.text

    r_unauth = client.patch(
        f"/users/{member.id}/tier?tier=biohacker_pro&actor_user_id={admin.id}"
    )
    assert r_unauth.status_code == 401, r_unauth.text

    r_bad = client.patch(
        f"/users/{member.id}/tier?tier=enterprise&actor_user_id={admin.id}",
        headers=admin_h,
    )
    assert r_bad.status_code == 400, r_bad.text

    r_pro = client.patch(
        f"/users/{member.id}/tier?tier=biohacker_pro&actor_user_id={admin.id}",
        headers=admin_h,
    )
    assert r_pro.status_code == 200, r_pro.text
    assert r_pro.json()["subscription_tier"] == "biohacker_pro"
    assert r_pro.json()["biohacking_enabled"] is True

    r_free = client.patch(
        f"/users/{member.id}/tier?tier=free&actor_user_id={admin.id}",
        headers=admin_h,
    )
    assert r_free.status_code == 200, r_free.text
    assert r_free.json()["subscription_tier"] == "free"
    assert r_free.json()["biohacking_enabled"] is False

    db = _db()
    try:
        row = db.get(User, member.id)
        assert row is not None
        assert row.subscription_tier == "free"
        assert row.biohacking_enabled is False
    finally:
        db.close()
    print("PASS: admin may change any person; non-admin cannot; flag stays in sync")


def test_entitlement_follows_stored_plan_when_overlay_off():
    assert get_settings().beta_full_access is False

    class _Free:
        biohacking_enabled = False
        subscription_tier = "free"

    class _Pro:
        biohacking_enabled = True
        subscription_tier = "biohacker_pro"

    class _MismatchFreeFlag:
        biohacking_enabled = True
        subscription_tier = "free"

    class _OtherPlan:
        biohacking_enabled = False
        subscription_tier = "enterprise"

    assert user_has_biohacking(_Free()) is False
    assert user_has_biohacking(_Pro()) is True
    # In-sync flag still unlocks if somehow set, but there is no third plan value.
    assert user_has_biohacking(_MismatchFreeFlag()) is True
    assert user_has_biohacking(_OtherPlan()) is False

    admin, member = _ensure_admin_and_member()
    admin_h = _auth_headers("AdminSwitch", "adminpass")
    member_h = _auth_headers("MemberSwitch", "memberpass")

    client.patch(
        f"/users/{member.id}/tier?tier=free&actor_user_id={admin.id}",
        headers=admin_h,
    )
    me_free = client.get("/auth/me", headers=member_h)
    assert me_free.status_code == 200
    assert me_free.json()["subscription_tier"] == "free"
    assert me_free.json()["biohacking_enabled"] is False
    assert me_free.json()["biohacking_unlocked"] is False
    assert me_free.json()["beta_full_access"] is False

    client.patch(
        f"/users/{member.id}/tier?tier=biohacker_pro&actor_user_id={admin.id}",
        headers=admin_h,
    )
    me_pro = client.get("/auth/me", headers=member_h)
    assert me_pro.status_code == 200
    assert me_pro.json()["subscription_tier"] == "biohacker_pro"
    assert me_pro.json()["biohacking_enabled"] is True
    assert me_pro.json()["biohacking_unlocked"] is True
    print("PASS: overlay off — free is gated, Pro is unlocked, no third grant")


def test_migration_upgrades_existing_free_and_leaves_pro_and_is_idempotent():
    init_db()
    db = _db()
    try:
        # Migration already applied on empty DB during init_db; seed two rows after.
        stamp = int(datetime.utcnow().timestamp())
        free = User(
            email=f"existing.free.{stamp}@example.com",
            display_name="Existing Free",
            auth_provider="password",
            subscription_tier="free",
            biohacking_enabled=False,
            password_hash=hash_password("password1"),
        )
        pro = User(
            email=f"existing.pro.{stamp}@example.com",
            display_name="Existing Pro",
            auth_provider="password",
            subscription_tier="biohacker_pro",
            biohacking_enabled=True,
            password_hash=hash_password("password1"),
        )
        db.add_all([free, pro])
        db.commit()
        free_id, pro_id = free.id, pro.id
        # Clear the ledger so this ship's migration can run against these rows.
        row = db.get(DataMigration, FREE_USERS_TO_PRO_MIGRATION)
        if row is not None:
            db.delete(row)
            db.commit()
        expected = (
            db.query(User).filter(User.subscription_tier == "free").count()
        )
    finally:
        db.close()

    upgraded = upgrade_existing_free_users_to_pro()
    assert upgraded == expected
    assert upgraded >= 1

    db = _db()
    try:
        free = db.get(User, free_id)
        pro = db.get(User, pro_id)
        assert free is not None and pro is not None
        assert free.subscription_tier == "biohacker_pro"
        assert free.biohacking_enabled is True
        assert pro.subscription_tier == "biohacker_pro"
        assert pro.biohacking_enabled is True
        assert db.get(DataMigration, FREE_USERS_TO_PRO_MIGRATION) is not None
    finally:
        db.close()

    # Second run is a no-op, including for a user an admin later switched to Free.
    db = _db()
    try:
        later = User(
            email=f"later.free.{stamp}@example.com",
            display_name="Later Free",
            auth_provider="password",
            subscription_tier="free",
            biohacking_enabled=False,
            password_hash=hash_password("password1"),
        )
        db.add(later)
        db.commit()
        later_id = later.id
    finally:
        db.close()

    assert upgrade_existing_free_users_to_pro() == 0

    db = _db()
    try:
        later = db.get(User, later_id)
        assert later is not None
        assert later.subscription_tier == "free"
        assert later.biohacking_enabled is False
    finally:
        db.close()
    print("PASS: migration upgrades existing free, leaves Pro, and does not re-run")
