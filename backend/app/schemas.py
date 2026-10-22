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


class TodayIndication(BaseModel):
    energy_level: int = Field(..., ge=1, le=5)
    energy_label: str
    preferred_space: Literal["people", "alone", "nature", "focus", "out"]
    preferred_space_label: str
    main_action_text: str
    main_action_why: str
    main_action_micro: str
    drivers: list[str] = []
    has_natal: bool = True
    save_chart_cta: bool = False
    disclaimer: str = ""


class TransitResponse(BaseModel):
    transit: dict[str, Any]
    overlay: dict[str, Any] | None = None
    indication: TodayIndication | None = None


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
    is_admin: bool = False

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


class UsageEventOut(BaseModel):
    id: int
    user_id: int | None = None
    email: str
    display_name: str = ""
    username: str | None = None
    event_type: str
    created_at: datetime
    metadata: dict[str, Any] = Field(default_factory=dict)


class UsageEventsPage(BaseModel):
    total: int
    items: list[UsageEventOut]


class UsageStatsDay(BaseModel):
    day: str
    logins: int
    unique_users_logged_in: int
    charts_generated: int
    protocols_generated: int


class UsageStatsWeek(BaseModel):
    week: str
    week_start: str
    logins: int
    unique_users_logged_in: int
    charts_generated: int
    protocols_generated: int


class UsageStatsMonth(BaseModel):
    month: str
    logins: int
    unique_users_logged_in: int
    charts_generated: int
    protocols_generated: int


class SoulSyncIn(BaseModel):
    user_id: int
    self_chart_id: int
    friend_chart_id: int
    context: Literal["work", "life", "play"] = "life"
    # Ignored — Fit-era co-reg toggles removed; kept optional for one release.
    protocols: list[str] = Field(default_factory=list)


class SoulPersonOut(BaseModel):
    id: int | None = None
    label: str = ""
    type: str | None = None
    profile: str | None = None
    authority: str | None = None
    definition: str | None = None


class SoulSignatureOut(BaseModel):
    id: str
    label: str
    emoji: str = ""
    subtext: str = ""


class SoulBadgeOut(BaseModel):
    id: str
    label: str
    detail: str = ""


class SoulSpectrumOut(BaseModel):
    id: str
    label: str
    low_label: str
    high_label: str
    position: int
    summary: str = ""
    drivers: list[dict[str, Any]] = Field(default_factory=list)


class SoulCardBlockOut(BaseModel):
    headline: str
    body: str


class SoulCardOut(BaseModel):
    id: str
    title: str
    body_blocks: list[SoulCardBlockOut] = Field(default_factory=list)
    empty_body: str | None = None
    bridges: list[dict[str, Any]] | None = None
    protocols: list[dict[str, Any]] | None = None


class SoulPlaybookOut(BaseModel):
    id: str
    label: str
    card_order: list[str] = Field(default_factory=list)


class SoulCompositeOut(BaseModel):
    defined_count: int
    open_count: int
    definition: str = ""
    defined_centers: list[str] = Field(default_factory=list)


class SoulSyncOut(BaseModel):
    self: SoulPersonOut
    friend: SoulPersonOut
    context: str
    playbook: SoulPlaybookOut
    signature: SoulSignatureOut
    secondary_signature: SoulSignatureOut | None = None
    badges: list[SoulBadgeOut] = Field(default_factory=list)
    spectrums: list[SoulSpectrumOut] = Field(default_factory=list)
    cards: list[SoulCardOut] = Field(default_factory=list)
    channel_roles: dict[str, list[dict[str, Any]]] = Field(default_factory=dict)
    split_bridges: list[dict[str, Any]] = Field(default_factory=list)
    friend_split_bridges: list[dict[str, Any]] = Field(default_factory=list)
    conditioning_strip: list[dict[str, Any]] = Field(default_factory=list)
    composite: SoulCompositeOut
    disclaimer: str = ""
