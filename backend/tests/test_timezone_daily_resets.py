"""Account-timezone Daily Novelty buckets: stability inside a 07:00 window and DST."""

from __future__ import annotations

import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.checkin.novelty import (
    BUCKET_HOUR,
    hkt_bucket_instant,
    hkt_today,
    novelty_bucket_instant,
    novelty_today,
    resolve_zone,
)


HKT = "Asia/Hong_Kong"
NY = "America/New_York"


def test_resolve_zone_fallback():
    assert resolve_zone(None).key == "Asia/Hong_Kong"
    assert resolve_zone("").key == "Asia/Hong_Kong"
    assert resolve_zone("Not/A_Zone").key == "Asia/Hong_Kong"
    assert resolve_zone(NY).key == NY
    print("PASS: resolve_zone fallback")


def test_bucket_instant_is_seven_in_zone():
    day = date(2026, 10, 24)
    hkt = novelty_bucket_instant(day, HKT)
    ny = novelty_bucket_instant(day, NY)
    assert hkt.hour == BUCKET_HOUR and hkt.tzinfo.key == HKT
    assert ny.hour == BUCKET_HOUR and ny.tzinfo.key == NY
    assert hkt.utcoffset() != ny.utcoffset()
    print("PASS: bucket instant is 07:00 in the given zone")


def test_stability_inside_hkt_bucket(monkeypatch):
    """06:30 and 06:59 share yesterday's bucket; 07:01 stays on today's until the next 07:00."""
    import app.checkin.novelty as novelty

    def at(hh, mm):
        return datetime(2026, 10, 24, hh, mm, tzinfo=ZoneInfo(HKT))

    class Frozen(datetime):
        current = at(6, 30)

        @classmethod
        def now(cls, tz=None):  # noqa: ANN001
            cur = cls.current
            return cur.astimezone(tz) if tz is not None else cur

    monkeypatch.setattr(novelty, "datetime", Frozen)

    Frozen.current = at(6, 30)
    before_a = novelty_today(HKT)
    Frozen.current = at(6, 59)
    before_b = novelty_today(HKT)
    assert before_a == before_b == date(2026, 10, 23)

    Frozen.current = at(7, 0)
    at_reset = novelty_today(HKT)
    Frozen.current = at(7, 1)
    after = novelty_today(HKT)
    assert at_reset == after == date(2026, 10, 24)
    assert before_a != at_reset
    print("PASS: HKT novelty day is stable inside a bucket and changes at 07:00")


def test_ny_dst_spring_forward_boundary(monkeypatch):
    """2026-03-08 America/New_York springs forward 02:00→03:00; 07:00 EDT still exists."""
    import app.checkin.novelty as novelty

    def at(hh, mm):
        return datetime(2026, 3, 8, hh, mm, tzinfo=ZoneInfo(NY))

    class Frozen(datetime):
        current = at(6, 59)

        @classmethod
        def now(cls, tz=None):  # noqa: ANN001
            cur = cls.current
            return cur.astimezone(tz) if tz is not None else cur

    monkeypatch.setattr(novelty, "datetime", Frozen)

    Frozen.current = at(6, 59)
    assert novelty_today(NY) == date(2026, 3, 7)
    Frozen.current = at(7, 0)
    assert novelty_today(NY) == date(2026, 3, 8)
    inst = novelty_bucket_instant(date(2026, 3, 8), NY)
    assert inst.hour == 7
    assert inst.tzinfo.key == NY
    print("PASS: NY spring-forward 07:00 boundary")


def test_ny_dst_fall_back_boundary(monkeypatch):
    """2026-11-01 America/New_York falls back; 07:00 EST is the novelty reset."""
    import app.checkin.novelty as novelty

    def at(hh, mm):
        return datetime(2026, 11, 1, hh, mm, tzinfo=ZoneInfo(NY))

    class Frozen(datetime):
        current = at(6, 59)

        @classmethod
        def now(cls, tz=None):  # noqa: ANN001
            cur = cls.current
            return cur.astimezone(tz) if tz is not None else cur

    monkeypatch.setattr(novelty, "datetime", Frozen)

    Frozen.current = at(6, 59)
    assert novelty_today(NY) == date(2026, 10, 31)
    Frozen.current = at(7, 0)
    assert novelty_today(NY) == date(2026, 11, 1)
    inst = novelty_bucket_instant(date(2026, 11, 1), NY)
    assert inst.hour == 7
    print("PASS: NY fall-back 07:00 boundary")


def test_same_utc_instant_hkt_and_ny_differ(monkeypatch):
    """04:00 UTC on 2026-11-06 is 12:00 HKT (new day) and 23:00 Nov 5 in New York."""
    import app.checkin.novelty as novelty

    instant = datetime(2026, 11, 6, 4, 0, tzinfo=ZoneInfo("UTC"))

    class Frozen(datetime):
        @classmethod
        def now(cls, tz=None):  # noqa: ANN001
            return instant if tz is None else instant.astimezone(tz)

    monkeypatch.setattr(novelty, "datetime", Frozen)
    assert novelty_today(HKT) == date(2026, 11, 6)
    assert novelty_today(NY) == date(2026, 11, 5)
    assert hkt_today(HKT) == novelty_today(HKT)
    today_b = hkt_bucket_instant(novelty_today(NY), NY)
    assert today_b == datetime(2026, 11, 5, 7, 0, tzinfo=ZoneInfo(NY))
    print("PASS: same UTC instant yields different novelty days in HKT vs NY")


def test_yesterday_bucket_uses_same_zone():
    day = date(2026, 11, 1)
    today = novelty_bucket_instant(day, NY)
    yest = novelty_bucket_instant(day - timedelta(days=1), NY)
    assert yest.tzinfo.key == NY
    assert yest.date() == date(2026, 10, 31)
    assert yest.hour == 7
    assert today - yest > timedelta(hours=20)  # 24h minus any DST shift on 1 Nov
    print("PASS: yesterday bucket stays in the account timezone")
