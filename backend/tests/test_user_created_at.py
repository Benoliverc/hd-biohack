"""Pin UserOut / auth session includes UTC created_at on register, login, /auth/me."""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ["SEED_DEV_USERS"] = "false"
os.environ["BETA_FULL_ACCESS"] = "true"
os.environ["SQLITE_PATH"] = str(Path("/tmp/hd-biohack-test-user-created-at.db"))
os.environ["RESEND_API_KEY"] = ""
os.environ["ADMIN_EMAILS"] = "admin@test.hd-biohack.local"

Path(os.environ["SQLITE_PATH"]).unlink(missing_ok=True)

from app.config import get_settings

get_settings.cache_clear()

from fastapi.testclient import TestClient

from app.main import app
from app.schemas import UserOut
from datetime import datetime, timezone


_UTC_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]00:00)$"
)


def _assert_utc_created_at(value: object) -> None:
    assert isinstance(value, str), f"created_at must be a string on the wire, got {type(value)}"
    assert _UTC_RE.match(value), f"created_at must be unambiguous UTC, got {value!r}"
    # Must not be a naive ISO string without zone
    assert value.endswith("Z") or value.endswith("+00:00") or value.endswith("-00:00")


def test_register_login_me_include_utc_created_at():
    with TestClient(app) as c:
        reg = c.post(
            "/auth/register",
            json={
                "email": "created.at@example.com",
                "password": "password1",
                "first_name": "Ada",
            },
        )
        assert reg.status_code == 200, reg.text
        body = reg.json()
        user = body["user"]
        assert "created_at" in user
        _assert_utc_created_at(user["created_at"])
        created = user["created_at"]

        tok = body["access_token"]
        headers = {"Authorization": f"Bearer {tok}"}

        me = c.get("/auth/me", headers=headers)
        assert me.status_code == 200
        me_body = me.json()
        assert "created_at" in me_body
        _assert_utc_created_at(me_body["created_at"])
        assert me_body["created_at"] == created

        login = c.post(
            "/auth/login",
            json={"username": "created.at@example.com", "password": "password1"},
        )
        assert login.status_code == 200, login.text
        login_user = login.json()["user"]
        assert "created_at" in login_user
        _assert_utc_created_at(login_user["created_at"])
        assert login_user["created_at"] == created


def test_userout_json_serializer_marks_naive_utc():
    naive = datetime(2026, 11, 19, 12, 0, 0)  # stored as naive UTC in DB
    out = UserOut(
        id=1,
        email="x@example.com",
        display_name="X",
        auth_provider="password",
        subscription_tier="free",
        stripe_customer_id=None,
        biohacking_enabled=False,
        created_at=naive,
    )
    dumped = out.model_dump(mode="json")
    _assert_utc_created_at(dumped["created_at"])
    assert dumped["created_at"] == "2026-11-19T12:00:00Z"

    aware = datetime(2026, 11, 19, 12, 0, 0, tzinfo=timezone.utc)
    out2 = out.model_copy(update={"created_at": aware})
    dumped2 = out2.model_dump(mode="json")
    _assert_utc_created_at(dumped2["created_at"])


if __name__ == "__main__":
    test_userout_json_serializer_marks_naive_utc()
    print("PASS UserOut serializer")
    test_register_login_me_include_utc_created_at()
    print("PASS register/login/me created_at")
