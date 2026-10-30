"""AC6 — timezone settings, daily intention, protocol completion sync."""

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
from app.models import NatalChart, ProtocolCompletion, User, UserDailyIntention

client = TestClient(app)


def _db() -> Session:
    return SessionLocal()


def _ensure_user() -> User:
    init_db()
    db = _db()
    try:
        user = (
            db.query(User)
            .filter(User.email == "self-betterment@test.hd-biohack.local")
            .first()
        )
        if not user:
            user = User(
                email="self-betterment@test.hd-biohack.local",
                username="SelfBetter",
                display_name="Self Better",
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
        return create.json()["natal_chart_id"]
    finally:
        db.close()


def test_timezone_update_and_clear():
    user = _ensure_user()
    r = client.patch(
        f"/users/{user.id}/settings",
        json={"preferred_timezone": "America/New_York"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["preferred_timezone"] == "America/New_York"

    got = client.get(f"/users/{user.id}")
    assert got.status_code == 200
    assert got.json()["preferred_timezone"] == "America/New_York"

    bad = client.patch(
        f"/users/{user.id}/settings",
        json={"preferred_timezone": "Not/A_Real_Zone"},
    )
    assert bad.status_code == 400

    cleared = client.patch(
        f"/users/{user.id}/settings",
        json={"preferred_timezone": None},
    )
    assert cleared.status_code == 200
    assert cleared.json()["preferred_timezone"] is None
    print("PASS: timezone update/clear")


def test_intention_upsert():
    user = _ensure_user()
    day = "2026-10-30"
    empty = client.get(f"/users/{user.id}/intention", params={"day": day})
    assert empty.status_code == 200
    assert empty.json()["text"] == ""

    put = client.put(
        f"/users/{user.id}/intention",
        json={"day": day, "text": "  Stay soft on decisions  "},
    )
    assert put.status_code == 200, put.text
    assert put.json()["text"] == "Stay soft on decisions"
    assert put.json()["day"] == day

    again = client.get(f"/users/{user.id}/intention", params={"day": day})
    assert again.json()["text"] == "Stay soft on decisions"

    clear = client.put(
        f"/users/{user.id}/intention",
        json={"day": day, "text": ""},
    )
    assert clear.status_code == 200
    assert clear.json()["text"] == ""
    print("PASS: intention upsert")


def test_completion_reflection_sync():
    user = _ensure_user()
    chart_id = _ensure_chart(user.id)
    day = "2026-10-30"

    # Clean prior rows for idempotent re-runs
    db = _db()
    try:
        db.query(ProtocolCompletion).filter(
            ProtocolCompletion.user_id == user.id,
            ProtocolCompletion.chart_id == chart_id,
            ProtocolCompletion.day == date.fromisoformat(day),
        ).delete()
        db.commit()
    finally:
        db.close()

    put = client.put(
        f"/users/{user.id}/protocol-completions",
        json={
            "chart_id": chart_id,
            "day": day,
            "item_id": "morning",
            "kind": "move",
            "label": "Morning walk",
            "done": True,
            "note": "Felt grounded",
        },
    )
    assert put.status_code == 200, put.text
    body = put.json()
    assert body["done"] is True
    assert body["note"] == "Felt grounded"
    assert body["item_id"] == "morning"

    listed = client.get(
        f"/users/{user.id}/protocol-completions",
        params={"chart_id": chart_id, "day": day},
    )
    assert listed.status_code == 200
    items = listed.json()["items"]
    assert len(items) == 1
    assert items[0]["note"] == "Felt grounded"

    # Week-range query
    ranged = client.get(
        f"/users/{user.id}/protocol-completions",
        params={"chart_id": chart_id, "from": "2026-10-26", "to": "2026-11-01"},
    )
    assert ranged.status_code == 200
    assert any(i["item_id"] == "morning" for i in ranged.json()["items"])

    # Uncheck clears note
    off = client.put(
        f"/users/{user.id}/protocol-completions",
        json={
            "chart_id": chart_id,
            "day": day,
            "item_id": "morning",
            "kind": "move",
            "label": "Morning walk",
            "done": False,
            "note": "should ignore",
        },
    )
    assert off.status_code == 200
    assert off.json()["done"] is False
    assert off.json()["note"] is None
    print("PASS: completion/reflection sync")


if __name__ == "__main__":
    test_timezone_update_and_clear()
    test_intention_upsert()
    test_completion_reflection_sync()
    print("ALL PASS")
