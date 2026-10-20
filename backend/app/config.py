from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_ROOT.parent


def _default_env_file() -> str:
    for candidate in (REPO_ROOT / ".env", BACKEND_ROOT / ".env"):
        if candidate.is_file():
            return str(candidate)
    return str(REPO_ROOT / ".env")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_default_env_file(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = ""
    # Absolute path for SQLite (Railway volume). Empty → backend/data/hd_biohack.db
    sqlite_path: str = ""
    supabase_url: str = ""
    supabase_anon_key: str = ""
    llm_provider: str = ""  # xai | openai | anthropic
    llm_api_key: str = ""
    nominatim_user_agent: str = "hd-biohack-v1/1.0 (local-dev; contact@example.com)"
    enforce_paywall: bool = False
    seed_dev_users: bool = True
    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        validation_alias=AliasChoices("CORS_ORIGINS", "ALLOWED_ORIGINS", "cors_origins"),
    )

    @property
    def use_postgres(self) -> bool:
        return bool(self.database_url and self.database_url.startswith("postgres"))

    @property
    def sqlalchemy_url(self) -> str:
        if self.use_postgres:
            url = self.database_url.strip()
            # Railway / Heroku style → SQLAlchemy + psycopg3
            if url.startswith("postgres://"):
                url = "postgresql+psycopg://" + url[len("postgres://") :]
            elif url.startswith("postgresql://") and "+psycopg" not in url.split("://", 1)[0]:
                url = "postgresql+psycopg://" + url[len("postgresql://") :]
            return url
        if self.sqlite_path:
            db_path = Path(self.sqlite_path)
        else:
            db_path = BACKEND_ROOT / "data" / "hd_biohack.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_path}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
