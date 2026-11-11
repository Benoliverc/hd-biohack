"""Unknown birth-time path: time_unknown flag, noon default, GET /charts round-trip."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.database import SessionLocal, init_db
from app.main import app
from app.models import NatalChart, User

client = TestClient(app)

EMAIL = "unknown-birth-time@test.hd-biohack.local"
USERNAME = "UnknownBirthTime"
PASSWORD = "test123"
PLACE = {
    "birth_date": "1990-05-15",
    "birth_city": "Hong Kong",
    "lat": 22.3193,
    "lon": 114.1694,
}


def _db() -> Session:
    return SessionLocal()


def _headers_for(user: User) -> dict[str, str]:
    db = _db()
    try:
        row = db.get(User, user.id)
        if row and not row.password_hash:
            row.password_hash = hash_password(PASSWORD)
            db.commit()
        email = row.email if row else user.email
        username = (row.username if row else None) or USERNAME
    finally:
        db.close()
    r = client.post("/auth/login", json={"username": email, "password": PASSWORD})
    if r.status_code != 200:
        r = client.post("/auth/login", json={"username": username, "password": PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _ensure_user() -> User:
    init_db()
    db = _db()
    try:
        user = db.query(User).filter(User.email == EMAIL).first()
        if not user:
            user = User(
                email=EMAIL,
                username=USERNAME,
                display_name="Unknown Birth Time",
                password_hash=hash_password(PASSWORD),
                auth_provider="password",
                subscription_tier="free",
                biohacking_enabled=False,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        uid = user.id
    finally:
        db.close()
    db2 = _db()
    try:
        u = db2.get(User, uid)
        db2.expunge(u)
        return u
    finally:
        db2.close()


def _clear_charts(user_id: int) -> None:
    db = _db()
    try:
        db.query(NatalChart).filter(NatalChart.user_id == user_id).delete()
        db.commit()
    finally:
        db.close()


def test_unknown_time_stores_noon_and_flag_on_get_charts():
    user = _ensure_user()
    headers = _headers_for(user)
    _clear_charts(user.id)

    created = client.post(
        "/chart/calculate",
        headers=headers,
        json={
            **PLACE,
            "time_unknown": True,
            "user_id": user.id,
            "save": True,
            "label": "Me",
            "slot_kind": "self",
        },
    )
    assert created.status_code == 200, created.text
    natal_id = created.json()["natal_chart_id"]
    assert natal_id is not None

    db = _db()
    try:
        row = db.get(NatalChart, natal_id)
        assert row is not None
        assert row.birth_time == "12:00:00"
        assert row.time_unknown is True
    finally:
        db.close()

    listed = client.get(f"/charts/{user.id}", headers=headers)
    assert listed.status_code == 200, listed.text
    rows = listed.json()
    match = next((r for r in rows if r["id"] == natal_id), None)
    assert match is not None
    assert match["birth_time"] == "12:00:00"
    assert match["time_unknown"] is True
    print("PASS: unknown + noon + flag round-trips on GET /charts")


def test_omitted_time_without_flag_fails():
    user = _ensure_user()
    headers = _headers_for(user)
    _clear_charts(user.id)

    r = client.post(
        "/chart/calculate",
        headers=headers,
        json={
            **PLACE,
            "user_id": user.id,
            "save": True,
            "label": "Me",
            "slot_kind": "self",
        },
    )
    assert r.status_code >= 400, r.text
    assert r.status_code != 200
    print("PASS: omitted time without the flag fails")


def test_known_noon_does_not_set_flag():
    user = _ensure_user()
    headers = _headers_for(user)
    _clear_charts(user.id)

    created = client.post(
        "/chart/calculate",
        headers=headers,
        json={
            **PLACE,
            "birth_time": "12:00:00",
            "user_id": user.id,
            "save": True,
            "label": "Me",
            "slot_kind": "self",
        },
    )
    assert created.status_code == 200, created.text
    natal_id = created.json()["natal_chart_id"]

    listed = client.get(f"/charts/{user.id}", headers=headers)
    assert listed.status_code == 200, listed.text
    match = next((r for r in listed.json() if r["id"] == natal_id), None)
    assert match is not None
    assert match["birth_time"] == "12:00:00"
    assert match["time_unknown"] is False

    db = _db()
    try:
        row = db.get(NatalChart, natal_id)
        assert row is not None
        assert row.time_unknown is not True
    finally:
        db.close()
    print("PASS: stored noon without the flag stays time_unknown false")


def test_unknown_flag_overwrites_typed_time_to_noon():
    user = _ensure_user()
    headers = _headers_for(user)
    _clear_charts(user.id)

    created = client.post(
        "/chart/calculate",
        headers=headers,
        json={
            **PLACE,
            "birth_time": "03:14:00",
            "time_unknown": True,
            "user_id": user.id,
            "save": True,
            "label": "Me",
            "slot_kind": "self",
        },
    )
    assert created.status_code == 200, created.text
    natal_id = created.json()["natal_chart_id"]
    db = _db()
    try:
        row = db.get(NatalChart, natal_id)
        assert row is not None
        assert row.birth_time == "12:00:00"
        assert row.time_unknown is True
    finally:
        db.close()
    print("PASS: time_unknown true stores noon even if a time was sent")


def test_clearing_unknown_recasts_with_typed_time():
    user = _ensure_user()
    headers = _headers_for(user)
    _clear_charts(user.id)

    created = client.post(
        "/chart/calculate",
        headers=headers,
        json={
            **PLACE,
            "time_unknown": True,
            "user_id": user.id,
            "save": True,
            "label": "Me",
            "slot_kind": "self",
        },
    )
    assert created.status_code == 200, created.text
    natal_id = created.json()["natal_chart_id"]

    updated = client.post(
        "/chart/calculate",
        headers=headers,
        json={
            **PLACE,
            "birth_time": "09:30:00",
            "time_unknown": False,
            "user_id": user.id,
            "save": True,
            "label": "Me",
            "slot_kind": "self",
            "natal_chart_id": natal_id,
        },
    )
    assert updated.status_code == 200, updated.text
    listed = client.get(f"/charts/{user.id}", headers=headers)
    match = next((r for r in listed.json() if r["id"] == natal_id), None)
    assert match is not None
    assert match["birth_time"] == "09:30:00"
    assert match["time_unknown"] is False
    print("PASS: clearing unknown recasts with the typed time and flag false")
