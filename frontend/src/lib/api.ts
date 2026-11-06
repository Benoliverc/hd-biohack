// Relative proxy via Next.js rewrite → FastAPI on :8000 (browser never hits :8000)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/backend";

function isNetworkFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    err.name === "TypeError" ||
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("load failed") ||
    msg.includes("fetch failed")
  );
}

const NETWORK_HINT =
  API_BASE.startsWith("http")
    ? `Can't reach the API at ${API_BASE}. Check that the Railway service is up, CORS_ORIGINS includes this site, and NEXT_PUBLIC_API_URL has no trailing slash.`
    : "Can't reach the API. Check that the backend is running and that the app uses the Next rewrite (/api/backend), not a direct :8000 URL from a public tunnel.";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
  } catch (err) {
    if (isNetworkFailure(err)) throw new Error(NETWORK_HINT);
    throw err instanceof Error ? err : new Error(String(err));
  }
  if (!res.ok) {
    const text = await res.text();
    let msg = text || res.statusText;
    try {
      const j = JSON.parse(text);
      if (j?.detail) msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {
      /* keep raw */
    }
    throw new Error(msg);
  }
  return res.json();
}

export type User = {
  id: number;
  email: string;
  username?: string | null;
  display_name: string;
  auth_provider: string;
  subscription_tier: "free" | "biohacker_pro" | string;
  stripe_customer_id: string | null;
  biohacking_enabled: boolean;
  preferred_timezone?: string | null;
  preferred_locale?: string | null;
  first_name?: string | null;
  is_admin?: boolean;
};

export type DailyIntention = {
  day: string;
  text: string;
};

export type ProtocolCompletionRow = {
  chart_id: number;
  day: string;
  item_id: string;
  kind: string;
  label: string;
  done: boolean;
  note?: string | null;
  updated_at?: string | null;
};

export type GeoPlace = {
  display_name: string;
  lat: number;
  lon: number;
  cached: boolean;
  source?: string | null;
  timezone?: string | null;
};

export type SavedChartRow = {
  id: number;
  label?: string;
  slot_kind?: "self" | "friend" | string;
  /** People charts: person | partner. Me: self. */
  role?: "self" | "person" | "partner" | string;
  birth_date?: string;
  birth_time?: string;
  birth_city: string;
  lat?: number;
  lon?: number;
  timezone?: string | null;
  type: string;
  profile: string;
  authority?: string;
  strategy?: string;
  chart: Record<string, unknown>;
};


export type PreferredSpace = "people" | "alone" | "nature" | "focus" | "out";

export type DailySignalSource =
  | "moon_gate"
  | "moon_line"
  | "sun_line"
  | "sun_gate"
  | "hanging_pressure"
  | "conditioning"
  | "continuity";

export type DailySignal = {
  key: string;
  headline: string;
  body: string;
  source: DailySignalSource;
};

export type VsYesterdayDelta = {
  field:
    | "moon"
    | "sun"
    | "hanging_pressure"
    | "bridge"
    | "newly_defined"
    | "energy"
    | "space";
  from: string;
  to: string;
};

export type TomorrowTeaseKind =
  | "moon_leaves"
  | "moon_holds"
  | "sun_theme_leaves"
  | "sun_theme_holds";

export type TomorrowTease = {
  kind: TomorrowTeaseKind;
  text: string;
  moon_gate_today?: number | null;
  moon_gate_tomorrow?: number | null;
  sun_gate_today?: number | null;
  sun_gate_tomorrow?: number | null;
};

export type SkyStory = {
  lines: string[];
  tomorrow?: TomorrowTease | null;
  continuity_day?: number;
  bridge_day?: number;
};

export type TodayKitItem = {
  name: string;
  dose?: string;
  kit_supplement_id?: string;
  item_id: string;
};

export type TodayMomentNoun = "calm" | "focus" | "recovery";
export type TodayWhenSlot = "morning" | "midday" | "evening";

export type TodayIndicationPayload = {
  energy_level: number;
  energy_label: string;
  preferred_space: PreferredSpace;
  preferred_space_label: string;
  main_action_text: string;
  main_action_why: string;
  main_action_micro: string;
  drivers?: string[];
  has_natal: boolean;
  save_chart_cta: boolean;
  disclaimer: string;
  daily_signal?: DailySignal | null;
  vs_yesterday?: VsYesterdayDelta[];
  conditioning_caption?: string;
  sky_story?: SkyStory | null;
  /** PR1 transit → moment → Move + kit */
  moment?: string | null;
  moment_noun?: TodayMomentNoun | null;
  when_slot?: TodayWhenSlot | null;
  move_item_id?: string | null;
  kit_placeholder?: boolean;
  kit_item?: TodayKitItem | null;
};


export type UsageEventType = "login" | "chart_generated" | "protocol_generated";

export type UsageEvent = {
  id: number;
  user_id: number | null;
  email: string;
  display_name: string;
  username?: string | null;
  event_type: UsageEventType | string;
  created_at: string;
  metadata: Record<string, unknown>;
};

export type UsageEventsPage = {
  total: number;
  items: UsageEvent[];
};

export type UsageStatsBucket = {
  logins: number;
  unique_users_logged_in: number;
  charts_generated: number;
  protocols_generated: number;
};

export type UsageStatsDay = UsageStatsBucket & { day: string };
export type UsageStatsWeek = UsageStatsBucket & { week: string; week_start: string };
export type UsageStatsMonth = UsageStatsBucket & { month: string };


export type SoulContext = "work" | "life" | "play";

export type SoulSyncRequest = {
  user_id: number;
  self_chart_id: number;
  friend_chart_id: number;
  context?: SoulContext;
  /** Ignored by Aura Alchemy API (compat). */
  protocols?: string[];
};

export type SoulPerson = {
  id: number | null;
  label: string;
  type?: string | null;
  profile?: string | null;
  authority?: string | null;
  definition?: string | null;
  /** self for Me; person | partner for Person B. */
  role?: "self" | "person" | "partner" | string | null;
};

export type SoulPartnerNuance = {
  romantic_synergy: string;
  romantic_friction: string;
  gift_in_love?: string | null;
  tender_spot?: string | null;
};

export type SoulLoveGuidanceItem = {
  id: string;
  title: string;
  body: string;
  try: string;
};

export type SoulLoveGuidanceSection = {
  title: string;
  body: string;
  try: string;
};

export type SoulPartnerOverview = {
  hook: string;
  the_current: string;
  how_you_love: string;
  how_they_love: string;
  what_this_asks: string;
  tender_spots: string;
  try_this: string;
  /** Legacy aliases — same strings as the new chapter fields. */
  core_dynamic: string;
  mutual_growth: string;
  relationship_challenges: string;
  /** Partner Love dynamics — omitted / empty for non-partner. */
  harmonies?: SoulLoveGuidanceItem[];
  frictions?: SoulLoveGuidanceItem[];
  how_you_decide?: SoulLoveGuidanceSection | null;
  how_you_communicate?: SoulLoveGuidanceSection | null;
  when_you_clash?: SoulLoveGuidanceSection | null;
};

export type SoulDriver = {
  kind: string;
  pts: number;
  channel?: string;
  gates?: number[];
  gate?: number;
  center?: string;
  profiles?: Array<string | null>;
};

export type SoulSignature = {
  id: string;
  label: string;
  emoji?: string;
  subtext: string;
  tier?: string | null;
  tier_label?: string | null;
};

export type SoulBadge = {
  id: string;
  label: string;
  detail?: string;
  description?: string;
};

export type SoulSpectrum = {
  id: string;
  label: string;
  low_label: string;
  high_label: string;
  position: number;
  summary: string;
  drivers: SoulDriver[];
};

export type SoulCardBlock = {
  headline: string;
  body: string;
};

export type SoulCard = {
  id: string;
  title: string;
  body_blocks: SoulCardBlock[];
  empty_body?: string | null;
  bridges?: Array<{
    gate: number;
    channel: string;
    held_by: string;
    missing_for: string;
    partner_nuance?: SoulPartnerNuance;
  }>;
  protocols?: Array<{ id: string; title: string; body: string }>;
};

export type SoulSyncResult = {
  self: SoulPerson;
  friend: SoulPerson;
  context: SoulContext | string;
  playbook: {
    id: string;
    label: string;
    card_order: string[];
    lede?: string;
    focus_hint?: string | null;
  };
  signature: SoulSignature;
  secondary_signature?: SoulSignature | null;
  badges: SoulBadge[];
  spectrums: SoulSpectrum[];
  cards: SoulCard[];
  channel_roles: Record<string, Array<Record<string, unknown>>>;
  split_bridges: Array<{
    gate: number;
    channel: string;
    held_by: string;
    missing_for: string;
    partner_nuance?: SoulPartnerNuance;
  }>;
  friend_split_bridges?: Array<{
    gate: number;
    channel: string;
    held_by: string;
    missing_for: string;
    partner_nuance?: SoulPartnerNuance;
  }>;
  /** Present only when Person B role is partner. */
  partner_overview?: SoulPartnerOverview | null;
  conditioning_strip: Array<{
    center: string;
    self: "defined" | "open" | string;
    friend: "defined" | "open" | string;
    direction: string;
    hint: string;
  }>;
  composite: {
    defined_count: number;
    open_count: number;
    definition: string;
    defined_centers: string[];
  };
  disclaimer: string;
  /** Legacy Fit fields — if present, FE shows API-lag empty state. */
  natural_fit?: number;
};

export const api = {
  health: () => req<{ status: string }>("/health"),
  login: (username: string, password: string) =>
    req<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  users: () => req<User[]>("/users"),
  setTier: (id: number, tier: string, actorUserId: number) =>
    req<User>(
      `/users/${id}/tier?tier=${encodeURIComponent(tier)}&actor_user_id=${actorUserId}`,
      { method: "PATCH" }
    ),
  geocode: (q: string) =>
    req<GeoPlace>(`/geocode?q=${encodeURIComponent(q)}`),
  geocodeSuggest: (q: string) =>
    req<{ results: GeoPlace[] }>(`/geocode/suggest?q=${encodeURIComponent(q)}`),
  geocodeSeeds: () => req<GeoPlace[]>("/geocode/seeds"),
  calculateChart: (body: {
    birth_date: string;
    birth_time: string;
    birth_city: string;
    user_id?: number;
    save?: boolean;
    lat?: number | null;
    lon?: number | null;
    label?: string | null;
    slot_kind?: "self" | "friend";
    role?: "self" | "person" | "partner" | null;
    natal_chart_id?: number | null;
  }) =>
    req<{ chart: Record<string, unknown>; natal_chart_id: number | null }>("/chart/calculate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  charts: (userId: number) => req<SavedChartRow[]>(`/charts/${userId}`),
  renameChart: (chartId: number, label: string, role?: "person" | "partner") =>
    req<{ id: number; label: string; slot_kind: string; role?: string }>(`/charts/${chartId}`, {
      method: "PATCH",
      body: JSON.stringify(role ? { label, role } : { label }),
    }),
  deleteChart: (chartId: number, userId: number) =>
    req<{ ok: boolean; id: number }>(`/charts/${chartId}?user_id=${userId}`, {
      method: "DELETE",
    }),
  transitsToday: (
    natalChartId?: number,
    opts?: { userId?: number; previewAsFree?: boolean }
  ) => {
    const q = new URLSearchParams();
    if (natalChartId) q.set("natal_chart_id", String(natalChartId));
    if (opts?.userId != null) q.set("user_id", String(opts.userId));
    if (opts?.previewAsFree) q.set("preview_as_free", "true");
    const qs = q.toString();
    return req<{
      transit: Record<string, unknown>;
      overlay: Record<string, unknown> | null;
      indication: TodayIndicationPayload | null;
    }>(`/transits/today${qs ? `?${qs}` : ""}`);
  },
  protocol: (
    userId: number,
    natalChartId?: number,
    opts?: { yesterdayLeadFingerprint?: string | null }
  ) =>
    req<{
      entitlement: Record<string, unknown>;
      overlay: Record<string, unknown>;
      indication: TodayIndicationPayload | null;
      protocol: Record<string, unknown>;
    }>("/biohack/protocol", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        natal_chart_id: natalChartId ?? null,
        yesterday_lead_fingerprint: opts?.yesterdayLeadFingerprint ?? null,
      }),
    }),
  inventory: (userId: number) =>
    req<Array<{ id: number; name: string; notes: string }>>(`/inventory/${userId}`),
  addInventory: (userId: number, name: string) =>
    req<{ id: number; name: string; active: boolean; duplicate?: boolean }>("/inventory", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, name }),
    }),
  removeInventory: (userId: number, itemId: number) =>
    req<{ ok: boolean; id: number }>(`/inventory/${itemId}?user_id=${userId}`, {
      method: "DELETE",
    }),
  adminUsageEvents: (
    actorUserId: number,
    opts?: { limit?: number; offset?: number; day?: string; event_type?: string }
  ) => {
    const q = new URLSearchParams({ actor_user_id: String(actorUserId) });
    if (opts?.limit != null) q.set("limit", String(opts.limit));
    if (opts?.offset != null) q.set("offset", String(opts.offset));
    if (opts?.day) q.set("day", opts.day);
    if (opts?.event_type) q.set("event_type", opts.event_type);
    return req<UsageEventsPage>(`/admin/usage/events?${q}`);
  },
  adminUsageStatsDaily: (actorUserId: number, from?: string, to?: string) => {
    const q = new URLSearchParams({ actor_user_id: String(actorUserId) });
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    return req<UsageStatsDay[]>(`/admin/usage/stats/daily?${q}`);
  },
  adminUsageStatsWeekly: (actorUserId: number, weeks = 12) =>
    req<UsageStatsWeek[]>(
      `/admin/usage/stats/weekly?actor_user_id=${actorUserId}&weeks=${weeks}`
    ),
  adminUsageStatsMonthly: (actorUserId: number, months = 12) =>
    req<UsageStatsMonth[]>(
      `/admin/usage/stats/monthly?actor_user_id=${actorUserId}&months=${months}`
    ),
  soulSync: (body: SoulSyncRequest) =>
    req<SoulSyncResult>("/soul/sync", {
      method: "POST",
      body: JSON.stringify({
        context: "work",
        protocols: [],
        ...body,
      }),
    }),
  getUser: (userId: number) => req<User>(`/users/${userId}`),
  patchUserSettings: (
    userId: number,
    body: {
      preferred_timezone?: string | null;
      preferred_locale?: string | null;
      first_name?: string | null;
    }
  ) =>
    req<User>(`/users/${userId}/settings`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getIntention: (userId: number, day: string) =>
    req<DailyIntention>(`/users/${userId}/intention?day=${encodeURIComponent(day)}`),
  putIntention: (userId: number, day: string, text: string) =>
    req<DailyIntention>(`/users/${userId}/intention`, {
      method: "PUT",
      body: JSON.stringify({ day, text }),
    }),
  listProtocolCompletions: (
    userId: number,
    chartId: number,
    opts?: { day?: string; from?: string; to?: string }
  ) => {
    const q = new URLSearchParams({ chart_id: String(chartId) });
    if (opts?.day) q.set("day", opts.day);
    if (opts?.from) q.set("from", opts.from);
    if (opts?.to) q.set("to", opts.to);
    return req<{ items: ProtocolCompletionRow[] }>(
      `/users/${userId}/protocol-completions?${q}`
    );
  },
  putProtocolCompletion: (
    userId: number,
    body: {
      chart_id: number;
      day: string;
      item_id: string;
      kind: "move" | "baseline";
      label: string;
      done: boolean;
      note?: string | null;
    }
  ) =>
    req<ProtocolCompletionRow>(`/users/${userId}/protocol-completions`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

export { API_BASE };
