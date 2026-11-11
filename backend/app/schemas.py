from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class BirthDataIn(BaseModel):
    birth_date: str = Field(..., description="YYYY-MM-DD")
    birth_time: str | None = Field(None, description="HH:MM or HH:MM:SS")
    birth_city: str
    user_id: int | None = None
    save: bool = False
    lat: float | None = None
    lon: float | None = None
    label: str | None = Field(None, description="Display name, e.g. Me or a friend")
    slot_kind: Literal["self", "friend"] = "self"
    role: Literal["self", "person", "partner"] | None = Field(
        None,
        description="Relationship label: self for Me; person|partner for people charts",
    )
    natal_chart_id: int | None = Field(
        None,
        description="When set with save=true, update this existing chart instead of inserting",
    )
    time_unknown: bool = Field(
        False,
        description="True when birth time is unknown; server stores and calculates 12:00:00 local noon",
    )


class ChartLabelPatch(BaseModel):
    label: str = Field(..., min_length=1, max_length=128)
    role: Literal["person", "partner"] | None = Field(
        None, description="People charts only: person | partner"
    )


class ChartResponse(BaseModel):
    chart: dict[str, Any]
    natal_chart_id: int | None = None


class DailySignal(BaseModel):
    key: str
    headline: str
    body: str
    source: Literal[
        "moon_gate",
        "moon_line",
        "sun_line",
        "sun_gate",
        "hanging_pressure",
        "conditioning",
        "continuity",
    ]


class VsYesterdayDelta(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    field: Literal[
        "moon",
        "sun",
        "hanging_pressure",
        "bridge",
        "newly_defined",
        "energy",
        "space",
    ]
    from_value: str = Field(..., alias="from")
    to: str


class TomorrowTease(BaseModel):
    kind: Literal[
        "moon_leaves",
        "moon_holds",
        "sun_theme_leaves",
        "sun_theme_holds",
    ]
    text: str
    moon_gate_today: int | None = None
    moon_gate_tomorrow: int | None = None
    sun_gate_today: int | None = None
    sun_gate_tomorrow: int | None = None


class SkyStory(BaseModel):
    """Free serial weather chapter under Today's new signal (mechanics only)."""

    lines: list[str] = Field(default_factory=list)
    tomorrow: TomorrowTease | None = None
    continuity_day: int = 1
    bridge_day: int = 0



class TodayKitItem(BaseModel):
    name: str
    dose: str = ""
    kit_supplement_id: str = ""
    item_id: str = ""


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
    daily_signal: DailySignal | None = None
    vs_yesterday: list[VsYesterdayDelta] = Field(default_factory=list)
    conditioning_caption: str = ""
    sky_story: SkyStory | None = None
    # PR1 transit→moment→Move + kit slot
    moment: str | None = None
    moment_noun: Literal["calm", "focus", "recovery"] | None = None
    when_slot: Literal["morning", "midday", "evening"] | None = None
    move_item_id: str | None = None
    kit_placeholder: bool = True
    kit_item: TodayKitItem | None = None


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
    preferred_timezone: str | None = None
    preferred_locale: str | None = None
    first_name: str | None = None
    is_admin: bool = False
    # Effective Pro access (includes BETA_FULL_ACCESS). FE must not invent this.
    biohacking_unlocked: bool = False
    beta_full_access: bool = False

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):  # type: ignore[override]
        data = super().model_validate(obj, *args, **kwargs)
        from .entitlements import user_has_biohacking

        unlocked = False
        if hasattr(obj, "subscription_tier"):
            unlocked = user_has_biohacking(obj)
        else:
            class _U:
                biohacking_enabled = data.biohacking_enabled
                subscription_tier = data.subscription_tier

            unlocked = user_has_biohacking(_U())
        from .config import get_settings

        return data.model_copy(
            update={
                "biohacking_unlocked": unlocked,
                "beta_full_access": bool(get_settings().beta_full_access),
            }
        )


class UserSettingsPatch(BaseModel):
    preferred_timezone: str | None = Field(
        None,
        description="IANA timezone for Protocols day/week; null clears to Asia/Hong_Kong fallback",
        max_length=128,
    )
    preferred_locale: str | None = Field(
        None,
        description="UI locale BCP-47: en|nl|de|fr|es; null clears to en default",
        max_length=16,
    )
    first_name: str | None = Field(
        None,
        description="Optional first name for Home greeting; null/empty clears",
        max_length=64,
    )


class DailyIntentionIn(BaseModel):
    day: date = Field(..., description="YYYY-MM-DD in account timezone")
    text: str = Field("", max_length=200)


class DailyIntentionOut(BaseModel):
    day: date
    text: str

    class Config:
        from_attributes = True


class ProtocolCompletionIn(BaseModel):
    chart_id: int
    day: date
    item_id: str = Field(..., min_length=1, max_length=128)
    kind: Literal["move", "baseline", "evening"] = "move"
    label: str = Field("", max_length=255)
    done: bool = False
    note: str | None = Field(None, max_length=120)


class ProtocolCompletionOut(BaseModel):
    chart_id: int
    day: date
    item_id: str
    kind: str
    label: str
    done: bool
    note: str | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class ProtocolCompletionsOut(BaseModel):
    items: list[ProtocolCompletionOut] = Field(default_factory=list)


class LoginIn(BaseModel):
    """`username` accepts email or username during the overlap period."""
    username: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class RegisterIn(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str | None = Field(default=None, max_length=64)


class AuthSessionOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ForgotPasswordIn(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)


class ResetPasswordIn(BaseModel):
    token: str = Field(..., min_length=8, max_length=256)
    password: str = Field(..., min_length=8, max_length=128)


class MessageOut(BaseModel):
    message: str


class InventoryItemIn(BaseModel):
    user_id: int
    name: str
    notes: str = ""
    active: bool = True


class ProtocolRequest(BaseModel):
    user_id: int
    natal_chart_id: int | None = None
    # FE-persisted post-rotation fingerprint from previous HKT day (anti-whiplash).
    yesterday_lead_fingerprint: str | None = None


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


class PageVisitStat(BaseModel):
    views: int = 0
    unique_users: int = 0


class PageVisitsStats(BaseModel):
    home: PageVisitStat = Field(default_factory=PageVisitStat)
    today: PageVisitStat = Field(default_factory=PageVisitStat)
    chart: PageVisitStat = Field(default_factory=PageVisitStat)
    protocols: PageVisitStat = Field(default_factory=PageVisitStat)
    soul: PageVisitStat = Field(default_factory=PageVisitStat)


class PageViewIn(BaseModel):
    path: str
    user_id: int | None = None


class UsageStatsDay(BaseModel):
    day: str
    logins: int
    unique_users_logged_in: int
    charts_generated: int
    protocols_generated: int
    page_visits: PageVisitsStats = Field(default_factory=PageVisitsStats)


class UsageStatsWeek(BaseModel):
    week: str
    week_start: str
    logins: int
    unique_users_logged_in: int
    charts_generated: int
    protocols_generated: int
    page_visits: PageVisitsStats = Field(default_factory=PageVisitsStats)


class UsageStatsMonth(BaseModel):
    month: str
    logins: int
    unique_users_logged_in: int
    charts_generated: int
    protocols_generated: int
    page_visits: PageVisitsStats = Field(default_factory=PageVisitsStats)


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
    role: Literal["self", "person", "partner"] | None = None


class SoulSignatureOut(BaseModel):
    id: str
    label: str
    emoji: str = ""
    subtext: str = ""
    tier: str | None = None
    tier_label: str | None = None


class SoulBadgeOut(BaseModel):
    id: str
    label: str
    detail: str = ""
    description: str = ""


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
    lede: str = ""
    focus_hint: str | None = None


class SoulCompositeOut(BaseModel):
    defined_count: int
    open_count: int
    definition: str = ""
    defined_centers: list[str] = Field(default_factory=list)


class SoulPartnerNuanceOut(BaseModel):
    romantic_synergy: str
    romantic_friction: str
    gift_in_love: str | None = None
    tender_spot: str | None = None


class SoulLoveGuidanceItemOut(BaseModel):
    id: str
    title: str
    body: str
    try_: str = Field(alias="try")

    model_config = ConfigDict(populate_by_name=True)


class SoulLoveGuidanceSectionOut(BaseModel):
    title: str
    body: str
    try_: str = Field(alias="try")

    model_config = ConfigDict(populate_by_name=True)


class SoulPartnerOverviewOut(BaseModel):
    hook: str
    the_current: str
    how_you_love: str
    how_they_love: str
    what_this_asks: str
    tender_spots: str
    try_this: str
    # Legacy aliases (same strings as the_current / what_this_asks / tender_spots).
    core_dynamic: str
    mutual_growth: str
    relationship_challenges: str
    # Love dynamics (partner role) — nested on the overview hero object.
    harmonies: list[SoulLoveGuidanceItemOut] = Field(default_factory=list)
    frictions: list[SoulLoveGuidanceItemOut] = Field(default_factory=list)
    how_you_decide: SoulLoveGuidanceSectionOut | None = None
    how_you_communicate: SoulLoveGuidanceSectionOut | None = None
    when_you_clash: SoulLoveGuidanceSectionOut | None = None


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
    partner_overview: SoulPartnerOverviewOut | None = None


# --- Admin User Insights -------------------------------------------------------


class AdminNewUserBrief(BaseModel):
    id: int
    display_name: str = ""
    username: str | None = None
    email: str
    created_at: datetime


class AdminSignupBannerItem(BaseModel):
    user_id: int | None = None
    display_name: str = ""
    email: str = ""
    created_at: datetime
    source: str = "signup_event"


class AdminOverviewPulseOut(BaseModel):
    new_today_count: int
    new_today: list[AdminNewUserBrief]
    new_this_week: int
    new_last_week: int
    week_spark_delta: int
    total_accounts: int
    total_accounts_including_seed: int
    signups_last_24h: list[AdminSignupBannerItem]


class AdminInsightsOut(BaseModel):
    period_days: int
    active_users: int
    new_users: int
    avg_logins_per_active: float
    median_days_since_last_login: float | None = None
    activation_pct: float | None = None
    activation_count: int = 0
    today_engagement_pct: float | None = None
    avg_page_visits_per_active: dict[str, float] = Field(default_factory=dict)
    avg_charts_per_active: float = 0.0
    avg_protocols_per_active: float = 0.0
    return_d1_pct: float | None = None
    return_d7_pct: float | None = None


class AdminUserListItem(BaseModel):
    id: int
    email: str
    username: str | None = None
    display_name: str = ""
    first_name: str | None = None
    created_at: datetime | None = None
    last_login_at: datetime | None = None
    login_count: int = 0
    subscription_tier: str = "free"
    biohacking_enabled: bool = False
    biohacking_unlocked: bool = False
    beta_full_access: bool = False
    has_me_natal: bool = False
    last_active_at: datetime | None = None
    is_seed_or_dev: bool = False


class AdminUsersPage(BaseModel):
    total: int
    items: list[AdminUserListItem]


class AdminUserDetailOut(BaseModel):
    id: int
    email: str
    username: str | None = None
    display_name: str = ""
    first_name: str | None = None
    created_at: datetime | None = None
    auth_provider: str = "password"
    subscription_tier: str = "free"
    biohacking_enabled: bool = False
    biohacking_unlocked: bool = False
    beta_full_access: bool = False
    login_count: int = 0
    first_login_at: datetime | None = None
    last_login_at: datetime | None = None
    days_since_last_login: float | None = None
    has_me_natal: bool = False
    people_count: int = 0
    partner_tagged: bool = False
    charts_generated: int = 0
    protocols_generated: int = 0
    page_views: dict[str, int] = Field(default_factory=dict)
    recent_events: list[UsageEventOut] = Field(default_factory=list)
    kit_items_active: int = 0
    move_completions: int = 0
    is_seed_or_dev: bool = False
