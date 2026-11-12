"""Settings account controls: change-password and in-app hard delete."""

from __future__ import annotations

import inspect
import os
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

_OWN_DB = Path("/tmp/hd-biohack-test-settings-account-controls.db")
if "SQLITE_PATH" not in os.environ:
    os.environ["SQLITE_PATH"] = str(_OWN_DB)
    _OWN_DB.unlink(missing_ok=True)

os.environ.setdefault("SEED_DEV_USERS", "false")
os.environ.setdefault("BETA_FULL_ACCESS", "true")
os.environ.setdefault("RESEND_API_KEY", "")

from app.config import get_settings

get_settings.cache_clear()

from fastapi.testclient import TestClient

from app.auth import verify_password
from app.database import SessionLocal, init_db
from app.main import app
from app.models import (
    AuthSession,
    GeocodeCache,
    NatalChart,
    PasswordResetToken,
    ProtocolCompletion,
    SupplementInventory,
    UsageEvent,
    User,
    UserBiometricsDaily,
    UserDailyIntention,
    WeeklyProtocol,
)
from app.session_auth import GENERIC_AUTH_ERROR, _rate, create_password_reset_token, create_session
from app.api import routes as routes_mod


def _client():
    init_db()
    _rate.clear()
    return TestClient(app)


def _register(c: TestClient, email: str, password: str, first_name: str = "Ada"):
    r = c.post(
        "/auth/register",
        json={"email": email, "password": password, "first_name": first_name},
    )
    assert r.status_code == 200, r.text
    return r.json()


def _headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}



def _seed_owned_rows(user_id: int, email: str, *, second_session: bool = True) -> dict[str, int]:
    """Seed at least one row in every user-owned table."""
    db = SessionLocal()
    ids: dict[str, int] = {}
    try:
        chart = NatalChart(
            user_id=user_id,
            label="Me",
            slot_kind="self",
            role="self",
            birth_date="1990-05-15",
            birth_time="14:30:00",
            birth_city="Hong Kong",
            lat=22.3193,
            lon=114.1694,
            timezone="Asia/Hong_Kong",
            chart_json={"type": "Generator"},
        )
        db.add(chart)
        db.flush()
        ids["chart"] = chart.id

        completion = ProtocolCompletion(
            user_id=user_id,
            chart_id=chart.id,
            day=date(2026, 11, 12),
            item_id="today-kit:magnesium",
            kind="kit",
            label="Magnesium",
            done=True,
        )
        db.add(completion)
        db.flush()
        ids["completion"] = completion.id

        inv = SupplementInventory(user_id=user_id, name="Magnesium", notes="", active=True)
        db.add(inv)
        db.flush()
        ids["inventory"] = inv.id

        proto = WeeklyProtocol(
            user_id=user_id,
            week_start=date(2026, 11, 10),
            protocol_json={"week": "test"},
        )
        db.add(proto)
        db.flush()
        ids["protocol"] = proto.id

        bio = UserBiometricsDaily(
            user_id=user_id,
            day=date(2026, 11, 12),
            hrv_ms=50.0,
        )
        db.add(bio)
        db.flush()
        ids["biometrics"] = bio.id

        intention = UserDailyIntention(
            user_id=user_id,
            day=date(2026, 11, 12),
            text="Breathe",
        )
        db.add(intention)
        db.flush()
        ids["intention"] = intention.id

        usage_uid = UsageEvent(user_id=user_id, email=email, event_type="login")
        db.add(usage_uid)
        usage_email_only = UsageEvent(user_id=None, email=email, event_type="signup")
        db.add(usage_email_only)
        db.flush()
        ids["usage_uid"] = usage_uid.id
        ids["usage_email"] = usage_email_only.id

        cache = db.query(GeocodeCache).filter(GeocodeCache.query_key == "hong-kong").first()
        if cache is None:
            cache = GeocodeCache(
                query_key="hong-kong",
                display_name="Hong Kong",
                lat=22.3193,
                lon=114.1694,
            )
            db.add(cache)
            db.flush()
        ids["geocode"] = cache.id

        db.commit()
    finally:
        db.close()

    # Reset token + optional second session after the first commit so helpers can commit safely.
    db = SessionLocal()
    try:
        user = db.get(User, user_id)
        assert user is not None
        raw_reset = create_password_reset_token(db, user)
        ids["reset_raw"] = 1
        if second_session:
            create_session(db, user)
        ids["reset_count"] = (
            db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).count()
        )
        ids["session_count"] = (
            db.query(AuthSession).filter(AuthSession.user_id == user_id).count()
        )
    finally:
        db.close()
    return ids


def _counts_for(user_id: int, email: str) -> dict[str, int]:
    db = SessionLocal()
    try:
        return {
            "completions": db.query(ProtocolCompletion)
            .filter(ProtocolCompletion.user_id == user_id)
            .count(),
            "charts": db.query(NatalChart).filter(NatalChart.user_id == user_id).count(),
            "inventory": db.query(SupplementInventory)
            .filter(SupplementInventory.user_id == user_id)
            .count(),
            "protocols": db.query(WeeklyProtocol).filter(WeeklyProtocol.user_id == user_id).count(),
            "biometrics": db.query(UserBiometricsDaily)
            .filter(UserBiometricsDaily.user_id == user_id)
            .count(),
            "intentions": db.query(UserDailyIntention)
            .filter(UserDailyIntention.user_id == user_id)
            .count(),
            "sessions": db.query(AuthSession).filter(AuthSession.user_id == user_id).count(),
            "reset_tokens": db.query(PasswordResetToken)
            .filter(PasswordResetToken.user_id == user_id)
            .count(),
            "usage": db.query(UsageEvent)
            .filter(
                (UsageEvent.user_id == user_id) | (UsageEvent.email.ilike(email))
            )
            .count(),
            "users": db.query(User).filter(User.id == user_id).count(),
        }
    finally:
        db.close()


def test_change_password_success():
    with _client() as c:
        body = _register(c, "change.ok@example.com", "password1")
        tok = body["access_token"]
        res = c.post(
            "/auth/change-password",
            json={"current_password": "password1", "new_password": "password2"},
            headers=_headers(tok),
        )
        assert res.status_code == 200, res.text
        out = res.json()
        assert "access_token" in out
        assert out["access_token"] != tok
        assert out["user"]["email"] == "change.ok@example.com"
        new_tok = out["access_token"]
        me = c.get("/auth/me", headers=_headers(new_tok))
        assert me.status_code == 200
        login = c.post(
            "/auth/login",
            json={"username": "change.ok@example.com", "password": "password2"},
        )
        assert login.status_code == 200


def test_change_password_wrong_current_keeps_password_and_sessions():
    with _client() as c:
        body = _register(c, "change.wrong@example.com", "password1")
        tok = body["access_token"]
        res = c.post(
            "/auth/change-password",
            json={"current_password": "nope-nope", "new_password": "password2"},
            headers=_headers(tok),
        )
        assert res.status_code == 401, res.text
        assert res.json()["detail"] == GENERIC_AUTH_ERROR
        me = c.get("/auth/me", headers=_headers(tok))
        assert me.status_code == 200
        login = c.post(
            "/auth/login",
            json={"username": "change.wrong@example.com", "password": "password1"},
        )
        assert login.status_code == 200
        bad_new = c.post(
            "/auth/login",
            json={"username": "change.wrong@example.com", "password": "password2"},
        )
        assert bad_new.status_code == 401
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == "change.wrong@example.com").first()
            assert user is not None
            assert verify_password("password1", user.password_hash)
        finally:
            db.close()


def test_change_password_too_short():
    with _client() as c:
        body = _register(c, "change.short@example.com", "password1")
        res = c.post(
            "/auth/change-password",
            json={"current_password": "password1", "new_password": "short"},
            headers=_headers(body["access_token"]),
        )
        assert res.status_code == 400, res.text
        assert "at least 8" in res.json()["detail"]


def test_change_password_equal_to_current():
    with _client() as c:
        body = _register(c, "change.same@example.com", "password1")
        res = c.post(
            "/auth/change-password",
            json={"current_password": "password1", "new_password": "password1"},
            headers=_headers(body["access_token"]),
        )
        assert res.status_code == 400, res.text
        assert res.json()["detail"] == "Choose a different password."


def test_change_password_revokes_old_and_second_session():
    with _client() as c:
        body = _register(c, "change.revoke@example.com", "password1")
        first = body["access_token"]
        second_login = c.post(
            "/auth/login",
            json={"username": "change.revoke@example.com", "password": "password1"},
        )
        assert second_login.status_code == 200
        second = second_login.json()["access_token"]
        res = c.post(
            "/auth/change-password",
            json={"current_password": "password1", "new_password": "password2"},
            headers=_headers(first),
        )
        assert res.status_code == 200, res.text
        fresh = res.json()["access_token"]
        assert c.get("/auth/me", headers=_headers(first)).status_code == 401
        assert c.get("/auth/me", headers=_headers(second)).status_code == 401
        assert c.get("/auth/me", headers=_headers(fresh)).status_code == 200


def test_change_password_unauthenticated():
    with _client() as c:
        res = c.post(
            "/auth/change-password",
            json={"current_password": "password1", "new_password": "password2"},
        )
        assert res.status_code == 401


def test_change_password_rate_limit_plumbing():
    source = inspect.getsource(routes_mod.change_password)
    assert 'rate_limit("change-password"' in source
    assert "limit=10" in source
    assert "window_sec=600" in source
    _rate.clear()
    with _client() as c:
        body = _register(c, "change.limit@example.com", "password1")
        headers = _headers(body["access_token"])
        payload = {"current_password": "wrong-pass", "new_password": "password2"}
        codes = []
        for _ in range(11):
            codes.append(c.post("/auth/change-password", json=payload, headers=headers).status_code)
        assert codes[:10] == [401] * 10
        assert codes[10] == 429


def test_delete_account_success_cascades_and_leaves_other_user():
    with _client() as c:
        primary = _register(c, "delete.me@example.com", "password1")
        other = _register(c, "delete.keep@example.com", "password1", first_name="Bea")
        primary_id = primary["user"]["id"]
        other_id = other["user"]["id"]
        ids = _seed_owned_rows(primary_id, "delete.me@example.com")
        other_ids = _seed_owned_rows(other_id, "delete.keep@example.com")
        before = _counts_for(primary_id, "delete.me@example.com")
        assert before["completions"] >= 1
        assert before["charts"] >= 1
        assert before["inventory"] >= 1
        assert before["protocols"] >= 1
        assert before["biometrics"] >= 1
        assert before["intentions"] >= 1
        assert before["sessions"] >= 2
        assert before["reset_tokens"] >= 1
        assert before["usage"] >= 2
        assert before["users"] == 1

        res = c.post(
            "/auth/delete-account",
            json={
                "current_password": "password1",
                "confirmation_email": "Delete.Me@example.com",
            },
            headers=_headers(primary["access_token"]),
        )
        assert res.status_code == 200, res.text
        after = _counts_for(primary_id, "delete.me@example.com")
        assert after == {
            "completions": 0,
            "charts": 0,
            "inventory": 0,
            "protocols": 0,
            "biometrics": 0,
            "intentions": 0,
            "sessions": 0,
            "reset_tokens": 0,
            "usage": 0,
            "users": 0,
        }
        kept = _counts_for(other_id, "delete.keep@example.com")
        assert kept["users"] == 1
        assert kept["charts"] >= 1
        assert kept["completions"] >= 1
        assert kept["inventory"] >= 1
        assert kept["protocols"] >= 1
        assert kept["biometrics"] >= 1
        assert kept["intentions"] >= 1
        assert kept["sessions"] >= 2
        assert kept["reset_tokens"] >= 1
        assert kept["usage"] >= 2
        assert c.get("/auth/me", headers=_headers(primary["access_token"])).status_code == 401
        assert c.get("/auth/me", headers=_headers(other["access_token"])).status_code == 200

        db = SessionLocal()
        try:
            assert db.get(GeocodeCache, ids["geocode"]) is not None
            assert db.get(NatalChart, other_ids["chart"]) is not None
        finally:
            db.close()


def test_delete_account_wrong_password_does_not_delete():
    with _client() as c:
        body = _register(c, "delete.wrongpw@example.com", "password1")
        uid = body["user"]["id"]
        _seed_owned_rows(uid, "delete.wrongpw@example.com")
        res = c.post(
            "/auth/delete-account",
            json={
                "current_password": "nope-nope",
                "confirmation_email": "delete.wrongpw@example.com",
            },
            headers=_headers(body["access_token"]),
        )
        assert res.status_code == 401, res.text
        assert res.json()["detail"] == GENERIC_AUTH_ERROR
        counts = _counts_for(uid, "delete.wrongpw@example.com")
        assert counts["users"] == 1
        assert counts["charts"] >= 1
        assert counts["usage"] >= 1
        assert c.get("/auth/me", headers=_headers(body["access_token"])).status_code == 200


def test_delete_account_wrong_confirmation_email_does_not_delete():
    with _client() as c:
        body = _register(c, "delete.wrongem@example.com", "password1")
        uid = body["user"]["id"]
        _seed_owned_rows(uid, "delete.wrongem@example.com")
        res = c.post(
            "/auth/delete-account",
            json={
                "current_password": "password1",
                "confirmation_email": "someone-else@example.com",
            },
            headers=_headers(body["access_token"]),
        )
        assert res.status_code == 400, res.text
        assert res.json()["detail"] == "Type your account email to confirm."
        counts = _counts_for(uid, "delete.wrongem@example.com")
        assert counts["users"] == 1
        assert counts["charts"] >= 1


def test_delete_account_unauthenticated():
    with _client() as c:
        res = c.post(
            "/auth/delete-account",
            json={
                "current_password": "password1",
                "confirmation_email": "x@example.com",
            },
        )
        assert res.status_code == 401


def test_delete_account_cannot_take_target_user_id():
    source = inspect.getsource(routes_mod.delete_account)
    assert "user_id" not in inspect.signature(routes_mod.delete_account).parameters
    assert "{user_id}" not in source
    assert 'APIRouter' not in source
    with _client() as c:
        attacker = _register(c, "delete.attacker@example.com", "password1")
        victim = _register(c, "delete.victim@example.com", "password1", first_name="Vic")
        missing = c.post(
            f"/auth/delete-account/{victim['user']['id']}",
            json={
                "current_password": "password1",
                "confirmation_email": "delete.attacker@example.com",
            },
            headers=_headers(attacker["access_token"]),
        )
        assert missing.status_code in (404, 405, 422)
        res = c.post(
            "/auth/delete-account",
            json={
                "current_password": "password1",
                "confirmation_email": "delete.attacker@example.com",
                "user_id": victim["user"]["id"],
            },
            headers=_headers(attacker["access_token"]),
        )
        assert res.status_code == 200, res.text
        assert _counts_for(attacker["user"]["id"], "delete.attacker@example.com")["users"] == 0
        assert _counts_for(victim["user"]["id"], "delete.victim@example.com")["users"] == 1
        assert c.get("/auth/me", headers=_headers(victim["access_token"])).status_code == 200


def test_delete_account_rate_limit_plumbing():
    source = inspect.getsource(routes_mod.delete_account)
    assert 'rate_limit("delete-account"' in source
    assert "limit=5" in source
    assert "window_sec=600" in source
    _rate.clear()
    with _client() as c:
        body = _register(c, "delete.limit@example.com", "password1")
        headers = _headers(body["access_token"])
        payload = {
            "current_password": "wrong-pass",
            "confirmation_email": "delete.limit@example.com",
        }
        codes = [
            c.post("/auth/delete-account", json=payload, headers=headers).status_code
            for _ in range(6)
        ]
        assert codes[:5] == [401] * 5
        assert codes[5] == 429


def test_delete_cascade_order_in_source():
    source = inspect.getsource(routes_mod.delete_account)
    order = [
        "ProtocolCompletion",
        "NatalChart",
        "SupplementInventory",
        "WeeklyProtocol",
        "UserBiometricsDaily",
        "UserDailyIntention",
        "AuthSession",
        "PasswordResetToken",
        "UsageEvent",
    ]
    positions = [source.index(name) for name in order]
    assert positions == sorted(positions)
    assert "db.delete(user)" in source
    assert "except" not in source
    assert "geocode" not in source.lower()
    assert "stripe" not in source.lower()
