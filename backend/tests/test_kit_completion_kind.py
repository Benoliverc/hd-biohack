"""Protocol-completions kind=kit persist — Today's kit pick is never stored as move."""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.database import SessionLocal, init_db
from app.main import app
from app.models import NatalChart, ProtocolCompletion, User

client = TestClient(app)

PASSWORD = "test123"
EMAIL = "kit-kind@test.hd-biohack.local"
USERNAME = "KitKind"


def _db() -> Session:
    return SessionLocal()


def _headers_for(user: User) -> dict[str, str]:
    r = client.post("/auth/login", json={"username": EMAIL, "password": PASSWORD})
    if r.status_code != 200:
        r = client.post("/auth/login", json={"username": USERNAME, "password": PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _ensure_user() -> User:
    init_db()
    db = _db()
    try:
        user = (
            db.query(User)
            .filter(User.email == "kit-kind@test.hd-biohack.local")
            .first()
        )
        if not user:
            user = User(
                email="kit-kind@test.hd-biohack.local",
                username="KitKind",
                display_name="Kit Kind",
                password_hash=hash_password("test123"),
                auth_provider="password",
                subscription_tier="biohacker_pro",
                biohacking_enabled=True,
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


def _ensure_chart(user_id: int) -> int:
    db = _db()
    try:
        row = (
            db.query(NatalChart)
            .filter(NatalChart.user_id == user_id, NatalChart.slot_kind == "self")
            .first()
        )
        if row:
            return row.id
        row = NatalChart(
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
        db.add(row)
        db.commit()
        db.refresh(row)
        return int(row.id)
    finally:
        db.close()


def test_kit_kind_persists():
    user = _ensure_user()
    chart_id = _ensure_chart(user.id)
    headers = _headers_for(user)
    day = date(2026, 11, 12).isoformat()
    payload = {
        "chart_id": chart_id,
        "day": day,
        "item_id": "today-kit:magnesium-glycinate",
        "kind": "kit",
        "label": "Magnesium Glycinate",
        "done": True,
        "note": "evening dose",
    }
    res = client.put(f"/users/{user.id}/protocol-completions", json=payload, headers=headers)
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["kind"] == "kit"
    assert body["item_id"] == "today-kit:magnesium-glycinate"
    assert body["label"] == "Magnesium Glycinate"
    assert body["done"] is True
    assert body["note"] == "evening dose"

    listed = client.get(
        f"/users/{user.id}/protocol-completions",
        params={"chart_id": chart_id, "day": day},
        headers=headers,
    )
    assert listed.status_code == 200
    items = listed.json()["items"]
    kit_rows = [i for i in items if i["item_id"] == "today-kit:magnesium-glycinate"]
    assert len(kit_rows) == 1
    assert kit_rows[0]["kind"] == "kit"
    assert kit_rows[0]["kind"] != "move"

    db = _db()
    try:
        row = (
            db.query(ProtocolCompletion)
            .filter(
                ProtocolCompletion.user_id == user.id,
                ProtocolCompletion.chart_id == chart_id,
                ProtocolCompletion.item_id == "today-kit:magnesium-glycinate",
            )
            .first()
        )
        assert row is not None
        assert row.kind == "kit"
    finally:
        db.close()
