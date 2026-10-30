from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_name: Mapped[str] = mapped_column(String(255), default="")
    auth_provider: Mapped[str] = mapped_column(String(64), default="dev")  # google | dev | password
    subscription_tier: Mapped[str] = mapped_column(String(32), default="free")  # free | biohacker_pro
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    biohacking_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    preferred_timezone: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    natal_charts: Mapped[list[NatalChart]] = relationship(back_populates="user")
    inventory: Mapped[list[SupplementInventory]] = relationship(back_populates="user")
    protocols: Mapped[list[WeeklyProtocol]] = relationship(back_populates="user")
    biometrics: Mapped[list[UserBiometricsDaily]] = relationship(back_populates="user")
    daily_intentions: Mapped[list["UserDailyIntention"]] = relationship(back_populates="user")
    protocol_completions: Mapped[list["ProtocolCompletion"]] = relationship(back_populates="user")

    @property
    def is_admin(self) -> bool:
        from .usage import is_admin_email

        return is_admin_email(self.email)


class GeocodeCache(Base):
    __tablename__ = "geocode_cache"
    __table_args__ = (UniqueConstraint("query_key", name="uq_geocode_query"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    query_key: Mapped[str] = mapped_column(String(512), index=True)
    display_name: Mapped[str] = mapped_column(String(512))
    lat: Mapped[float] = mapped_column(Float)
    lon: Mapped[float] = mapped_column(Float)
    raw: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class NatalChart(Base):
    __tablename__ = "natal_charts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    label: Mapped[str] = mapped_column(String(128), default="Me")
    slot_kind: Mapped[str] = mapped_column(String(32), default="self")  # self | friend
    birth_date: Mapped[str] = mapped_column(String(32))
    birth_time: Mapped[str] = mapped_column(String(32))
    birth_city: Mapped[str] = mapped_column(String(255))
    lat: Mapped[float] = mapped_column(Float)
    lon: Mapped[float] = mapped_column(Float)
    timezone: Mapped[str | None] = mapped_column(String(128), nullable=True)
    chart_json: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="natal_charts")


class SupplementInventory(Base):
    __tablename__ = "user_supplement_inventory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    notes: Mapped[str] = mapped_column(Text, default="")
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped[User] = relationship(back_populates="inventory")


class WeeklyProtocol(Base):
    __tablename__ = "weekly_protocols"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    week_start: Mapped[date] = mapped_column(Date)
    protocol_json: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="protocols")


class UserBiometricsDaily(Base):
    __tablename__ = "user_biometrics_daily"
    __table_args__ = (UniqueConstraint("user_id", "day", name="uq_user_day"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    day: Mapped[date] = mapped_column(Date)
    hrv_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    resting_hr: Mapped[float | None] = mapped_column(Float, nullable=True)
    sleep_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    deep_sleep_mins: Mapped[float | None] = mapped_column(Float, nullable=True)
    steps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    active_calories: Mapped[float | None] = mapped_column(Float, nullable=True)
    source_device: Mapped[str | None] = mapped_column(String(128), nullable=True)

    user: Mapped[User] = relationship(back_populates="biometrics")


class UsageEvent(Base):
    """Append-only product usage log (login / chart / protocol)."""

    __tablename__ = "usage_events"
    __table_args__ = (
        Index("ix_usage_events_type_created", "event_type", "created_at"),
        Index("ix_usage_events_user_created", "user_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True, nullable=True)
    email: Mapped[str] = mapped_column(String(255), index=True, default="")
    event_type: Mapped[str] = mapped_column(String(32), index=True)  # login | chart_generated | protocol_generated
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class UserDailyIntention(Base):
    """Optional one-line daily intention (account calendar day)."""

    __tablename__ = "user_daily_intentions"
    __table_args__ = (UniqueConstraint("user_id", "day", name="uq_user_intention_day"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    day: Mapped[date] = mapped_column(Date)
    text: Mapped[str] = mapped_column(String(200), default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="daily_intentions")


class ProtocolCompletion(Base):
    """Synced Protocols checklist completion + optional reflection note."""

    __tablename__ = "protocol_completions"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "chart_id", "day", "item_id", name="uq_protocol_completion_item"
        ),
        Index("ix_protocol_completions_user_chart_day", "user_id", "chart_id", "day"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    chart_id: Mapped[int] = mapped_column(ForeignKey("natal_charts.id"), index=True)
    day: Mapped[date] = mapped_column(Date)
    item_id: Mapped[str] = mapped_column(String(128))
    kind: Mapped[str] = mapped_column(String(32), default="move")  # move | baseline
    label: Mapped[str] = mapped_column(String(255), default="")
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    note: Mapped[str | None] = mapped_column(String(120), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="protocol_completions")
