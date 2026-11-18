from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


def _make_engine():
    settings = get_settings()
    url = settings.sqlalchemy_url
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=connect_args, future=True)


engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_natal_chart_columns()
    _ensure_user_auth_columns()
    _ensure_user_settings_columns()
    _ensure_user_last_login_column()
    upgrade_existing_free_users_to_pro()


def _ensure_natal_chart_columns() -> None:
    """SQLite-friendly ALTER for label/slot_kind/time_unknown when upgrading an existing DB."""
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "natal_charts" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("natal_charts")}
    with engine.begin() as conn:
        if "label" not in cols:
            conn.execute(text("ALTER TABLE natal_charts ADD COLUMN label VARCHAR(128) DEFAULT 'Me'"))
        if "slot_kind" not in cols:
            conn.execute(text("ALTER TABLE natal_charts ADD COLUMN slot_kind VARCHAR(32) DEFAULT 'self'"))
        if "role" not in cols:
            conn.execute(
                text("ALTER TABLE natal_charts ADD COLUMN role VARCHAR(32) DEFAULT 'person'")
            )
        if "time_unknown" not in cols:
            conn.execute(
                text("ALTER TABLE natal_charts ADD COLUMN time_unknown BOOLEAN DEFAULT 0")
            )


def _ensure_user_auth_columns() -> None:
    """SQLite-friendly ALTER for username/password_hash when upgrading an existing DB."""
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "users" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("users")}
    with engine.begin() as conn:
        if "username" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(64)"))
        if "password_hash" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
    # Unique index on username (nullable allowed; SQLite treats NULL as distinct)
    with engine.begin() as conn:
        try:
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username)"))
        except Exception:
            pass


def _ensure_user_settings_columns() -> None:
    """SQLite-friendly ALTER for preferred_timezone / preferred_locale / first_name when upgrading an existing DB."""
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "users" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("users")}
    with engine.begin() as conn:
        if "preferred_timezone" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN preferred_timezone VARCHAR(128)"))
        if "preferred_locale" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN preferred_locale VARCHAR(16)"))
        if "first_name" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN first_name VARCHAR(64)"))


def _ensure_user_last_login_column() -> None:
    """SQLite-friendly ALTER for users.last_login_at when upgrading an existing DB."""
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "users" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("users")}
    if "last_login_at" in cols:
        return
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN last_login_at DATETIME"))


FREE_USERS_TO_PRO_MIGRATION = "upgrade_existing_free_users_to_pro_20261119"


def upgrade_existing_free_users_to_pro() -> int:
    """One-time: existing free accounts become Pro so nobody loses access when the overlay is off.

    Already-Pro users are left alone. Idempotent: a later startup (or an admin
    switch back to Free) must not re-upgrade rows. Returns the number of rows
    upgraded on this run (0 if already applied).
    """
    from sqlalchemy import inspect

    from .models import DataMigration, User

    insp = inspect(engine)
    if "users" not in insp.get_table_names():
        return 0

    Base.metadata.create_all(bind=engine, tables=[DataMigration.__table__])

    db = SessionLocal()
    try:
        if db.get(DataMigration, FREE_USERS_TO_PRO_MIGRATION) is not None:
            return 0
        upgraded = (
            db.query(User)
            .filter(User.subscription_tier == "free")
            .update(
                {"subscription_tier": "biohacker_pro", "biohacking_enabled": True},
                synchronize_session=False,
            )
        )
        db.add(DataMigration(name=FREE_USERS_TO_PRO_MIGRATION))
        db.commit()
        return int(upgraded or 0)
    finally:
        db.close()
