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


def _ensure_natal_chart_columns() -> None:
    """SQLite-friendly ALTER for label/slot_kind when upgrading an existing DB."""
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
