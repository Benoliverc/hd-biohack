"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, SavedChartRow, User } from "./api";
import { readSessionUserId, writeSessionUserId } from "./session";

export type NatalChartSummary = {
  id: number;
  label?: string;
  birth_city: string;
  birth_date?: string;
  birth_time?: string;
  timezone?: string | null;
};

type AppState = {
  users: User[];
  user: User | null;
  usersLoading: boolean;
  usersError: string | null;
  setUserId: (id: number) => void;
  enforcePaywall: boolean;
  setEnforcePaywall: (v: boolean) => void;
  previewAsFree: boolean;
  setPreviewAsFree: (v: boolean) => void;
  natalChartId: number | null;
  natalChart: NatalChartSummary | null;
  natalBindingLoading: boolean;
  setNatalChartId: (id: number | null) => void;
  setNatalChart: (chart: NatalChartSummary | null) => void;
  refreshUsers: () => Promise<User[]>;
  ensureUser: () => Promise<User>;
  biohackingUnlocked: boolean;
  /** True after first users+session resolve (null user = signed out). */
  sessionReady: boolean;
  signOut: () => void;
};

const Ctx = createContext<AppState | null>(null);

const FALLBACK_USER: User = {
  id: 1,
  email: "dev.free@example.com",
  username: null,
  display_name: "Dev Free",
  auth_provider: "dev",
  subscription_tier: "free",
  stripe_customer_id: null,
  biohacking_enabled: false,
};

function summaryFromRow(row: SavedChartRow): NatalChartSummary {
  return {
    id: row.id,
    label: row.label || "Me",
    birth_city: row.birth_city || "",
    birth_date: row.birth_date,
    birth_time: row.birth_time,
    timezone: row.timezone ?? null,
  };
}

function selectedKey(userId: number) {
  return `hd-biohack:selected-chart:${userId}`;
}

function readSelectedId(userId: number): number | null {
  try {
    const raw = localStorage.getItem(selectedKey(userId));
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeSelectedId(userId: number, id: number | null) {
  try {
    if (id == null) localStorage.removeItem(selectedKey(userId));
    else localStorage.setItem(selectedKey(userId), String(id));
  } catch {
    /* ignore */
  }
}

/** Human-readable overlay label: city · date (#id). */
export function formatNatalOverlayLabel(chart: NatalChartSummary | null | undefined): string {
  if (!chart) return "";
  const who = chart.label?.trim();
  const city = chart.birth_city?.trim();
  const date = chart.birth_date?.trim();
  const parts: string[] = [];
  if (who) parts.push(who);
  if (city) parts.push(city);
  if (date) parts.push(date);
  if (parts.length) return `${parts.join(" · ")} (#${chart.id})`;
  return `natal chart #${chart.id}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [enforcePaywall, setEnforcePaywall] = useState(
    process.env.NEXT_PUBLIC_ENFORCE_PAYWALL === "true"
  );
  const [previewAsFree, setPreviewAsFree] = useState(false);
  const [natalChart, setNatalChart] = useState<NatalChartSummary | null>(null);
  // Start true so /transits and /biohack never flash the empty-natal CTA before first bind.
  const [natalBindingLoading, setNatalBindingLoading] = useState(true);

  const natalChartId = natalChart?.id ?? null;

  const setNatalChartId = useCallback((id: number | null) => {
    if (id == null) {
      setNatalChart(null);
      return;
    }
    setNatalChart((prev) => (prev?.id === id ? prev : { id, birth_city: "" }));
  }, []);

  const refreshUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const list = await api.users();
      setUsers(list);
      setUserId((prev) => {
        if (prev && list.some((u) => u.id === prev)) return prev;
        const sessionId = readSessionUserId();
        if (sessionId != null && list.some((u) => u.id === sessionId)) return sessionId;
        // Stale or missing session → signed out
        if (sessionId != null) writeSessionUserId(null);
        return null;
      });
      return list;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setUsersError(msg);
      const sessionId = readSessionUserId();
      // Keep UI usable offline only if we already had a session
      if (sessionId != null) {
        setUsers((prev) => (prev.length ? prev : [FALLBACK_USER]));
        setUserId((prev) => prev ?? sessionId);
      } else {
        setUsers((prev) => prev);
        setUserId(null);
      }
      return [];
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const ensureUser = useCallback(async () => {
    let list = users;
    if (!list.length) {
      list = await refreshUsers();
    }
    const sessionId = readSessionUserId();
    const current =
      list.find((u) => u.id === userId) ||
      (sessionId != null ? list.find((u) => u.id === sessionId) : undefined);
    if (current) {
      writeSessionUserId(current.id);
      setUserId(current.id);
      return current;
    }
    throw new Error("Not signed in — go to /login");
  }, [users, userId, refreshUsers]);

  useEffect(() => {
    refreshUsers().catch(console.error);
  }, [refreshUsers]);

  const user = useMemo(() => {
    if (userId == null) return null;
    if (!users.length) return null;
    return users.find((u) => u.id === userId) || null;
  }, [users, userId]);

  const sessionReady = !usersLoading;

  // While users are still resolving, keep binding-loading so pages never flash the empty CTA.
  useEffect(() => {
    if (user) return;
    setNatalChart(null);
    setNatalBindingLoading(usersLoading);
  }, [user, usersLoading]);

  // Auto-attach preferred saved natal (localStorage) or latest on load / Dev user switch.
  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    setNatalChart(null);
    setNatalBindingLoading(true);
    api
      .charts(user.id)
      .then((rows) => {
        if (cancelled) return;
        if (!rows.length) {
          setNatalChart(null);
          writeSelectedId(user.id, null);
          return;
        }
        const preferred = readSelectedId(user.id);
        const match = preferred != null ? rows.find((r) => r.id === preferred) : null;
        const row = match || rows[0];
        setNatalChart(summaryFromRow(row));
        writeSelectedId(user.id, row.id);
      })
      .catch(() => {
        if (!cancelled) setNatalChart(null);
      })
      .finally(() => {
        if (!cancelled) setNatalBindingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Persist selected chart id for Protocols / Today across reloads.
  useEffect(() => {
    if (!user?.id) return;
    writeSelectedId(user.id, natalChart?.id ?? null);
  }, [user?.id, natalChart?.id]);

  const biohackingUnlocked = useMemo(() => {
    if (!enforcePaywall) return true;
    if (previewAsFree) return false;
    return Boolean(user?.biohacking_enabled || user?.subscription_tier === "biohacker_pro");
  }, [enforcePaywall, previewAsFree, user]);

  return (
    <Ctx.Provider
      value={{
        users,
        user,
        usersLoading,
        usersError,
        setUserId: (id) => {
          // Clear synchronously so the next paint never shows the previous user's natal.
          setNatalChart(null);
          setNatalBindingLoading(true);
          writeSessionUserId(id);
          setUserId(id);
        },
        sessionReady,
        signOut: () => {
          writeSessionUserId(null);
          setNatalChart(null);
          setNatalBindingLoading(false);
          setUserId(null);
        },
        enforcePaywall,
        setEnforcePaywall,
        previewAsFree,
        setPreviewAsFree,
        natalChartId,
        natalChart,
        natalBindingLoading,
        setNatalChartId,
        setNatalChart,
        refreshUsers,
        ensureUser,
        biohackingUnlocked,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}
