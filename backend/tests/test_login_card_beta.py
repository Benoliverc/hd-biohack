"""Login-card beta: register, login, reset, session auth, locked /users, beta entitlement."""

from __future__ import annotations

import os
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ["SEED_DEV_USERS"] = "false"
os.environ["BETA_FULL_ACCESS"] = "true"
os.environ["SQLITE_PATH"] = str(Path("/tmp/hd-biohack-test-login-card-beta.db"))
os.environ["RESEND_API_KEY"] = ""
os.environ["ADMIN_EMAILS"] = "admin@test.hd-biohack.local,benjamin@test.hd-biohack.local"

Path(os.environ["SQLITE_PATH"]).unlink(missing_ok=True)

from app.config import get_settings

get_settings.cache_clear()

from fastapi.testclient import TestClient

from app.auth import hash_password
from app.database import SessionLocal, init_db
from app.entitlements import user_has_biohacking
from app.main import app
from app.models import NatalChart, User
from app.session_auth import create_password_reset_token


def _client():
    return TestClient(app)


def test_register_login_session_and_locked_users():
    with _client() as c:
        assert c.get("/users").status_code == 401
        assert c.post("/users", json={"email": "x@y.com"}).status_code == 403

        r = c.post(
            "/auth/register",
            json={"email": "New.User@Example.com", "password": "password1", "first_name": "Ada"},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "access_token" in body
        user = body["user"]
        assert user["email"] == "new.user@example.com"
        assert user["first_name"] == "Ada"
        assert user["subscription_tier"] == "free"
        assert user["biohacking_enabled"] is False
        assert user["biohacking_unlocked"] is True
        assert user["auth_provider"] == "password"
        tok = body["access_token"]
        headers = {"Authorization": f"Bearer {tok}"}

        me = c.get("/auth/me", headers=headers)
        assert me.status_code == 200
        assert me.json()["id"] == user["id"]

        assert c.get(f"/users/{user['id']}", headers=headers).status_code == 200
        assert c.get("/users/99999", headers=headers).status_code == 403

        # Cannot pick tier via legacy create
        assert c.post(
            "/users",
            json={"email": "hacker@example.com", "subscription_tier": "biohacker_pro"},
        ).status_code == 403

        # Duplicate register — generic error (no existence leak)
        dup = c.post(
            "/auth/register",
            json={"email": "new.user@example.com", "password": "password1"},
        )
        assert dup.status_code == 401
        assert "didn't work" in dup.json()["detail"].lower() or "didn’t work" in dup.json()["detail"].lower() or "Email or password" in dup.json()["detail"]

        # Login by email
        login = c.post(
            "/auth/login",
            json={"username": "new.user@example.com", "password": "password1"},
        )
        assert login.status_code == 200
        assert login.json()["user"]["biohacking_unlocked"] is True

        # Bad login generic
        bad = c.post(
            "/auth/login",
            json={"username": "missing@example.com", "password": "password1"},
        )
        assert bad.status_code == 401
        assert "Email or password" in bad.json()["detail"]


def test_username_login_overlap_and_beta_off():
    with _client() as c:
        db = SessionLocal()
        try:
            if not db.query(User).filter(User.username == "SamOverlap").first():
                db.add(
                    User(
                        email="sam-overlap@test.hd-biohack.local",
                        username="SamOverlap",
                        display_name="SamOverlap",
                        password_hash=hash_password("sam12345"),
                        auth_provider="password",
                        subscription_tier="free",
                        biohacking_enabled=False,
                    )
                )
                db.commit()
        finally:
            db.close()

        by_user = c.post(
            "/auth/login",
            json={"username": "SamOverlap", "password": "sam12345"},
        )
        assert by_user.status_code == 200
        assert by_user.json()["user"]["biohacking_unlocked"] is True

        by_email = c.post(
            "/auth/login",
            json={"username": "sam-overlap@test.hd-biohack.local", "password": "sam12345"},
        )
        assert by_email.status_code == 200

        os.environ["BETA_FULL_ACCESS"] = "false"
        get_settings.cache_clear()
        try:
            off = c.post(
                "/auth/login",
                json={"username": "SamOverlap", "password": "sam12345"},
            )
            assert off.status_code == 200
            assert off.json()["user"]["biohacking_unlocked"] is False
            assert off.json()["user"]["subscription_tier"] == "free"

            class _U:
                biohacking_enabled = False
                subscription_tier = "free"

            assert user_has_biohacking(_U()) is False
        finally:
            os.environ["BETA_FULL_ACCESS"] = "true"
            get_settings.cache_clear()


def test_forgot_reset_and_logout_revokes():
    with _client() as c:
        reg = c.post(
            "/auth/register",
            json={"email": "reset.me@example.com", "password": "password1"},
        )
        assert reg.status_code == 200
        old_tok = reg.json()["access_token"]

        with patch("app.api.routes.send_password_reset_email", return_value=True) as mock_send:
            forgot = c.post(
                "/auth/forgot-password",
                json={"email": "reset.me@example.com"},
            )
            assert forgot.status_code == 200
            assert "If that email is on Baseline" in forgot.json()["message"]
            assert mock_send.call_count == 1

            # Missing email — same generic message, no send
            mock_send.reset_mock()
            missing = c.post(
                "/auth/forgot-password",
                json={"email": "nope@example.com"},
            )
            assert missing.status_code == 200
            assert missing.json()["message"] == forgot.json()["message"]
            assert mock_send.call_count == 0

        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == "reset.me@example.com").first()
            raw = create_password_reset_token(db, user)
        finally:
            db.close()

        reset = c.post(
            "/auth/reset-password",
            json={"token": raw, "password": "password2"},
        )
        assert reset.status_code == 200
        new_tok = reset.json()["access_token"]
        assert c.get("/auth/me", headers={"Authorization": f"Bearer {old_tok}"}).status_code == 401
        assert c.get("/auth/me", headers={"Authorization": f"Bearer {new_tok}"}).status_code == 200

        # Reuse token fails
        reuse = c.post(
            "/auth/reset-password",
            json={"token": raw, "password": "password3"},
        )
        assert reuse.status_code == 400

        c.post("/auth/logout", headers={"Authorization": f"Bearer {new_tok}"})
        assert c.get("/auth/me", headers={"Authorization": f"Bearer {new_tok}"}).status_code == 401

        # New password works
        login = c.post(
            "/auth/login",
            json={"username": "reset.me@example.com", "password": "password2"},
        )
        assert login.status_code == 200


def test_probe_cleanup_targets_only_probe_email():
    from app.main import cleanup_probe_user

    init_db()
    db = SessionLocal()
    try:
        probe = db.query(User).filter(User.email == "probe-should-not-create@example.invalid").first()
        if not probe:
            db.add(
                User(
                    email="probe-should-not-create@example.invalid",
                    display_name="probe",
                    auth_provider="password",
                    subscription_tier="free",
                    password_hash=hash_password("x"),
                )
            )
            db.commit()
        other = db.query(User).filter(User.email == "keep-me@example.com").first()
        if not other:
            db.add(
                User(
                    email="keep-me@example.com",
                    display_name="keep",
                    auth_provider="password",
                    subscription_tier="free",
                    password_hash=hash_password("x"),
                )
            )
            db.commit()
    finally:
        db.close()

    cleanup_probe_user()
    db = SessionLocal()
    try:
        assert (
            db.query(User).filter(User.email == "probe-should-not-create@example.invalid").first()
            is None
        )
        assert db.query(User).filter(User.email == "keep-me@example.com").first() is not None
    finally:
        db.close()


if __name__ == "__main__":
    test_register_login_session_and_locked_users()
    print("PASS register/login/session")
    test_username_login_overlap_and_beta_off()
    print("PASS username overlap + beta off")
    test_forgot_reset_and_logout_revokes()
    print("PASS forgot/reset/logout")
    test_probe_cleanup_targets_only_probe_email()
    print("PASS probe cleanup")


def _auth_headers(c, email: str, password: str = "password1") -> dict[str, str]:
    r = c.post("/auth/login", json={"username": email, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _register(c, email: str, password: str = "password1", first_name: str = "T") -> tuple[dict, dict]:
    r = c.post(
        "/auth/register",
        json={"email": email, "password": password, "first_name": first_name},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    headers = {"Authorization": f"Bearer {body['access_token']}"}
    return body["user"], headers


BIRTH = {
    "birth_date": "1990-05-15",
    "birth_time": "14:30:00",
    "birth_city": "Hong Kong",
    "lat": 22.3193,
    "lon": 114.1694,
}


def test_chart_save_inventory_protocol_soul_use_session_user():
    """Client-supplied user_id must not act as another user on the four leftover routes."""
    with _client() as c:
        victim, _ = _register(c, "victim-gate@example.com")
        attacker, headers = _register(c, "attacker-gate@example.com")
        # Victim id must not be writable by attacker session
        assert victim["id"] != attacker["id"]

        # 1) chart calculate save — unauthenticated save → 401
        bare = c.post(
            "/chart/calculate",
            json={**BIRTH, "user_id": victim["id"], "save": True, "label": "Me", "slot_kind": "self"},
        )
        assert bare.status_code == 401

        # save with attacker's session but victim's user_id → chart owned by attacker
        save = c.post(
            "/chart/calculate",
            json={
                **BIRTH,
                "user_id": victim["id"],
                "save": True,
                "label": "Me",
                "slot_kind": "self",
            },
            headers=headers,
        )
        assert save.status_code == 200, save.text
        natal_id = save.json()["natal_chart_id"]
        assert natal_id is not None
        db = SessionLocal()
        try:
            row = db.get(NatalChart, natal_id)
            assert row is not None
            assert row.user_id == attacker["id"]
            assert row.user_id != victim["id"]
        finally:
            db.close()

        # calc without save still works anonymously
        anon = c.post("/chart/calculate", json={**BIRTH, "save": False})
        assert anon.status_code == 200

        # 2) inventory POST — no auth → 401; spoofed user_id → lands on attacker
        assert c.post("/inventory", json={"user_id": victim["id"], "name": "Magnesium"}).status_code == 401
        inv = c.post(
            "/inventory",
            json={"user_id": victim["id"], "name": "Magnesium"},
            headers=headers,
        )
        assert inv.status_code == 200, inv.text
        inv_id = inv.json()["id"]
        db = SessionLocal()
        try:
            from app.models import SupplementInventory

            item = db.get(SupplementInventory, inv_id)
            assert item is not None
            assert item.user_id == attacker["id"]
        finally:
            db.close()

        # 3) protocol POST — no auth → 401; spoofed id cannot generate for victim
        assert (
            c.post(
                "/biohack/protocol",
                json={"user_id": victim["id"], "natal_chart_id": natal_id},
            ).status_code
            == 401
        )
        proto = c.post(
            "/biohack/protocol",
            json={"user_id": victim["id"], "natal_chart_id": natal_id},
            headers=headers,
        )
        assert proto.status_code == 200, proto.text

        # Victim needs a friend chart for soul — create second chart as friend under attacker (Pro via beta)
        friend = c.post(
            "/chart/calculate",
            json={
                **BIRTH,
                "birth_date": "1988-01-02",
                "user_id": victim["id"],
                "save": True,
                "label": "Friend",
                "slot_kind": "friend",
                "role": "person",
            },
            headers=headers,
        )
        assert friend.status_code == 200, friend.text
        friend_id = friend.json()["natal_chart_id"]

        # 4) soul sync — no auth → 401; spoofed user_id still uses attacker ownership check
        assert (
            c.post(
                "/soul/sync",
                json={
                    "user_id": victim["id"],
                    "self_chart_id": natal_id,
                    "friend_chart_id": friend_id,
                    "context": "life",
                },
            ).status_code
            == 401
        )
        soul = c.post(
            "/soul/sync",
            json={
                "user_id": victim["id"],
                "self_chart_id": natal_id,
                "friend_chart_id": friend_id,
                "context": "life",
            },
            headers=headers,
        )
        assert soul.status_code == 200, soul.text
