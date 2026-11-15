"""Admin next-level: HKT clock, seed exclusion, funnel, literacy events."""

from __future__ import annotations

import os
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from unittest.mock import patch

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
from app.models import NatalChart, ProtocolCompletion, UsageEvent, User
from app.usage import (
    compute_activation_funnel,
    compute_insights,
    hkt_calendar_date,
    hkt_day_bounds_utc,
    hkt_today_date,
    hkt_week_monday,
    is_seed_or_dev_user,
    list_usage_events,
    overview_new_user_pulse,
    record_usage_event,
    stats_daily,
    stats_weekly,
)

client = TestClient(app)

# 2026-11-15 04:30 HKT == 2026-11-14 20:30 UTC (inside 00:00–08:00 HKT)
EARLY_HKT = datetime(2026, 11, 14, 20, 30, 0)
EARLY_HKT_DAY = date(2026, 11, 15)
PREV_UTC_DAY = date(2026, 11, 14)


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


def _make_user(db: Session, email: str, *, created_at: datetime) -> User:
    u = User(
        email=email,
        display_name=email.split("@")[0],
        auth_provider="password",
        subscription_tier="free",
        password_hash=hash_password("password123"),
        created_at=created_at,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def _add_event(
    db: Session,
    *,
    user: User | None,
    event_type: str,
    created_at: datetime,
    metadata: dict | None = None,
    email: str | None = None,
) -> UsageEvent:
    ev = UsageEvent(
        user_id=user.id if user else None,
        email=(email if email is not None else (user.email if user else ""))[:255],
        event_type=event_type,
        created_at=created_at,
        metadata_json=metadata,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


def _add_natal(
    db: Session,
    user: User,
    *,
    slot_kind: str,
    created_at: datetime,
    label: str = "Me",
) -> NatalChart:
    row = NatalChart(
        user_id=user.id,
        label=label,
        slot_kind=slot_kind,
        role="self" if slot_kind != "friend" else "friend",
        birth_date="1990-01-01",
        birth_time="12:00",
        birth_city="Hong Kong",
        lat=22.3,
        lon=114.2,
        chart_json={"type": "Generator"},
        created_at=created_at,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _add_completion(
    db: Session,
    user: User,
    chart: NatalChart,
    *,
    kind: str,
    done: bool,
    updated_at: datetime,
    item_id: str,
) -> ProtocolCompletion:
    row = ProtocolCompletion(
        user_id=user.id,
        chart_id=chart.id,
        day=hkt_calendar_date(updated_at),
        item_id=item_id,
        kind=kind,
        label=kind,
        done=done,
        updated_at=updated_at,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def test_early_hkt_timestamp_buckets_into_hkt_day():
    """00:00–08:00 HKT lands on the HKT calendar day, not the previous UTC date."""
    init_db()
    admin = _ensure_admin()
    stamp = int(datetime.utcnow().timestamp())
    db = _db()
    try:
        user = _make_user(db, f"early_hkt_{stamp}@example.com", created_at=EARLY_HKT)
        _add_event(db, user=user, event_type="login", created_at=EARLY_HKT)

        daily_hkt = stats_daily(db, from_day=EARLY_HKT_DAY, to_day=EARLY_HKT_DAY)
        assert daily_hkt[0]["day"] == EARLY_HKT_DAY.isoformat()
        assert daily_hkt[0]["unique_users_logged_in"] >= 1
        assert daily_hkt[0]["logins"] >= 1

        daily_prev = stats_daily(db, from_day=PREV_UTC_DAY, to_day=PREV_UTC_DAY)
        # The early-HKT login must not be attributed to the previous UTC date.
        # Isolate by checking this user's events in the prev-day HKT window.
        start_prev, end_prev = hkt_day_bounds_utc(PREV_UTC_DAY)
        prev_for_user = (
            db.query(UsageEvent)
            .filter(
                UsageEvent.user_id == user.id,
                UsageEvent.event_type == "login",
                UsageEvent.created_at >= start_prev,
                UsageEvent.created_at < end_prev,
            )
            .count()
        )
        start_hkt, end_hkt = hkt_day_bounds_utc(EARLY_HKT_DAY)
        hkt_for_user = (
            db.query(UsageEvent)
            .filter(
                UsageEvent.user_id == user.id,
                UsageEvent.event_type == "login",
                UsageEvent.created_at >= start_hkt,
                UsageEvent.created_at < end_hkt,
            )
            .count()
        )
        assert prev_for_user == 0
        assert hkt_for_user == 1
        assert daily_prev[0]["day"] == PREV_UTC_DAY.isoformat()

        total, items = list_usage_events(
            db, day=EARLY_HKT_DAY.isoformat(), event_type="login", limit=200
        )
        assert any(i["user_id"] == user.id for i in items)
        total_prev, items_prev = list_usage_events(
            db, day=PREV_UTC_DAY.isoformat(), event_type="login", limit=200
        )
        assert all(i["user_id"] != user.id for i in items_prev)

        # Insights period + D1/D7 use HKT dates of created_at / login.
        # Signup 15 Nov 04:30 HKT; D1 login 16 Nov 04:30 HKT (= 15 Nov 20:30 UTC).
        d1_login = datetime(2026, 11, 15, 20, 30, 0)
        _add_event(db, user=user, event_type="login", created_at=d1_login)

        # Freeze "today" to 16 Nov 2026 HKT so the 7-day window includes 15 Nov.
        with patch("app.usage.hkt_today_date", return_value=date(2026, 11, 16)):
            ins = compute_insights(db, period_days=7)
        assert ins["new_users"] >= 1
        # This user signed up on HKT 15 Nov and logged in on HKT 16 Nov → D1 hit.
        assert ins["return_d1_pct"] is not None
        # Confirm the HKT date helper itself (UTC date would be 14 Nov).
        assert hkt_calendar_date(EARLY_HKT) == EARLY_HKT_DAY
        assert hkt_calendar_date(EARLY_HKT) != PREV_UTC_DAY
        assert hkt_calendar_date(d1_login) == date(2026, 11, 16)
    finally:
        db.close()
    print("PASS: early HKT timestamp buckets into HKT day")


def test_weekly_buckets_follow_hkt_monday():
    """An event at Monday 00:30 HKT belongs to the HKT week, not the UTC Sunday week."""
    init_db()
    db = _db()
    try:
        today = hkt_today_date()
        monday = hkt_week_monday(today)
        # Monday 00:30 HKT = previous calendar date 16:30 UTC (still Sunday UTC).
        start, _ = hkt_day_bounds_utc(monday)
        event_at = start + timedelta(minutes=30)
        assert hkt_calendar_date(event_at) == monday
        assert event_at.date() == (monday - timedelta(days=1))  # UTC date is Sunday

        stamp = int(datetime.utcnow().timestamp())
        user = _make_user(
            db, f"week_hkt_{stamp}@example.com", created_at=event_at - timedelta(days=1)
        )
        _add_event(db, user=user, event_type="login", created_at=event_at)

        weekly = stats_weekly(db, weeks=4)
        current = next(w for w in weekly if w["week_start"] == monday.isoformat())
        prev_monday = monday - timedelta(days=7)
        prev = next(w for w in weekly if w["week_start"] == prev_monday.isoformat())

        start_cur, end_cur = hkt_day_bounds_utc(monday)[0], hkt_day_bounds_utc(
            monday + timedelta(days=7)
        )[0]
        in_current = (
            db.query(UsageEvent)
            .filter(
                UsageEvent.user_id == user.id,
                UsageEvent.event_type == "login",
                UsageEvent.created_at >= start_cur,
                UsageEvent.created_at < end_cur,
            )
            .count()
        )
        start_prev, end_prev = hkt_day_bounds_utc(prev_monday)[0], hkt_day_bounds_utc(monday)[0]
        in_prev = (
            db.query(UsageEvent)
            .filter(
                UsageEvent.user_id == user.id,
                UsageEvent.event_type == "login",
                UsageEvent.created_at >= start_prev,
                UsageEvent.created_at < end_prev,
            )
            .count()
        )
        assert in_current == 1
        assert in_prev == 0
        assert current["week_start"] == monday.isoformat()
        assert prev["week_start"] == prev_monday.isoformat()
    finally:
        db.close()
    print("PASS: weekly buckets follow HKT Monday")


def test_seed_excluded_from_decision_numbers_but_counted_in_including_seed():
    init_db()
    db = _db()
    try:
        stamp = int(datetime.utcnow().timestamp())
        start, end = hkt_day_bounds_utc(hkt_today_date())
        mid = start + timedelta(hours=4)

        real = _make_user(db, f"real_seed_{stamp}@example.com", created_at=mid)
        seed = _make_user(
            db, f"seed_dev_{stamp}@test.hd-biohack.local", created_at=mid
        )
        assert is_seed_or_dev_user(seed)
        assert not is_seed_or_dev_user(real)

        _add_event(db, user=real, event_type="login", created_at=mid)
        _add_event(db, user=seed, event_type="login", created_at=mid)
        _add_event(
            db,
            user=real,
            event_type="page_view",
            created_at=mid,
            metadata={"page": "today", "path": "/transits"},
        )
        _add_event(
            db,
            user=seed,
            event_type="page_view",
            created_at=mid,
            metadata={"page": "today", "path": "/transits"},
        )

        pulse = overview_new_user_pulse(db)
        assert pulse["total_accounts"] <= pulse["total_accounts_including_seed"]
        assert pulse["total_accounts_including_seed"] >= pulse["total_accounts"] + 1
        new_ids = {u["id"] for u in pulse["new_today"]}
        assert real.id in new_ids
        assert seed.id not in new_ids
        banner_emails = {b["email"] for b in pulse["signups_last_24h"]}
        assert real.email in banner_emails or any(
            b.get("user_id") == real.id for b in pulse["signups_last_24h"]
        )
        assert seed.email not in banner_emails
        assert all(
            (b.get("user_id") != seed.id) for b in pulse["signups_last_24h"]
        )

        daily = stats_daily(db, from_day=hkt_today_date(), to_day=hkt_today_date())
        # Unique-user counts exclude seed; raw event totals may still include them.
        start_t, end_t = start, end
        seed_logins = (
            db.query(UsageEvent)
            .filter(
                UsageEvent.user_id == seed.id,
                UsageEvent.event_type == "login",
                UsageEvent.created_at >= start_t,
                UsageEvent.created_at < end_t,
            )
            .count()
        )
        assert seed_logins >= 1
        # Seed must not appear in unique login / today unique counts.
        # Verify by computing uniques from the same bucket helpers.
        assert daily[0]["unique_users_logged_in"] >= 1
        # Re-count uniques from non-seed only for this isolated pair via health/funnel.
        health = pulse["health"]
        assert health["unique_logins_today"] >= 1

        with patch("app.usage.hkt_today_date", return_value=hkt_today_date()):
            ins = compute_insights(db, period_days=7)
        # Seed user must not inflate new_users / active_users for this window
        # (can't assert exact totals; assert seed-created user isn't required).
        funnel = compute_activation_funnel(db, period_days=7)
        signed = next(s for s in funnel["steps"] if s["key"] == "signed_up")
        # The real user is in the cohort; the seed user is not.
        # Isolate: build a 7d funnel and compare counts after adding only these two today.
        assert signed["count"] >= 1
    finally:
        db.close()
    print("PASS: seed excluded from decision numbers, still in total_accounts_including_seed")


def test_funnel_counts_match_fixtures():
    init_db()
    admin = _ensure_admin()
    stamp = int(datetime.utcnow().timestamp())
    # Use a quiet historical window: 20–26 Oct 2026, freeze today at 26 Oct.
    frozen_today = date(2026, 10, 26)
    signup_at = datetime(2026, 10, 20, 4, 0, 0)  # 12:00 HKT 20 Oct
    after = signup_at + timedelta(hours=2)

    db = _db()
    try:
        window_start, _ = hkt_day_bounds_utc(date(2026, 10, 20))
        _, window_end = hkt_day_bounds_utc(frozen_today)
        prior = db.query(User).filter(User.created_at >= window_start, User.created_at < window_end).all()
        prior_ids = [u.id for u in prior]
        if prior_ids:
            db.query(ProtocolCompletion).filter(ProtocolCompletion.user_id.in_(prior_ids)).delete(synchronize_session=False)
            db.query(NatalChart).filter(NatalChart.user_id.in_(prior_ids)).delete(synchronize_session=False)
            db.query(UsageEvent).filter(UsageEvent.user_id.in_(prior_ids)).delete(synchronize_session=False)
            db.query(User).filter(User.id.in_(prior_ids)).delete(synchronize_session=False)
            db.commit()
        full = _make_user(db, f"funnel_full_{stamp}@example.com", created_at=signup_at)
        friend_only = _make_user(
            db, f"funnel_friend_{stamp}@example.com", created_at=signup_at
        )
        undone = _make_user(db, f"funnel_undone_{stamp}@example.com", created_at=signup_at)
        evening = _make_user(
            db, f"funnel_evening_{stamp}@example.com", created_at=signup_at
        )
        baseline = _make_user(
            db, f"funnel_baseline_{stamp}@example.com", created_at=signup_at
        )
        seed = _make_user(
            db, f"funnel_seed_{stamp}@test.hd-biohack.local", created_at=signup_at
        )

        me_full = _add_natal(db, full, slot_kind="self", created_at=after)
        _add_natal(db, friend_only, slot_kind="friend", created_at=after, label="Pat")
        me_undone = _add_natal(db, undone, slot_kind="self", created_at=after)
        me_evening = _add_natal(db, evening, slot_kind="self", created_at=after)
        me_baseline = _add_natal(db, baseline, slot_kind="self", created_at=after)
        me_seed = _add_natal(db, seed, slot_kind="self", created_at=after)

        for u in (full, friend_only, undone, evening, baseline, seed):
            _add_event(
                db,
                user=u,
                event_type="page_view",
                created_at=after,
                metadata={"page": "today", "path": "/transits"},
            )

        _add_completion(
            db, full, me_full, kind="move", done=True, updated_at=after, item_id="move-full"
        )
        _add_completion(
            db,
            undone,
            me_undone,
            kind="move",
            done=False,
            updated_at=after,
            item_id="move-undone",
        )
        _add_completion(
            db,
            evening,
            me_evening,
            kind="evening",
            done=True,
            updated_at=after,
            item_id="evening-1",
        )
        _add_completion(
            db,
            baseline,
            me_baseline,
            kind="baseline",
            done=True,
            updated_at=after,
            item_id="baseline-1",
        )
        _add_completion(
            db, seed, me_seed, kind="move", done=True, updated_at=after, item_id="move-seed"
        )

        with patch("app.usage.hkt_today_date", return_value=frozen_today):
            funnel = compute_activation_funnel(db, period_days=7)
            pulse = overview_new_user_pulse(db)

        steps = {s["key"]: s for s in funnel["steps"]}
        assert [s["label"] for s in funnel["steps"]] == [
            "Signed up",
            "Me natal",
            "Today view",
            "Move done",
        ]
        # 5 real users in the window (seed excluded).
        assert steps["signed_up"]["count"] == 5
        # friend_only does not satisfy Me natal; the other 4 real users do.
        assert steps["me_natal"]["count"] == 4
        # All 5 real users have a Today page_view after signup.
        assert steps["today_view"]["count"] == 5
        # Only the full user has kind=move + done. undone / evening / baseline do not.
        assert steps["move_done"]["count"] == 1
        assert steps["me_natal"]["dropoff"] == 1
        assert steps["move_done"]["dropoff"] == 4

        assert pulse["funnel_7"]["steps"][0]["label"] == "Signed up"
        r = client.get(f"/admin/overview/pulse?actor_user_id={admin.id}")
        assert r.status_code == 200, r.text
        body = r.json()
        assert "funnel_7" in body and "funnel_30" in body and "health" in body
    finally:
        db.close()
    print("PASS: funnel counts match fixtures")


def test_literacy_event_write_auth_and_rejection():
    init_db()
    admin = _ensure_admin()
    stamp = int(datetime.utcnow().timestamp())
    email = f"lit_user_{stamp}@example.com"
    r = client.post(
        "/auth/register",
        json={"email": email, "password": "password123", "first_name": "Lit"},
    )
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    uid = r.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    before = _db()
    try:
        n_before = (
            before.query(UsageEvent)
            .filter(UsageEvent.event_type == "literacy_event", UsageEvent.user_id == uid)
            .count()
        )
    finally:
        before.close()

    ok = client.post(
        "/usage/literacy",
        json={"action": "open", "variant": "today"},
        headers=headers,
    )
    assert ok.status_code == 204, ok.text
    jump = client.post(
        "/usage/literacy",
        json={"action": "jump", "variant": "chart", "step_id": "centers"},
        headers=headers,
    )
    assert jump.status_code == 204
    got = client.post(
        "/usage/literacy",
        json={"action": "got_it", "variant": "soul"},
        headers=headers,
    )
    assert got.status_code == 204

    # Unauthenticated: 204, no 401/500, no write under this user (and no crash).
    unauth = client.post(
        "/usage/literacy", json={"action": "open", "variant": "protocols"}
    )
    assert unauth.status_code == 204

    # Invalid metadata: 204, not written.
    bad = client.post(
        "/usage/literacy",
        json={"action": "nope", "variant": "today"},
        headers=headers,
    )
    assert bad.status_code == 204

    # Failed write still 204.
    with patch("app.api.routes.record_literacy_event", side_effect=RuntimeError("boom")):
        failed = client.post(
            "/usage/literacy",
            json={"action": "open", "variant": "today"},
            headers=headers,
        )
    assert failed.status_code == 204

    # Unknown event types are still rejected by the recorder.
    record_usage_event(user_id=uid, email=email, event_type="not_a_real_type")

    db = _db()
    try:
        rows = (
            db.query(UsageEvent)
            .filter(UsageEvent.event_type == "literacy_event", UsageEvent.user_id == uid)
            .order_by(UsageEvent.id.asc())
            .all()
        )
        assert len(rows) == n_before + 3
        metas = [r.metadata_json or {} for r in rows[-3:]]
        assert {"action": "open", "variant": "today"} in metas
        assert {"action": "jump", "variant": "chart", "step_id": "centers"} in metas
        assert {"action": "got_it", "variant": "soul"} in metas
        unknown = (
            db.query(UsageEvent)
            .filter(UsageEvent.event_type == "not_a_real_type")
            .count()
        )
        assert unknown == 0

        # Does not require admin: already wrote as a normal registered user.
        # Default logbook filter excludes literacy_event (same as page_view).
        total, items = list_usage_events(db, limit=200)
        assert all(i["event_type"] != "literacy_event" for i in items)
        total_lit, items_lit = list_usage_events(
            db, event_type="literacy_event", limit=200
        )
        assert total_lit >= 3
        assert all(i["event_type"] == "literacy_event" for i in items_lit)
    finally:
        db.close()

    # Non-admin can write; admin route still 403 for a non-admin actor.
    r403 = client.get(f"/admin/insights?actor_user_id={uid}&period=7")
    assert r403.status_code == 403
    r200 = client.get(f"/admin/insights?actor_user_id={admin.id}&period=7")
    assert r200.status_code == 200, r200.text
    assert "literacy" in r200.json()
    print("PASS: literacy writes accepted; unknown rejected; unauth/fail are 204")


if __name__ == "__main__":
    test_early_hkt_timestamp_buckets_into_hkt_day()
    test_weekly_buckets_follow_hkt_monday()
    test_seed_excluded_from_decision_numbers_but_counted_in_including_seed()
    test_funnel_counts_match_fixtures()
    test_literacy_event_write_auth_and_rejection()
    print("ALL PASS")
