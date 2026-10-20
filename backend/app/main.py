from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router
from .config import get_settings
from .database import SessionLocal, init_db
from .hd.ephemeris import init_ephemeris
from .geocode.service import seed_geocode_cache
from .models import User


def seed_dev_users() -> None:
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add_all(
                [
                    User(
                        email="dev.free@example.com",
                        display_name="Dev Free",
                        auth_provider="dev",
                        subscription_tier="free",
                        biohacking_enabled=False,
                    ),
                    User(
                        email="dev.pro@example.com",
                        display_name="Dev Pro",
                        auth_provider="dev",
                        subscription_tier="biohacker_pro",
                        biohacking_enabled=True,
                    ),
                ]
            )
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    init_ephemeris()
    init_db()
    if settings.seed_dev_users:
        seed_dev_users()
    db = SessionLocal()
    try:
        seed_geocode_cache(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="HD Biohack API",
    version="1.0.0",
    description="Human Design chart + transit + biohacking protocol engine (V1)",
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
