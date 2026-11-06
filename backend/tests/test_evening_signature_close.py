"""Evening Signature Close — protocol-completions kind=evening persist."""

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


def _db() -> Session:
    return SessionLocal()


def _ensure_user() -> User:
    init_db()
    db = _db()
    try:
        user = (
            db.query(User)
            .filter(User.email == "evening-close@test.hd-biohack.local")
            .first()
        )
        if not user:
            user = User(
                email="evening-close@test.hd-biohack.local",
                username="EveningClose",
                display_name="Evening Close",
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
        create = client.post(
            "/chart/calculate",
            json={
                "birth_date": "1990-05-15",
                "birth_time": "14:30:00",
                "birth_city": "Hong Kong",
                "lat": 22.3193,
                "lon": 114.1694,
                "user_id": user_id,
                "save": True,
                "label": "Me",
                "slot_kind": "self",
            },
        )
        assert create.status_code == 200, create.text
        return int(create.json()["natal_chart_id"])
    finally:
        db.close()


def test_evening_kind_persists():
    user = _ensure_user()
    chart_id = _ensure_chart(user.id)
    day = date(2026, 11, 6).isoformat()
    payload = {
        "chart_id": chart_id,
        "day": day,
        "item_id": "today-evening-close",
        "kind": "evening",
        "label": "Generator|yes",
        "done": True,
        "note": "quiet yes",
    }
    res = client.put(f"/users/{user.id}/protocol-completions", json=payload)
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["kind"] == "evening"
    assert body["item_id"] == "today-evening-close"
    assert body["label"] == "Generator|yes"
    assert body["done"] is True
    assert body["note"] == "quiet yes"

    listed = client.get(
        f"/users/{user.id}/protocol-completions",
        params={"chart_id": chart_id, "day": day},
    )
    assert listed.status_code == 200
    items = listed.json()["items"]
    evening = [i for i in items if i["item_id"] == "today-evening-close"]
    assert len(evening) == 1
    assert evening[0]["kind"] == "evening"
    assert evening[0]["label"] == "Generator|yes"

    db = _db()
    try:
        row = (
            db.query(ProtocolCompletion)
            .filter(
                ProtocolCompletion.user_id == user.id,
                ProtocolCompletion.chart_id == chart_id,
                ProtocolCompletion.item_id == "today-evening-close",
            )
            .first()
        )
        assert row is not None
        assert row.kind == "evening"
    finally:
        db.close()
