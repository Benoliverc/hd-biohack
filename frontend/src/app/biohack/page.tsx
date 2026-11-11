"use client";

import Link from "next/link";
import { ChevronRight, ChevronDown, Package } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiohackingEntitlementGate } from "@/components/BiohackingEntitlementGate";
import { api, type SavedChartRow, type TodayIndicationPayload } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useApp, type NatalChartSummary } from "@/lib/store";
import { displayCenter } from "@/lib/hdCopy";
import { formatResetsInHkt } from "@/lib/timezone";
import { youChipLabel } from "@/lib/youChipLabel";
import {
  type CompletionKind,
  type DayCompletions,
  type WeekCompletedRow,
  dayKeyInZone,
  doneMapFromCompletions,
  formatWeekDayLabel,
  hkDayKey,
  loadDayCompletions,
  loadWeekCompleted,
  mergeServerCompletions,
  resolveProtocolsTz,
  saveDayCompletions,
  setCompletionNote,
  toggleCompletion,
  weekDayKeysInZone,
  weekRangeLabel,
} from "@/lib/protocolCompletions";
import {
  WeatherStrip,
  TodaysMoveCard,
  KitStrip,
  STARTER_SUPPLEMENTS,
  type WhatsNew,
  type CheckItem,
} from "@/components/protocols";

type InvItem = { id: number; name: string; notes: string };

type PlanItem = {
  when: string;
  item: string;
  dose_hint?: string;
  why?: string;
  in_inventory?: boolean;
  priority?: number;
  moment_chip?: string;
};


type KitFact = {
  supplement: string;
  body: string;
  source_id: string;
  foot?: string;
};

type StackItem = {
  name: string;
  note: string;
  action?: string;
  center?: string;
  center_status?: string;
  in_inventory?: boolean;
};


function isSelfRow(row: { slot_kind?: string }): boolean {
  return row.slot_kind !== "friend";
}

function summaryFromSelf(row: SavedChartRow): NatalChartSummary {
  return {
    id: row.id,
    label: row.label || "Me",
    birth_city: row.birth_city || "",
    birth_date: row.birth_date,
    birth_time: row.birth_time,
    time_unknown: row.time_unknown === true,
    timezone: row.timezone ?? null,
    slot_kind: row.slot_kind ?? "self",
  };
}

/** Prefer store id only when that row is self; else first self; else null. */
function resolveYouChart(
  rows: SavedChartRow[],
  stickyId: number | null
): SavedChartRow | null {
  if (stickyId != null) {
    const match = rows.find((r) => r.id === stickyId);
    if (match && isSelfRow(match)) return match;
  }
  return rows.find((r) => isSelfRow(r)) ?? null;
}

function leadFpKey(userId: number, chartId: number, day: string): string {
  return `hd-biohack:protocol-leads:v1:${userId}:${chartId}:${day}`;
}

function loadLeadFingerprint(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { fingerprint?: string };
    return typeof parsed?.fingerprint === "string" && parsed.fingerprint
      ? parsed.fingerprint
      : null;
  } catch {
    return null;
  }
}

function saveLeadFingerprint(key: string, fingerprint: string, whatsNew?: WhatsNew | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ fingerprint, whats_new: whatsNew ?? null, saved_at: Date.now() })
    );
  } catch {
    /* ignore quota */
  }
}

/** Previous HKT calendar day key (wall-clock −24h, formatted in Asia/Hong_Kong). */
function prevHkDayKey(d = new Date()): string {
  return hkDayKey(new Date(d.getTime() - 24 * 60 * 60 * 1000));
}



type TimedLeadSnap = { id: string; item: string; inInventory?: boolean };

function sanitizeWhy(why: string | undefined, inInventory: boolean | undefined): string | undefined {
  if (!why) return undefined;
  // Badge already says "From your kit" — don't restate ownership in why.
  const cleaned = why
    .replace(/\s*You already own something like this[^.]*\.\s*/gi, " ")
    .replace(/\s*[Pp]refer what you already own[^.]*\.?\s*/gi, " ")
    .replace(/\s*From your kit[^.]*\.\s*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!cleaned) return undefined;
  // Behaviors: never claim shelf ownership.
  if (!inInventory) return cleaned;
  return cleaned;
}

function snapTimedLeads(proto: Record<string, unknown> | null): TimedLeadSnap[] {
  if (!proto) return [];
  const daily = (proto.daily_plan as Record<string, unknown>) || null;
  if (!daily) return [];
  const out: TimedLeadSnap[] = [];
  for (const slot of ["morning", "midday", "evening"] as const) {
    const row = ((daily[slot] as PlanItem[]) || [])[0];
    if (!row) continue;
    out.push({ id: slot, item: row.item, inInventory: row.in_inventory });
  }
  return out;
}

function slotTitle(id: string): string {
  if (id === "morning") return "Morning";
  if (id === "midday") return "Midday";
  if (id === "evening") return "Evening";
  return id;
}

function bareItemName(item: string): string {
  return item.replace(/\s*\(consider adding\)\s*$/i, "").trim();
}

function announceKitChange(
  before: TimedLeadSnap[],
  after: TimedLeadSnap[],
  kind: "add" | "remove",
  name: string
): string {
  for (const slot of ["morning", "midday", "evening"]) {
    const b = before.find((x) => x.id === slot);
    const a = after.find((x) => x.id === slot);
    if (!a) continue;
    const itemChanged = !b || b.item !== a.item;
    const invChanged = !b || Boolean(b.inInventory) !== Boolean(a.inInventory);
    if (itemChanged || invChanged) {
      if (a.inInventory) {
        return `Plan updated · ${slotTitle(slot)} now uses ${bareItemName(a.item)} (from your kit)`;
      }
      return `Plan updated · ${slotTitle(slot)} now uses ${a.item}`;
    }
  }
  if (kind === "remove") {
    return `Removed ${name} · plan refreshed`;
  }
  return `Kit updated · Today's Move unchanged for this weather`;
}


function shelfDeepLinkRequested(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash.replace(/^#/, "");
  const qs = new URLSearchParams(window.location.search);
  return hash === "shelf" || qs.get("shelf") === "1";
}

export default function BiohackPage() {
  const { t } = useI18n();
  const { user, natalChartId, natalBindingLoading, biohackingUnlocked, setNatalChart } = useApp();
  const [youChart, setYouChart] = useState<NatalChartSummary | null>(null);
  const [youReady, setYouReady] = useState(false);
  const [protocol, setProtocol] = useState<Record<string, unknown> | null>(null);
  const [indication, setIndication] = useState<TodayIndicationPayload | null>(null);
  const [inventory, setInventory] = useState<InvItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invName, setInvName] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoTried, setAutoTried] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [invFeedback, setInvFeedback] = useState<string | null>(null);
  const [kitStatus, setKitStatus] = useState<string | null>(null);
  const [focusInvId, setFocusInvId] = useState<number | null>(null);
  const [natalOpen, setNatalOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [baselineKitOpen, setBaselineKitOpen] = useState(false);
  const [completions, setCompletions] = useState<DayCompletions>({});
  const [weekRows, setWeekRows] = useState<WeekCompletedRow[]>([]);
  const [completeFlash, setCompleteFlash] = useState(false);
  const [intention, setIntention] = useState("");
  const [intentionSaving, setIntentionSaving] = useState(false);
  const inventoryRef = useRef<HTMLDivElement | null>(null);
  const shelfRef = useRef<HTMLDetailsElement | null>(null);
  const [shelfOpen, setShelfOpen] = useState(false);
  const shelfDefaultApplied = useRef(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const protocolsTz = resolveProtocolsTz(user?.preferred_timezone);
  const dayKey = dayKeyInZone(protocolsTz);
  /** Lead-fingerprint / novelty day keys stay HKT (Daily Novelty Contract). */
  const noveltyDayKey = hkDayKey();

  const refreshInventory = useCallback(async () => {
    if (!user) {
      setInventory([]);
      return;
    }
    const list = await api.inventory(user.id);
    setInventory(list);
  }, [user]);

  // Resolve You natal independently of friend sticky.
  useEffect(() => {
    if (!user) {
      setYouChart(null);
      setYouReady(false);
      return;
    }
    if (natalBindingLoading) {
      setYouReady(false);
      return;
    }
    let cancelled = false;
    setYouReady(false);
    api
      .charts(user.id)
      .then((rows) => {
        if (cancelled) return;
        const selfRow = resolveYouChart(rows, natalChartId);
        const summary = selfRow ? summaryFromSelf(selfRow) : null;
        setYouChart(summary);
        setYouReady(true);
        if (summary && natalChartId !== summary.id) {
          setNatalChart(summary);
        } else if (!summary && natalChartId != null) {
          setNatalChart(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setYouChart(null);
          setYouReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, natalBindingLoading, natalChartId, setNatalChart]);

  useEffect(() => {
    setProtocol(null);
    setIndication(null);
    setError(null);
    setNatalOpen(false);
    setAutoTried(false);
    setKitStatus(null);
  }, [user?.id, youChart?.id]);

  useEffect(() => {
    let cancelled = false;
    setInventory([]);
    setInvName("");
    setInvFeedback(null);
    setFocusInvId(null);
    setRemovingId(null);
    if (!user) {
      setInventoryLoading(false);
      return;
    }
    setInventoryLoading(true);
    (async () => {
      try {
        const list = await api.inventory(user.id);
        if (!cancelled) setInventory(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setInventoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Empty loaded Shelf starts open; a filled shelf stays collapsed.
  // Do not persist "I collapsed an empty shelf" — re-apply on remount / user change.
  useEffect(() => {
    shelfDefaultApplied.current = false;
    setShelfOpen(false);
  }, [user?.id]);

  useEffect(() => {
    if (inventoryLoading) return;
    const deep = shelfDeepLinkRequested();
    if (!shelfDefaultApplied.current) {
      shelfDefaultApplied.current = true;
      setShelfOpen(deep || inventory.length === 0);
    } else if (deep) {
      setShelfOpen(true);
    }
    if (deep) {
      requestAnimationFrame(() => {
        shelfRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [inventoryLoading, inventory.length]);

  useEffect(() => {
    const onHash = () => {
      if (!shelfDeepLinkRequested()) return;
      setShelfOpen(true);
      requestAnimationFrame(() => {
        shelfRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    // Collapse natal when a new protocol arrives — never yank kit panel shut mid-edit.
    if (protocol) {
      setNatalOpen(false);
    }
  }, [protocol]);

  const refreshWeek = useCallback(() => {
    if (!user || !youChart) {
      setWeekRows([]);
      return;
    }
    setWeekRows(loadWeekCompleted(user.id, youChart.id, new Date(), protocolsTz));
  }, [user, youChart, protocolsTz]);

  const syncCompletionToServer = useCallback(
    (
      itemId: string,
      item: { done: boolean; label: string; kind: CompletionKind; note?: string }
    ) => {
      if (!user || !youChart) return;
      void api
        .putProtocolCompletion(user.id, {
          chart_id: youChart.id,
          day: dayKey,
          item_id: itemId,
          kind: item.kind,
          label: item.label,
          done: item.done,
          note: item.done ? item.note ?? null : null,
        })
        .catch(() => {
          /* local cache remains; silent for v1 */
        });
    },
    [user, youChart, dayKey]
  );

  // Local cache first, then hydrate from server (account TZ day/week)
  useEffect(() => {
    if (!user || !youChart) {
      setCompletions({});
      setWeekRows([]);
      setIntention("");
      return;
    }
    const local = loadDayCompletions(user.id, youChart.id, dayKey);
    setCompletions(local);
    setWeekRows(loadWeekCompleted(user.id, youChart.id, new Date(), protocolsTz));

    let cancelled = false;
    const weekKeys = weekDayKeysInZone(protocolsTz);
    const from = weekKeys[0];
    const to = weekKeys[6];
    (async () => {
      try {
        const [dayRes, weekRes, intentionRes] = await Promise.all([
          api.listProtocolCompletions(user.id, youChart.id, { day: dayKey }),
          api.listProtocolCompletions(user.id, youChart.id, { from, to }),
          api.getIntention(user.id, dayKey),
        ]);
        if (cancelled) return;
        const merged = mergeServerCompletions(local, dayRes.items);
        setCompletions(merged);
        saveDayCompletions(user.id, youChart.id, dayKey, merged);

        // Write each server day into local cache, then rebuild week rows
        const byDay = new Map<string, typeof weekRes.items>();
        for (const row of weekRes.items) {
          const list = byDay.get(row.day) || [];
          list.push(row);
          byDay.set(row.day, list);
        }
        for (const [d, rows] of Array.from(byDay.entries())) {
          const base = d === dayKey ? merged : loadDayCompletions(user.id, youChart.id, d);
          const m = mergeServerCompletions(base, rows);
          saveDayCompletions(user.id, youChart.id, d, m);
        }
        setWeekRows(loadWeekCompleted(user.id, youChart.id, new Date(), protocolsTz));
        setIntention(intentionRes.text || "");
      } catch {
        /* offline / API error — keep local */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, youChart?.id, dayKey, protocolsTz]);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const saveNote = useCallback(
    (id: string, note: string) => {
      if (!user || !youChart) return;
      setCompletions((prev) => {
        const next = setCompletionNote(prev, id, note);
        saveDayCompletions(user.id, youChart.id, dayKey, next);
        const item = next[id];
        if (item) syncCompletionToServer(id, item);
        return next;
      });
      queueMicrotask(() => refreshWeek());
    },
    [user, youChart, dayKey, refreshWeek, syncCompletionToServer]
  );

  const saveIntention = useCallback(
    (text: string) => {
      if (!user) return;
      const trimmed = text.trim().slice(0, 200);
      setIntention(trimmed);
      setIntentionSaving(true);
      void api
        .putIntention(user.id, dayKey, trimmed)
        .catch(() => {
          /* keep local draft */
        })
        .finally(() => setIntentionSaving(false));
    },
    [user, dayKey]
  );

  const loadProtocol = useCallback(
    async (opts?: { rebuild?: boolean }) => {
      if (!user || !youChart) return null;
      setLoading(true);
      setError(null);
      try {
        const yFp = loadLeadFingerprint(
          leadFpKey(user.id, youChart.id, prevHkDayKey())
        );
        const [protoRes, transitRes] = await Promise.all([
          api.protocol(user.id, youChart.id, {
            yesterdayLeadFingerprint: yFp,
          }),
          api.transitsToday(youChart.id),
        ]);
        setProtocol(protoRes.protocol);
        // Prefer shared derive from /transits/today for weather strip parity with Today
        setIndication(transitRes.indication ?? protoRes.indication ?? null);
        const wn =
          (protoRes.protocol?.whats_new as WhatsNew | undefined) ||
          ((protoRes.protocol?.daily_plan as { whats_new?: WhatsNew } | undefined)
            ?.whats_new ??
            null);
        const fp =
          (typeof protoRes.protocol?.lead_fingerprint === "string" &&
            protoRes.protocol.lead_fingerprint) ||
          wn?.lead_fingerprint ||
          null;
        if (fp) {
          saveLeadFingerprint(leadFpKey(user.id, youChart.id, noveltyDayKey), fp, wn);
        }
        setNatalOpen(false);
        await refreshInventory();
        if (opts?.rebuild) {
          /* explicit refresh — same path */
        }
        return protoRes.protocol as Record<string, unknown>;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, youChart, refreshInventory, noveltyDayKey]
  );

  // Auto-load today's protocol on enter (no Generate ritual)
  useEffect(() => {
    if (!biohackingUnlocked) return;
    if (natalBindingLoading || !youReady) return;
    if (!user || !youChart) {
      setAutoTried(true);
      return;
    }
    if (protocol || loading || autoTried) return;
    setAutoTried(true);
    void loadProtocol();
  }, [
    biohackingUnlocked,
    natalBindingLoading,
    youReady,
    user,
    youChart,
    protocol,
    loading,
    autoTried,
    loadProtocol,
  ]);

  const addInv = async (preset?: string) => {
    if (!user) return;
    const name = (preset ?? invName).trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    setInvFeedback(null);
    setKitStatus(null);
    const before = snapTimedLeads(protocol);
    try {
      const res = await api.addInventory(user.id, name);
      await refreshInventory();
      setInvName("");
      setFocusInvId(res.id);
      setInvFeedback(res.duplicate ? `Already in kit: ${res.name}` : `Added ${res.name}`);
      setInventoryOpen(true);
      if (protocol) {
        const next = await loadProtocol({ rebuild: true });
        if (!res.duplicate) {
          setKitStatus(announceKitChange(before, snapTimedLeads(next), "add", res.name));
        }
      } else if (!res.duplicate) {
        setKitStatus(`Added ${res.name} to your kit`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  };

  const removeInv = async (item: InvItem) => {
    if (!user) return;
    setRemovingId(item.id);
    setError(null);
    setKitStatus(null);
    const before = snapTimedLeads(protocol);
    try {
      await api.removeInventory(user.id, item.id);
      await refreshInventory();
      if (focusInvId === item.id) setFocusInvId(null);
      if (protocol) {
        const next = await loadProtocol({ rebuild: true });
        setKitStatus(announceKitChange(before, snapTimedLeads(next), "remove", item.name));
      } else {
        setKitStatus(`Removed ${item.name} · plan refreshed`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRemovingId(null);
    }
  };

  const openInventory = () => {
    setInventoryOpen(true);
    requestAnimationFrame(() => {
      inventoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const daily = (protocol?.daily_plan as Record<string, unknown>) || null;
  const weekly = (protocol?.weekly_plan as Record<string, unknown>) || null;
  const baseline = (protocol?.natal_baseline as Record<string, unknown>) || null;
  const labels = (protocol?.labels as Record<string, string>) || {};

  const asOfLabel = formatResetsInHkt();
  const resolvingYou = natalBindingLoading || !youReady;
  const whatsNew: WhatsNew | null =
    (protocol?.whats_new as WhatsNew | undefined) ||
    ((daily as { whats_new?: WhatsNew } | null)?.whats_new ?? null);

  const checkItems = useMemo(() => {
    // Timed leads only — Main action stays on Today; never checklist item #1.
    if (!daily) return [] as CheckItem[];
    const items: CheckItem[] = [];
    for (const slot of ["morning", "midday", "evening"] as const) {
      const row = ((daily[slot] as PlanItem[]) || [])[0];
      if (!row) continue;
      const slotLabel = slot === "morning" ? "Morning" : slot === "midday" ? "Midday" : "Evening";
      const inInv = Boolean(row.in_inventory);
      items.push({
        id: slot,
        label: `${slotLabel}: ${bareItemName(row.item)}`,
        sub: row.when || undefined,
        why: sanitizeWhy(row.why, inInv),
        inInventory: inInv,
        momentChip: inInv ? row.moment_chip || undefined : undefined,
        slot,
        kind: "move",
      });
    }
    return items;
  }, [daily]);

  const baselineCheckItems = useMemo(() => {
    if (!daily) return [] as CheckItem[];
    const kit = (daily.baseline_kit as PlanItem[]) || [];
    return kit.map((row, i) => {
      const inInv = Boolean(row.in_inventory);
      return {
        id: `baseline:${i}`,
        label: bareItemName(row.item),
        sub: row.when || undefined,
        why: sanitizeWhy(row.why, inInv),
        inInventory: inInv,
        kind: "baseline" as const,
      };
    });
  }, [daily]);

  const timedLeadsAllBehavior = useMemo(() => {
    return checkItems.length > 0 && checkItems.every((it) => !it.inInventory);
  }, [checkItems]);

  const doneMap = useMemo(() => doneMapFromCompletions(completions), [completions]);
  const doneCount = checkItems.filter((it) => doneMap[it.id]).length;
  const moveComplete = checkItems.length > 0 && doneCount === checkItems.length;
  const baselineDoneCount = baselineCheckItems.filter((it) => doneMap[it.id]).length;

  const onToggleItem = useCallback(
    (it: CheckItem) => {
      if (!user || !youChart) return;
      setCompletions((prev) => {
        const wasComplete =
          checkItems.length > 0 && checkItems.every((c) => Boolean(prev[c.id]?.done));
        const next = toggleCompletion(prev, it.id, { label: it.label, kind: it.kind });
        saveDayCompletions(user.id, youChart.id, dayKey, next);
        const item = next[it.id];
        if (item) syncCompletionToServer(it.id, item);
        const nowComplete =
          checkItems.length > 0 &&
          checkItems.every((c) =>
            c.id === it.id ? !Boolean(prev[c.id]?.done) : Boolean(next[c.id]?.done)
          );
        if (!wasComplete && nowComplete && it.kind === "move") {
          if (flashTimer.current) clearTimeout(flashTimer.current);
          setCompleteFlash(true);
          flashTimer.current = setTimeout(() => setCompleteFlash(false), 3200);
        }
        return next;
      });
      queueMicrotask(() => refreshWeek());
    },
    [user, youChart, dayKey, checkItems, refreshWeek, syncCompletionToServer]
  );

  const unlockedBody = (
    <div className="space-y-4">
      {kitStatus && (
        <div
          className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-growth/40 bg-growth-soft px-3 py-2.5 text-sm text-growth-ink"
          data-testid="kit-status"
          role="status"
        >
          <span>{kitStatus}</span>
          <button
            type="button"
            className="shrink-0 text-xs text-fg-muted underline-offset-2 hover:underline"
            onClick={() => setKitStatus(null)}
          >
            {t("page.protocols.dismiss")}
          </button>
        </div>
      )}
      {error && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-danger">
          <span>{error}</span>
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadProtocol({ rebuild: true })}
            className="underline underline-offset-2 disabled:opacity-50"
          >
            {t("page.protocols.retry")}
          </button>
        </div>
      )}

      {resolvingYou && (
        <p className="text-sm text-fg-muted" data-testid="protocols-resolving-you">
          {t("page.protocols.lookingUp")}
        </p>
      )}

      {!resolvingYou && !youChart && (
        <div
          className="rounded-2xl border border-dashed border-border bg-elevated/60 px-5 py-8 text-center"
          data-testid="protocol-empty-no-you"
        >
          <p className="text-base font-semibold text-fg">{t("page.protocols.emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-fg-secondary">
            {t("page.protocols.emptyBody")}
          </p>
          <Link
            href="/profile"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse"
          >
            {t("page.protocols.openChart")}
          </Link>
        </div>
      )}

      {youChart && loading && !protocol && (
        <div className="space-y-3" data-testid="protocol-skeleton" aria-busy>
          <div className="h-16 animate-pulse rounded-2xl bg-sunken" />
          <div className="h-40 animate-pulse rounded-2xl bg-sunken" />
          <div className="h-24 animate-pulse rounded-2xl bg-sunken" />
        </div>
      )}

      {protocol && indication && (
        <WeatherStrip indication={indication} whatsNew={whatsNew} />
      )}

      {/* Morning Ritual: Move first above the fold; shelf + intention deferred. */}
      {protocol && daily && (
        <TodaysMoveCard
          items={checkItems}
          baselineItems={baselineCheckItems}
          completions={completions}
          doneMap={doneMap}
          onToggle={onToggleItem}
          onNote={saveNote}
          doneCount={doneCount}
          baselineDoneCount={baselineDoneCount}
          moveComplete={moveComplete}
          completeFlash={completeFlash}
          doList={(daily.do as string[]) || []}
          dontList={(daily.dont as string[]) || []}
          baselineKitOpen={baselineKitOpen}
          onToggleBaseline={() => setBaselineKitOpen((v) => !v)}
          showNoKitFootnote={timedLeadsAllBehavior && inventory.length > 0}
          rotatedSlot={whatsNew?.rotated_slot || null}
        />
      )}

      {(protocol || youChart) && (
        <details
          id="shelf"
          ref={shelfRef}
          open={shelfOpen}
          onToggle={(e) => setShelfOpen((e.target as HTMLDetailsElement).open)}
          className="group scroll-mt-[calc(var(--app-header-h,4.5rem)+0.75rem)] rounded-2xl border border-border bg-elevated px-4 py-3 shadow-soft"
          data-testid="shelf-disclosure"
        >
          <summary className="cursor-pointer list-none text-sm font-medium text-fg marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex flex-wrap items-center gap-2">
              <ChevronRight className="h-4 w-4 shrink-0 text-fg-secondary group-open:rotate-90 transition-transform" aria-hidden />
              <Package className="h-4 w-4 shrink-0 text-growth" aria-hidden />
              <span>{t("page.protocols.shelf")}</span>
              <span className="text-xs font-normal text-fg-secondary">
                · {inventoryLoading ? "…" : inventory.length}
                {!inventoryLoading && inventory.length === 0
                  ? ` · ${t("page.protocols.addWhatYouOwn")}`
                  : ""}
              </span>
            </span>
          </summary>
          <div className="mt-3 space-y-3">
            <KitStrip
              count={inventory.length}
              loading={inventoryLoading}
              onEdit={openInventory}
              onAddStarter={(name) => void addInv(name)}
              adding={adding}
              disabled={!user || adding || inventoryLoading || resolvingYou}
            />
            <KitFactCallout
              fact={
                ((protocol?.kit_fact as KitFact | null | undefined) ||
                  ((daily as { kit_fact?: KitFact | null } | null)?.kit_fact ?? null)) ?? null
              }
              cta={null}
              onOpenKit={openInventory}
            />
          </div>
        </details>
      )}

      {protocol && daily && (
        <details
          className="group rounded-2xl border border-border bg-elevated px-4 py-3 shadow-soft"
          data-testid="intention-disclosure"
        >
          <summary className="cursor-pointer list-none text-sm font-medium text-fg marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex flex-wrap items-center gap-2">
              <ChevronRight className="h-4 w-4 shrink-0 text-fg-secondary transition-transform group-open:rotate-90" aria-hidden />
              <span>{t("page.protocols.intention")}</span>
              <span className="text-xs font-normal text-fg-secondary">
                · {intention.trim()
                  ? t("page.protocols.intentionSet")
                  : t("page.protocols.intentionOptional")}
              </span>
            </span>
          </summary>
          <div className="mt-3">
            <DailyIntentionField
              value={intention}
              saving={intentionSaving}
              onCommit={saveIntention}
              embedded
            />
          </div>
        </details>
      )}

      {protocol && weekly && (
        <WeekSkyCard
          theme={String(weekly.theme || "")}
          skyNote={String(weekly.sky_note || protocol.daily_directive || "")}
          weekRows={weekRows}
          weekLabel={weekRangeLabel(protocolsTz)}
        />
      )}

      {protocol && (
        <NatalBaselineCard
          open={natalOpen}
          onToggle={() => setNatalOpen((v) => !v)}
          baseline={baseline}
          labels={labels}
        />
      )}

      <div ref={inventoryRef}>
        <InventoryPanel
          open={inventoryOpen}
          onToggle={() => setInventoryOpen((v) => !v)}
          inventory={inventory}
          inventoryLoading={inventoryLoading}
          natalBindingLoading={resolvingYou}
          invName={invName}
          setInvName={setInvName}
          adding={adding}
          removingId={removingId}
          invFeedback={invFeedback}
          focusInvId={focusInvId}
          user={Boolean(user)}
          addInv={addInv}
          removeInv={removeInv}
        />
      </div>

      <p className="text-xs text-energy-ink/90">
        {t("page.protocols.disclaimer")}
      </p>
    </div>
  );

  return (
    <div className="space-y-5">
      <ProtocolsHeader
        youChart={youChart}
        resolvingYou={resolvingYou}
        biohackingUnlocked={biohackingUnlocked}
        asOfLabel={asOfLabel}
      />

      <BiohackingEntitlementGate blurredPreview={<LockedPaywallMock />}>
        {unlockedBody}
      </BiohackingEntitlementGate>
    </div>
  );
}

/* ─── Header ────────────────────────────────────────────────────────────── */

function ProtocolsHeader({
  youChart,
  resolvingYou,
  biohackingUnlocked,
  asOfLabel,
}: {
  youChart: NatalChartSummary | null;
  resolvingYou: boolean;
  biohackingUnlocked: boolean;
  asOfLabel: string | null;
}) {
  const { t } = useI18n();
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div>
        <h1 className="type-title text-fg">{t("page.protocols.h1")}</h1>
        {asOfLabel && <p className="mt-1 type-caption text-fg-secondary">{asOfLabel}</p>}
        <p className="mt-1 type-meta">{t("page.protocols.subtitle")}</p>
      </div>
      <div className="flex flex-col items-start gap-1.5 sm:items-end">
        {resolvingYou ? (
          <div
            className="inline-flex h-10 min-w-[10rem] animate-pulse items-center rounded-full border border-border bg-sunken px-3"
            aria-hidden
          />
        ) : youChart ? (
          <>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-fg"
              title={t("page.protocols.alwaysUsesChart")}
              data-testid="protocols-you-chip"
            >
              {youChipLabel(youChart)}
            </span>
          </>
        ) : (
          <div
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1.5 text-sm text-fg-muted shadow-soft"
            data-testid="protocols-you-empty"
          >
            <span>{t("page.protocols.noYouChart")}</span>
            <Link href="/profile" className="font-medium text-growth underline-offset-2 hover:underline">
              {t("page.protocols.saveOnChart")}
            </Link>
          </div>
        )}
      </div>
      {!biohackingUnlocked && (
        <p className="w-full text-xs text-fg-muted sm:order-last">
          Pro unlocks Today&apos;s Move, this week, and your kit.
        </p>
      )}
    </header>
  );
}

/* ─── Daily intention ───────────────────────────────────────────────────── */

function DailyIntentionField({
  value,
  saving,
  onCommit,
  embedded = false,
}: {
  value: string;
  saving: boolean;
  onCommit: (text: string) => void;
  embedded?: boolean;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <section
      className={embedded ? "space-y-0" : "rounded-2xl border border-border bg-elevated p-4"}
      data-testid="daily-intention"
    >
      <label
        htmlFor="daily-intention-input"
        className="block text-sm font-semibold text-fg"
      >
        {t("page.protocols.intentionLabel")}
        <span className="ml-2 text-xs font-normal text-fg-secondary">optional</span>
      </label>
      <input
        id="daily-intention-input"
        type="text"
        maxLength={200}
        value={draft}
        disabled={saving}
        placeholder={t("page.protocols.intentionPlaceholder")}
        data-testid="daily-intention-input"
        className="mt-2 min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft.trim() !== (value || "").trim()) onCommit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
    </section>
  );
}

/* ─── Kit fact (inside Shelf disclosure; no empty twin CTA) ─────────────── */

function KitFactCallout({
  fact,
  cta,
  onOpenKit,
}: {
  fact: KitFact | null;
  cta: string | null;
  onOpenKit: () => void;
}) {
  if (fact?.body) {
    const body =
      fact.body.length > 140 ? `${fact.body.slice(0, 137).replace(/\s+\S*$/, "")}…` : fact.body;
    return (
      <aside
        className="rounded-xl border border-border/70 bg-elevated/60 px-3 py-2"
        data-testid="kit-fact-callout"
        aria-label="Kit fact"
      >
        <p className="type-chip uppercase tracking-wide text-fg-secondary">
          Kit fact · today
          {fact.supplement ? (
            <span className="ml-1.5 rounded-full border border-border/60 bg-sunken px-1.5 py-0.5 type-caption font-medium normal-case tracking-normal text-fg-secondary">
              {fact.supplement}
            </span>
          ) : null}
        </p>
        <p className="mt-1 type-body text-fg-secondary line-clamp-2">{body}</p>
        <p className="mt-1 type-caption text-fg-secondary">
          {fact.foot || "Informational — not medical advice"}
        </p>
      </aside>
    );
  }
  if (cta) {
    return (
      <aside
        className="rounded-xl border border-dashed border-border bg-elevated/40 px-3 py-2"
        data-testid="kit-fact-empty-cta"
      >
        <p className="text-sm text-fg-secondary">{cta}</p>
        <button
          type="button"
          onClick={onOpenKit}
          className="mt-1 text-xs font-medium text-growth underline-offset-2 hover:underline"
          data-testid="kit-fact-open-kit"
        >
          Edit kit
        </button>
      </aside>
    );
  }
  return null;
}

/* ─── Week: theme + sky + completed ─────────────────────────────────────── */

function WeekSkyCard({
  theme,
  skyNote,
  weekRows,
  weekLabel,
}: {
  theme: string;
  skyNote: string;
  weekRows: WeekCompletedRow[];
  weekLabel: string;
}) {
  const { t } = useI18n();
  const moveRows = weekRows.filter((r) => r.kind === "move");
  const baselineRows = weekRows.filter((r) => r.kind === "baseline");

  return (
    <section
      className="space-y-3 rounded-2xl border border-border bg-elevated p-5"
      data-testid="week-plan"
    >
      <h2 className="text-lg font-semibold text-energy-ink">{t("page.protocols.thisWeek")}</h2>
      {theme && (
        <p className="type-body text-fg" data-testid="week-theme">
          {theme}
        </p>
      )}
      {skyNote && (
        <details className="rounded-xl border border-border bg-sunken/40 px-4 py-3" data-testid="week-sky-note">
          <summary className="cursor-pointer list-none type-chip uppercase tracking-wide text-fg-secondary marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>▸</span>
              Sky note · this week
            </span>
          </summary>
          <p className="mt-1.5 type-body text-fg-secondary">{skyNote}</p>
        </details>
      )}

      <div
        className="rounded-xl border border-border bg-elevated/80 px-4 py-3"
        data-testid="week-completed"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="type-chip uppercase tracking-wide text-growth-ink">
            Completed this week
          </p>
          <span className="type-caption text-fg-secondary" data-testid="week-completed-count">
            {weekRows.length} checked · {weekLabel}
          </span>
        </div>
        {weekRows.length === 0 ? (
          <p className="mt-2 type-body text-fg-secondary" data-testid="week-completed-empty">
            Nothing checked yet — tick Today&apos;s Move or baseline kit items as you go.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5" data-testid="week-completed-list">
            {weekRows.map((r) => (
              <li
                key={`${r.day}:${r.id}`}
                className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-fg-secondary"
              >
                <span className="shrink-0 type-caption font-medium text-fg-secondary">
                  {formatWeekDayLabel(r.day)}
                </span>
                <span className={r.kind === "baseline" ? "text-fg-muted" : "text-fg"}>
                  {r.label}
                </span>
                {r.kind === "baseline" && (
                  <span className="rounded-full bg-sunken px-1.5 py-0.5 type-caption text-fg-secondary">
                    baseline
                  </span>
                )}
                {r.note && (
                  <span className="w-full type-caption italic text-fg-secondary sm:w-auto">
                    — {r.note}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {(moveRows.length > 0 || baselineRows.length > 0) && (
          <p className="mt-2 type-caption text-fg-secondary">
            {moveRows.length} move · {baselineRows.length} baseline · synced to your account
          </p>
        )}
      </div>
    </section>
  );
}

/* ─── Natal baseline (collapsed) ────────────────────────────────────────── */

function NatalBaselineCard({
  open,
  onToggle,
  baseline,
  labels,
}: {
  open: boolean;
  onToggle: () => void;
  baseline: Record<string, unknown> | null;
  labels: Record<string, string>;
}) {
  const { t } = useI18n();
  return (
    <div
      className="rounded-2xl border border-growth/40 bg-growth-soft/40"
      data-testid="natal-baseline-card"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-sm font-semibold text-growth-ink">{t("page.protocols.natalBaseline")}</span>
          <span className="block type-caption text-fg-secondary">Always-on for this chart</span>
        </span>
        <span className="shrink-0 text-xs text-fg-muted">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-growth/30 px-4 pb-4 pt-3">
          {baseline ? (
            <>
              <h3 className="text-base font-semibold text-growth-ink">
                {labels.natal_baseline || String(baseline.label || "Standard care for your chart")}
              </h3>
              <p className="type-body text-fg-secondary">{String(baseline.description || "")}</p>
              <div className="grid gap-3 md:grid-cols-3">
                <BaselineColumn
                  title="Emphasize"
                  tone="growth"
                  items={(baseline.emphasize as StackItem[]) || []}
                />
                <BaselineColumn
                  title="Increase"
                  tone="recovery"
                  items={(baseline.increase as StackItem[]) || []}
                />
                <BaselineColumn
                  title="Decrease or pause"
                  tone="energy"
                  items={(baseline.decrease_or_pause as StackItem[]) || []}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-fg-muted">No natal baseline in this protocol.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Inventory ─────────────────────────────────────────────────────────── */

function InventoryPanel({
  open,
  onToggle,
  inventory,
  inventoryLoading,
  natalBindingLoading,
  invName,
  setInvName,
  adding,
  removingId,
  invFeedback,
  focusInvId,
  user,
  addInv,
  removeInv,
}: {
  open: boolean;
  onToggle: () => void;
  inventory: InvItem[];
  inventoryLoading: boolean;
  natalBindingLoading: boolean;
  invName: string;
  setInvName: (v: string) => void;
  adding: boolean;
  removingId: number | null;
  invFeedback: string | null;
  focusInvId: number | null;
  user: boolean;
  addInv: (name?: string) => Promise<unknown>;
  removeInv: (item: InvItem) => Promise<void>;
}) {
  const count = inventory.length;
  return (
    <div className="rounded-2xl border border-border bg-elevated" data-testid="inventory-panel">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-fg">
          <Package className="h-4 w-4 shrink-0 text-growth" aria-hidden />
          Your kit{count > 0 ? ` (${count})` : ""}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-fg-secondary">
          {open ? "Hide" : "Show"}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </span>
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="mb-3 text-xs text-fg-muted">
            Items in your kit are preferred in today&apos;s timed supports.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            <input
              className="min-w-[12rem] flex-1 rounded-lg border border-border bg-sunken px-3 py-2 text-sm"
              placeholder="Add supplement you own"
              value={invName}
              disabled={!user || adding || inventoryLoading || natalBindingLoading}
              onChange={(e) => setInvName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addInv();
                }
              }}
            />
            <button
              type="button"
              disabled={!user || adding || inventoryLoading || natalBindingLoading || !invName.trim()}
              onClick={() => void addInv()}
              className="min-h-10 rounded-xl border border-border px-3 py-2 text-sm hover:border-growth disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add to kit"}
            </button>
          </div>
          {invFeedback && (
            <p className="mb-2 text-xs text-growth" role="status">
              {invFeedback}
            </p>
          )}
          {!inventoryLoading && !natalBindingLoading && inventory.length === 0 && (
            <div className="mb-3">
              <p className="mb-2 text-sm text-fg-muted">No supplements saved yet — tap a starter:</p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_SUPPLEMENTS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    disabled={!user || adding}
                    data-testid={`starter-${name.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => void addInv(name)}
                    className="min-h-10 rounded-full border border-growth/40 bg-growth-soft px-3 py-2 text-xs text-growth hover:border-growth disabled:opacity-50"
                  >
                    + {name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {inventoryLoading || natalBindingLoading ? (
            <p className="text-sm text-fg-muted">Loading kit…</p>
          ) : inventory.length === 0 ? null : (
            <ul className="flex flex-wrap gap-2">
              {inventory.map((it) => (
                <li
                  key={it.id}
                  className={`inline-flex items-center gap-1 rounded-full border bg-sunken py-1 pl-3 pr-1 text-xs text-fg ${
                    focusInvId === it.id
                      ? "border-growth ring-2 ring-growth/40"
                      : "border-border"
                  }`}
                >
                  <span>{it.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${it.name}`}
                    disabled={removingId === it.id || adding}
                    onClick={() => void removeInv(it)}
                    className="inline-flex h-6 w-6 min-h-6 items-center justify-center rounded-full text-fg-muted hover:bg-sunken hover:text-danger disabled:opacity-50"
                  >
                    {removingId === it.id ? "…" : "×"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Locked preview ────────────────────────────────────────────────────── */

function LockedPaywallMock() {
  const { t } = useI18n();
  return (
    <div className="space-y-4" aria-hidden>
      <div className="rounded-2xl border border-energy/40 bg-energy/10 p-4">
        <p className="text-sm font-semibold text-energy-ink">Weather · Energy · Space</p>
        <div className="mt-2 h-8 rounded-lg bg-elevated/60" />
      </div>
      <div className="rounded-2xl border border-growth/40 bg-growth-soft p-5">
        <p className="text-lg font-semibold text-growth-ink">Today&apos;s Move</p>
        <p className="mt-2 type-body text-fg-secondary">Morning · Midday · Evening checklist</p>
        <div className="mt-3 space-y-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-10 rounded-xl border border-border bg-elevated/80" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-elevated p-5">
        <p className="text-lg font-semibold text-energy-ink">{t("page.protocols.thisWeek")}</p>
        <p className="mt-2 type-body text-fg-secondary">Sun/Earth theme + one sky note</p>
      </div>
    </div>
  );
}

function BaselineColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: StackItem[];
  tone: "growth" | "recovery" | "energy";
}) {
  const border =
    tone === "growth"
      ? "border-growth/40"
      : tone === "recovery"
        ? "border-recovery/50"
        : "border-energy/40";
  return (
    <div className={`rounded-xl border ${border} bg-sunken/70 p-3`}>
      <h3 className="mb-2 text-sm font-semibold text-fg">{title}</h3>
      {items.length === 0 && <p className="text-xs text-fg-muted">None for this chart slice.</p>}
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={`${it.name}-${it.center}`} className="rounded-lg bg-elevated px-3 py-2 text-sm">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="min-w-0 font-medium text-fg">{it.name}</span>
              {it.in_inventory && (
                <span className="shrink-0 whitespace-nowrap type-caption font-medium tracking-wide text-growth">
                  From your kit
                </span>
              )}
            </div>
            {it.center && (
              <div className="mt-0.5 text-xs tracking-wide text-fg-muted">
                {it.center === "Type"
                  ? `Type · ${it.center_status}`
                  : `${displayCenter(it.center)} · ${it.center_status}`}
              </div>
            )}
            <div className="text-xs text-fg-muted">{it.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
