from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class BirthDataIn(BaseModel):
    birth_date: str = Field(..., description="YYYY-MM-DD")
    birth_time: str = Field(..., description="HH:MM or HH:MM:SS")
    birth_city: str
    user_id: int | None = None
    save: bool = False
    lat: float | None = None
    lon: float | None = None
    label: str | None = Field(None, description="Display name, e.g. Me or a friend")
    slot_kind: Literal["self", "friend"] = "self"
    natal_chart_id: int | None = Field(
        None,
        description="When set with save=true, update this existing chart instead of inserting",
    )


class ChartLabelPatch(BaseModel):
    label: str = Field(..., min_length=1, max_length=128)


class ChartResponse(BaseModel):
    chart: dict[str, Any]
    natal_chart_id: int | None = None


class TransitResponse(BaseModel):
    transit: dict[str, Any]
    overlay: dict[str, Any] | None = None


class UserCreate(BaseModel):
    email: str
    display_name: str = ""
    auth_provider: str = "dev"
    subscription_tier: Literal["free", "biohacker_pro"] = "free"
    biohacking_enabled: bool = False


class UserOut(BaseModel):
    id: int
    email: str
    username: str | None = None
    display_name: str
    auth_provider: str
    subscription_tier: str
    stripe_customer_id: str | None
    biohacking_enabled: bool

    class Config:
        from_attributes = True


class LoginIn(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)


class InventoryItemIn(BaseModel):
    user_id: int
    name: str
    notes: str = ""
    active: bool = True


class ProtocolRequest(BaseModel):
    user_id: int
    natal_chart_id: int | None = None


class TelemetryIn(BaseModel):
    user_id: int
    day: date
    hrv_ms: float | None = None
    resting_hr: float | None = None
    sleep_score: float | None = None
    deep_sleep_mins: float | None = None
    steps: int | None = None
    active_calories: float | None = None
    source_device: str | None = None


class GeocodeOut(BaseModel):
    display_name: str
    lat: float
    lon: float
    cached: bool
    source: str | None = None
    timezone: str | None = None


class GeocodeSuggestOut(BaseModel):
    results: list[GeocodeOut]
