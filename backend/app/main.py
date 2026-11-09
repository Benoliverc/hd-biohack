from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router
from .config import get_settings
from .database import SessionLocal, init_db
from .hd.ephemeris import init_ephemeris
from .geocode.service import seed_geocode_cache
from .auth import ensure_dev_users, seed_password_users
from .usage import backfill_usage_from_history


def seed_dev_users() -> None:
    """Ensure Dev Free / Dev Pro exist (no wipe)."""
    db = SessionLocal()
    try:
        ensure_dev_users(db)
    finally:
        db.close()


def seed_test_password_users() -> None:
    """Upsert the 10 username/password test accounts."""
    db = SessionLocal()
    try:
        seed_password_users(db)
    finally:
        db.close()



def cleanup_probe_user() -> None:
    """Delete ONLY the auth-audit probe user (id 18 / exact email) if present."""
    from sqlalchemy import text as sql_text
    from .database import SessionLocal, engine
    from .models import User

    db = SessionLocal()
    try:
        target_email = "probe-should-not-create@example.invalid"
        row = db.query(User).filter(User.email == target_email).first()
        if row is None:
            # Also match exact id 18 only when email matches the probe (belt-and-suspenders)
            return
        uid = row.id
        # Cascade-clean lightweight child rows we own; avoid broad deletes
        for table in (
            "password_reset_tokens",
            "auth_sessions",
            "usage_events",
            "protocol_completions",
            "user_daily_intentions",
            "user_biometrics_daily",
            "user_supplement_inventory",
            "weekly_protocols",
            "natal_charts",
        ):
            try:
                db.execute(sql_text(f"DELETE FROM {table} WHERE user_id = :uid"), {"uid": uid})
            except Exception:
                pass
        db.delete(row)
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    init_ephemeris()
    init_db()
    cleanup_probe_user()
    if settings.seed_dev_users:
        seed_dev_users()
        seed_test_password_users()
    db = SessionLocal()
    try:
        seed_geocode_cache(db)
        try:
            backfill_usage_from_history(db)
        except Exception:
            pass
    finally:
        db.close()
    yield


app = FastAPI(
    title="Baseline API",
    version="1.0.0",
    description="Baseline — Human Design chart, transit overlay, and protocol engine (V1)",
    lifespan=lifespan,
)

settings = get_settings()
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "name": "hd-biohack",
        "version": "1.0.0",
        "docs": "/docs",
        "db": "postgres" if settings.use_postgres else "sqlite",
    }
