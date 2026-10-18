from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = ""
    supabase_url: str = ""
    supabase_anon_key: str = ""
    llm_provider: str = ""  # xai | openai | anthropic
    llm_api_key: str = ""
    nominatim_user_agent: str = "hd-biohack-v1/1.0 (local-dev; contact@example.com)"
    enforce_paywall: bool = False
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def use_postgres(self) -> bool:
        return bool(self.database_url and self.database_url.startswith("postgres"))

    @property
    def sqlalchemy_url(self) -> str:
        if self.use_postgres:
            return self.database_url
        db_path = ROOT / "backend" / "data" / "hd_biohack.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_path}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
