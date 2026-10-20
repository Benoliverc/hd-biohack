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
  display_name: string;
  auth_provider: string;
  subscription_tier: "free" | "biohacker_pro" | string;
  stripe_customer_id: string | null;
  biohacking_enabled: boolean;
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

export const api = {
  health: () => req<{ status: string }>("/health"),
  users: () => req<User[]>("/users"),
  setTier: (id: number, tier: string) =>
    req<User>(`/users/${id}/tier?tier=${encodeURIComponent(tier)}`, { method: "PATCH" }),
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
  }) =>
    req<{ chart: Record<string, unknown>; natal_chart_id: number | null }>("/chart/calculate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  charts: (userId: number) => req<SavedChartRow[]>(`/charts/${userId}`),
  renameChart: (chartId: number, label: string) =>
    req<{ id: number; label: string; slot_kind: string }>(`/charts/${chartId}`, {
      method: "PATCH",
      body: JSON.stringify({ label }),
    }),
  deleteChart: (chartId: number, userId: number) =>
    req<{ ok: boolean; id: number }>(`/charts/${chartId}?user_id=${userId}`, {
      method: "DELETE",
    }),
  transitsToday: (natalChartId?: number) =>
    req<{ transit: Record<string, unknown>; overlay: Record<string, unknown> | null }>(
      `/transits/today${natalChartId ? `?natal_chart_id=${natalChartId}` : ""}`
    ),
  protocol: (userId: number, natalChartId?: number) =>
    req<{ entitlement: Record<string, unknown>; overlay: Record<string, unknown>; protocol: Record<string, unknown> }>(
      "/biohack/protocol",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId, natal_chart_id: natalChartId ?? null }),
      }
    ),
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
};

export { API_BASE };
