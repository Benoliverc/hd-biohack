"""Chart save UX: freeze slot_kind on update (optional API hardening)."""

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


def _db() -> Session:
    return SessionLocal()


def _ensure_user() -> User:
    init_db()
    db = _db()
    try:
        user = db.query(User).filter(User.email == "chart-save-ux@test.hd-biohack.local").first()
        if not user:
            user = User(
                email="chart-save-ux@test.hd-biohack.local",
                username="ChartSaveUx",
                display_name="Chart Save UX",
                password_hash=hash_password("test123"),
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


def test_update_rejects_slot_kind_change():
    user = _ensure_user()
    # Clean prior charts for this user
    db = _db()
    try:
        db.query(NatalChart).filter(NatalChart.user_id == user.id).delete()
        db.commit()
    finally:
        db.close()

    create = client.post(
        "/chart/calculate",
        json={
            "birth_date": "1990-05-15",
            "birth_time": "14:30:00",
            "birth_city": "Hong Kong",
            "lat": 22.3193,
            "lon": 114.1694,
            "user_id": user.id,
            "save": True,
            "label": "Me",
            "slot_kind": "self",
        },
    )
    assert create.status_code == 200, create.text
    natal_id = create.json()["natal_chart_id"]
    assert natal_id is not None

    flip = client.post(
        "/chart/calculate",
        json={
            "birth_date": "1991-06-16",
            "birth_time": "10:00:00",
            "birth_city": "Hong Kong",
            "lat": 22.3193,
            "lon": 114.1694,
            "user_id": user.id,
            "save": True,
            "label": "Alex",
            "slot_kind": "friend",
            "natal_chart_id": natal_id,
        },
    )
    assert flip.status_code == 400, flip.text
    assert "role" in flip.json()["detail"].lower() or "new person" in flip.json()["detail"].lower()

    # Same role still updates
    ok = client.post(
        "/chart/calculate",
        json={
            "birth_date": "1991-06-16",
            "birth_time": "10:00:00",
            "birth_city": "Hong Kong",
            "lat": 22.3193,
            "lon": 114.1694,
            "user_id": user.id,
            "save": True,
            "label": "Me",
            "slot_kind": "self",
            "natal_chart_id": natal_id,
        },
    )
    assert ok.status_code == 200, ok.text
    assert ok.json()["natal_chart_id"] == natal_id

    db = _db()
    try:
        row = db.get(NatalChart, natal_id)
        assert row is not None
        assert row.slot_kind == "self"
        assert row.birth_date == "1991-06-16"
        assert row.label == "Me"
    finally:
        db.close()
    print("PASS: update rejects slot_kind flip; same-role update OK")


def test_create_friend_omits_id_inserts():
    user = _ensure_user()
    db = _db()
    try:
        before = db.query(NatalChart).filter(NatalChart.user_id == user.id).count()
    finally:
        db.close()

    r = client.post(
        "/chart/calculate",
        json={
            "birth_date": "1988-01-02",
            "birth_time": "08:15:00",
            "birth_city": "Hong Kong",
            "lat": 22.3193,
            "lon": 114.1694,
            "user_id": user.id,
            "save": True,
            "label": "Friend B",
            "slot_kind": "friend",
            # no natal_chart_id → insert
        },
    )
    assert r.status_code == 200, r.text
    new_id = r.json()["natal_chart_id"]
    assert new_id is not None

    db = _db()
    try:
        after = db.query(NatalChart).filter(NatalChart.user_id == user.id).count()
        row = db.get(NatalChart, new_id)
        assert after == before + 1
        assert row is not None
        assert row.slot_kind == "friend"
        assert row.label == "Friend B"
    finally:
        db.close()
    print("PASS: create friend without natal_chart_id inserts")
