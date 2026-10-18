const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
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

export const api = {
  health: () => req<{ status: string }>("/health"),
  users: () => req<User[]>("/users"),
  setTier: (id: number, tier: string) =>
    req<User>(`/users/${id}/tier?tier=${encodeURIComponent(tier)}`, { method: "PATCH" }),
  calculateChart: (body: {
    birth_date: string;
    birth_time: string;
    birth_city: string;
    user_id?: number;
    save?: boolean;
  }) =>
    req<{ chart: Record<string, unknown>; natal_chart_id: number | null }>("/chart/calculate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  charts: (userId: number) =>
    req<Array<{ id: number; birth_city: string; type: string; profile: string; chart: Record<string, unknown> }>>(
      `/charts/${userId}`
    ),
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
    req("/inventory", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, name }),
    }),
};

export { API_BASE };
