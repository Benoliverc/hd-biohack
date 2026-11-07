"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  api,
  type SavedChartRow,
  type SoulCard,
  type SoulContext,
  type SoulPartnerNuance,
  type SoulSpectrum,
  type SoulSyncResult,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { displayCenter } from "@/lib/hdCopy";
import { ChevronDown } from "lucide-react";
import LiteracyCoach from "@/components/LiteracyCoach";
import { BiohackingEntitlementGate } from "@/components/BiohackingEntitlementGate";
import PartnerOverviewCard from "@/components/soul/PartnerOverviewCard";
import PartnerNuanceBlock from "@/components/soul/PartnerNuanceBlock";
import SoulChapterCard from "@/components/soul/SoulChapterCard";
import { partnerSignatureForId } from "@/components/soul/partnerSignatureCopy";

/** Default playbook context (tabs removed — single Playbook view). */
const PLAYBOOK_CONTEXT: SoulContext = "life";

/** Fallback card order for life context when API omits playbook.card_order. */
const LIFE_CARD_ORDER = [
  "somatic_playbook",
  "power_dynamics",
  "circuit_bridge",
  "spark_glue",
];

function isAuraSchema(res: SoulSyncResult): boolean {
  return Boolean(res?.signature?.id) && res.natural_fit == null;
}

function SpectrumBar({ spectrum }: { spectrum: SoulSpectrum }) {
  const isPacing = spectrum.id === "somatic_pacing";
  const fillPct = Math.max(0, Math.min(100, Number(spectrum.position) || 0));
  const fillClass = isPacing ? "bg-energy" : "bg-growth";
  const highClass = isPacing ? "text-energy" : "text-growth";
  return (
    <div
      data-testid={`soul-spectrum-${spectrum.id}`}
      className="rounded-xl border border-border bg-sunken/40 p-4"
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-fg">{spectrum.label}</span>
        <span className={`text-xs font-medium tabular-nums ${highClass}`}>
          {fillPct}%
        </span>
      </div>
      <div className="mb-2 flex justify-between gap-2 text-[10px] uppercase tracking-wide text-fg-muted">
        <span>{spectrum.low_label}</span>
        <span className={isPacing ? "text-energy" : undefined}>{spectrum.high_label}</span>
      </div>
      <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-elevated">
        <div
          className={`h-full rounded-full transition-[width] ${fillClass}`}
          style={{ width: `${fillPct}%` }}
          data-testid={`soul-spectrum-fill-${spectrum.id}`}
        />
      </div>
      <p className="text-xs text-fg-muted">{spectrum.summary}</p>
    </div>
  );
}

function asPartnerNuance(raw: unknown): SoulPartnerNuance | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const gift =
    typeof o.gift_in_love === "string" && o.gift_in_love.trim()
      ? o.gift_in_love
      : typeof o.romantic_synergy === "string"
        ? o.romantic_synergy
        : null;
  const tender =
    typeof o.tender_spot === "string" && o.tender_spot.trim()
      ? o.tender_spot
      : typeof o.romantic_friction === "string"
        ? o.romantic_friction
        : null;
  if (!gift?.trim() || !tender?.trim()) return null;
  return {
    romantic_synergy: gift,
    romantic_friction: tender,
    gift_in_love: gift,
    tender_spot: tender,
  };
}

/** First token of chart label for Love guidance headings (never full name dump). */
function partnerFirstNameFromLabel(label: string | null | undefined): string | null {
  const raw = (label || "").trim();
  if (!raw) return null;
  const lowered = raw.toLowerCase();
  if (lowered === "friend" || lowered === "partner" || lowered === "person" || lowered === "me") {
    return null;
  }
  const first = raw.split(/\s+/)[0] || "";
  return first || null;
}

function InsightCard({
  card,
  showPartnerNuance,
  open,
  onToggle,
}: {
  card: SoulCard;
  showPartnerNuance: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      id={`soul-card-${card.id}`}
      className="overflow-hidden rounded-2xl border border-border bg-elevated"
      data-testid={`soul-card-${card.id}`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-11 w-full cursor-pointer items-center gap-3 px-5 py-3 text-left outline-none transition-colors hover:bg-sunken/40 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      >
        <h2 className="min-w-0 flex-1 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          {card.title}
        </h2>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 text-fg-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div className="border-t border-border/70 px-5 pb-5 pt-3">
          <ul className="space-y-3">
            {card.body_blocks.map((blk, i) => (
              <li key={`${card.id}-${i}`}>
                <p className="text-sm font-medium text-fg">{blk.headline}</p>
                <p className="mt-0.5 text-sm text-fg-secondary">{blk.body}</p>
              </li>
            ))}
          </ul>
          {card.id === "circuit_bridge" && card.bridges && card.bridges.length > 0 && (
            <ul className="mt-3 space-y-2 border-t border-border/60 pt-3 text-xs text-fg-muted">
              {card.bridges.map((b) => {
                const nuance =
                  showPartnerNuance ? asPartnerNuance(b.partner_nuance) : null;
                return (
                  <li key={`${b.missing_for}-${b.gate}`}>
                    <p>
                      Gate {b.gate} · {b.channel || "channel"} · completes{" "}
                      {b.missing_for === "self" ? "you" : "them"}
                    </p>
                    {nuance ? <PartnerNuanceBlock nuance={nuance} /> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function CompletedChannelsList({
  channelRoles,
  showPartnerNuance,
}: {
  channelRoles: Record<string, Array<Record<string, unknown>>>;
  showPartnerNuance: boolean;
}) {
  const em = channelRoles.electromagnetic || [];
  const comp = channelRoles.companionship || [];
  if (!em.length && !comp.length) return null;
  return (
    <div
      id="soul-completed-channels"
      className="rounded-2xl border border-border bg-elevated p-5"
      data-testid="soul-completed-channels"
    >
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-fg-muted">
        Completed channels
      </h2>
      <p className="mb-3 text-xs text-fg-muted">
        Electromagnetic and companionship overlaps for this pair — base mechanics stay
        the same; partner notes appear only when Person is marked Partner.
      </p>
      <ul className="space-y-3">
        {em.map((ch, i) => {
          const name = String(ch.channel || "Channel");
          const gates = Array.isArray(ch.gates) ? (ch.gates as number[]) : [];
          const gateTxt = gates.length ? gates.join("-") : "";
          const nuance = showPartnerNuance ? asPartnerNuance(ch.partner_nuance) : null;
          return (
            <li
              key={`em-${name}-${gateTxt}-${i}`}
              className="rounded-xl border border-border/70 bg-sunken/40 px-3 py-2.5"
              data-testid={`soul-channel-em-${gateTxt || i}`}
            >
              <p className="text-sm font-medium text-fg">
                {name}
                {gateTxt ? ` (${gateTxt})` : ""} · Electromagnetic
              </p>
              {nuance ? <PartnerNuanceBlock nuance={nuance} /> : null}
            </li>
          );
        })}
        {comp.map((ch, i) => {
          const name = String(ch.channel || "Channel");
          const gates = Array.isArray(ch.gates) ? (ch.gates as number[]) : [];
          const gateTxt = gates.length ? gates.join("-") : "";
          const nuance = showPartnerNuance ? asPartnerNuance(ch.partner_nuance) : null;
          return (
            <li
              key={`comp-${name}-${gateTxt}-${i}`}
              className="rounded-xl border border-border/70 bg-sunken/40 px-3 py-2.5"
              data-testid={`soul-channel-comp-${gateTxt || i}`}
            >
              <p className="text-sm font-medium text-fg">
                {name}
                {gateTxt ? ` (${gateTxt})` : ""} · Companionship
              </p>
              {nuance ? <PartnerNuanceBlock nuance={nuance} /> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function isSelfSlot(row: SavedChartRow): boolean {
  return row.slot_kind !== "friend";
}

/** You = Me only — prefer store natal when that row is self. */
function pickMeRow(rows: SavedChartRow[], natalId: number | null): SavedChartRow | null {
  if (natalId != null) {
    const bound = rows.find((r) => r.id === natalId && isSelfSlot(r));
    if (bound) return bound;
  }
  return rows.find((r) => r.slot_kind === "self") ?? rows.find((r) => isSelfSlot(r)) ?? null;
}

function pickDefaultFriend(rows: SavedChartRow[], meId: number | null): number | null {
  const others = rows.filter((r) => r.id !== meId);
  const prefer = others.find((r) => r.slot_kind === "friend");
  return (prefer ?? others[0])?.id ?? null;
}

function chartOptionLabel(r: SavedChartRow, fallback: string): string {
  const base = `${r.label || fallback} · ${r.type || "—"} · ${r.profile || "—"}`;
  return r.role === "partner" ? `${base} · Partner` : base;
}

function waitTwoFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/** Smooth-scroll Soul anchors using sticky header offset (--app-header-h / scroll-margin). */
async function jumpSoulSection(id: string) {
  const url = `${window.location.pathname}${window.location.search}#${id}`;
  window.history.replaceState(null, "", url);
  await waitTwoFrames();
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

type SoulChapterId = "love" | "spectrums" | "playbook" | "channels" | "centers";

type SoulJumpPlan = {
  chapter: SoulChapterId | null;
  playbookCard: string | null;
};

function planSoulJump(targetId: string): SoulJumpPlan {
  if (targetId === "soul-hero") {
    return { chapter: null, playbookCard: null };
  }
  if (targetId === "soul-spectrums") {
    return { chapter: "spectrums", playbookCard: null };
  }
  if (targetId === "soul-completed-channels") {
    return { chapter: "channels", playbookCard: null };
  }
  if (targetId === "soul-conditioning") {
    return { chapter: "centers", playbookCard: null };
  }
  if (targetId === "soul-cards") {
    return { chapter: "playbook", playbookCard: null };
  }
  const cardMatch = /^soul-card-(.+)$/.exec(targetId);
  if (cardMatch) {
    return { chapter: "playbook", playbookCard: cardMatch[1] };
  }
  return { chapter: null, playbookCard: null };
}

function truncateTease(text: string | null | undefined, max = 96): string | null {
  const raw = (text || "").trim();
  if (!raw) return null;
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1).trimEnd()}…`;
}

function SoulUnlockedContent() {
  const { user, natalChartId, sessionReady } = useApp();
  const [charts, setCharts] = useState<SavedChartRow[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [chartsError, setChartsError] = useState<string | null>(null);

  const [friendId, setFriendId] = useState<number | null>(null);
  const context = PLAYBOOK_CONTEXT;

  const [result, setResult] = useState<SoulSyncResult | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [apiMissing, setApiMissing] = useState(false);
  const [schemaLag, setSchemaLag] = useState(false);
  const [openChapter, setOpenChapter] = useState<SoulChapterId | null>(null);
  const [openPlaybookCard, setOpenPlaybookCard] = useState<string | null>(null);
  const [markingPartner, setMarkingPartner] = useState(false);
  const [markPartnerError, setMarkPartnerError] = useState<string | null>(null);
  const [syncEpoch, setSyncEpoch] = useState(0);
  const hashJumpDoneRef = useRef(false);

  const applySoulJumpPlan = useCallback((targetId: string) => {
    const plan = planSoulJump(targetId);
    if (plan.chapter) {
      setOpenChapter(plan.chapter);
      if (plan.chapter === "playbook") {
        setOpenPlaybookCard(plan.playbookCard);
      }
    }
  }, []);

  const handleSoulJump = useCallback(
    async (targetId: string) => {
      applySoulJumpPlan(targetId);
      // Let React commit open chapter / nested card before scrolling.
      await waitTwoFrames();
      await waitTwoFrames();
      await jumpSoulSection(targetId);
    },
    [applySoulJumpPlan],
  );

  const loadCharts = useCallback(async () => {
    if (!user?.id) {
      setCharts([]);
      setChartsLoading(false);
      return;
    }
    setChartsLoading(true);
    setChartsError(null);
    try {
      const rows = await api.charts(user.id);
      setCharts(rows);
    } catch (e) {
      setChartsError(e instanceof Error ? e.message : String(e));
      setCharts([]);
    } finally {
      setChartsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!sessionReady) return;
    void loadCharts();
  }, [sessionReady, loadCharts]);

  const meRow = useMemo(
    () => pickMeRow(charts, natalChartId),
    [charts, natalChartId]
  );
  const meId = meRow?.id ?? null;

  const personOptions = useMemo(() => {
    if (meId == null) return charts.filter((r) => r.slot_kind === "friend");
    const others = charts.filter((r) => r.id !== meId);
    const friends = others.filter((r) => r.slot_kind === "friend");
    return friends.length ? friends : others;
  }, [charts, meId]);

  useEffect(() => {
    if (!personOptions.length) {
      setFriendId(null);
      return;
    }
    setFriendId((prev) => {
      if (prev != null && personOptions.some((r) => r.id === prev)) return prev;
      return pickDefaultFriend(personOptions, meId);
    });
  }, [personOptions, meId]);

  // Changing person resets the map so we don't leak Love open into a friend chart.
  useEffect(() => {
    setOpenChapter(null);
    setOpenPlaybookCard(null);
    setMarkPartnerError(null);
    hashJumpDoneRef.current = false;
  }, [friendId]);

  const selectedFriend = useMemo(
    () => personOptions.find((r) => r.id === friendId) ?? null,
    [personOptions, friendId]
  );
  const isPartnerSelected = selectedFriend?.role === "partner";

  const handleMarkAsPartner = useCallback(async () => {
    if (!selectedFriend || markingPartner) return;
    setMarkingPartner(true);
    setMarkPartnerError(null);
    try {
      await api.renameChart(selectedFriend.id, selectedFriend.label || "", "partner");
      // Quiet charts refresh (avoid soul-loading flash) so picker gains · Partner.
      if (user?.id) {
        const rows = await api.charts(user.id);
        setCharts(rows);
      }
      // Re-sync so Love can mount under existing partner gates.
      setSyncEpoch((n) => n + 1);
    } catch (e) {
      setMarkPartnerError(e instanceof Error ? e.message : String(e));
    } finally {
      setMarkingPartner(false);
    }
  }, [selectedFriend, markingPartner, user?.id]);

  useEffect(() => {
    if (!user?.id || meId == null || friendId == null || meId === friendId) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setSyncLoading(true);
    setSyncError(null);
    setApiMissing(false);
    setSchemaLag(false);
    api
      .soulSync({
        user_id: user.id,
        self_chart_id: meId,
        friend_chart_id: friendId,
        context,
      })
      .then((res) => {
        if (cancelled) return;
        if (!isAuraSchema(res)) {
          setSchemaLag(true);
          setResult(null);
          return;
        }
        setResult(res);
      })
      .catch((e) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        const missing =
          /not found|404|method not allowed|soul sync needs/i.test(msg) ||
          msg.trim() === "" ||
          /\/soul\/sync/i.test(msg);
        if (/^not found$/i.test(msg.trim()) || missing) {
          setApiMissing(true);
          setSyncError(null);
        } else {
          setSyncError(msg);
        }
        setResult(null);
      })
      .finally(() => {
        if (!cancelled) setSyncLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, meId, friendId, context, syncEpoch]);

  // Deep-link: open matching chapter then scroll once result is ready.
  useEffect(() => {
    if (!result || hashJumpDoneRef.current) return;
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) {
      hashJumpDoneRef.current = true;
      return;
    }
    hashJumpDoneRef.current = true;
    applySoulJumpPlan(hash);
    void (async () => {
      await waitTwoFrames();
      await waitTwoFrames();
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    })();
  }, [result, applySoulJumpPlan]);

  const hasMe = meId != null;
  const enoughPeople = hasMe && personOptions.length >= 1;

  const orderedCards = useMemo(() => {
    if (!result?.cards) return [];
    const byId = new Map(result.cards.map((c) => [c.id, c]));
    const order = result.playbook?.card_order?.length
      ? result.playbook.card_order
      : LIFE_CARD_ORDER;
    const ordered = order.map((id) => byId.get(id)).filter(Boolean) as SoulCard[];
    for (const c of result.cards) {
      if (!order.includes(c.id)) ordered.push(c);
    }
    return ordered;
  }, [result]);

  return (
    <div className="space-y-6" data-testid="soul-unlocked">
      {!sessionReady || chartsLoading ? (
        <div
          className="rounded-2xl border border-border bg-elevated p-5"
          data-testid="soul-loading"
        >
          <p className="text-sm text-fg-muted">Loading saved charts…</p>
        </div>
      ) : chartsError ? (
        <p className="text-sm text-danger" data-testid="soul-charts-error">
          {chartsError}
        </p>
      ) : !hasMe ? (
        <div
          className="rounded-2xl border border-border bg-elevated p-5"
          data-testid="soul-empty-me"
        >
          <p className="mb-3 text-sm text-fg-secondary">
            Soul needs your Me chart first — save your own natal on Chart, then pick a person.
          </p>
          <Link
            href="/profile"
            className="inline-flex min-h-11 items-center rounded-xl bg-growth/20 px-4 py-2.5 text-sm font-medium text-growth hover:bg-growth/30"
            data-testid="soul-cta-me"
          >
            Open Chart to save Me
          </Link>
        </div>
      ) : !enoughPeople ? (
        <div
          className="rounded-2xl border border-border bg-elevated p-5"
          data-testid="soul-empty"
        >
          <p className="mb-1 text-sm text-fg-secondary">
            Add someone to explore the aura between both of you.
          </p>
          <p className="mb-3 text-xs text-fg-muted">
            Save their natal on Chart — Soul uses it as the other half of the pair.
          </p>
          <Link
            href="/profile"
            data-soul-cta-add-person="soul-cta-add-person"
            className="inline-flex min-h-11 items-center rounded-xl bg-growth/20 px-4 py-2.5 text-sm font-medium text-growth hover:bg-growth/30"
            data-testid="soul-cta-chart"
          >
            Add a person on Chart
          </Link>
        </div>
      ) : (
        <>
          <div
            className={
              isPartnerSelected
                ? "flex flex-col gap-3 rounded-2xl border border-energy/25 bg-energy-soft/30 p-4 sm:flex-row sm:items-end sm:gap-4"
                : "flex flex-col gap-3 rounded-2xl border border-border bg-elevated p-4 sm:flex-row sm:items-end sm:gap-4"
            }
            data-testid="soul-pickers"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-fg-muted">
              You
              <div
                className="flex min-h-11 items-center rounded-lg border border-border bg-sunken/60 px-3 text-sm text-fg"
                data-testid="soul-self-select"
                aria-readonly="true"
                title="You is locked to your Me chart"
              >
                <span className="truncate font-medium">
                  {meRow ? chartOptionLabel(meRow, "Me") : "Me"}
                </span>
                <span className="ml-2 shrink-0 rounded-full border border-growth/40 bg-growth/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-growth">
                  Me
                </span>
              </div>
            </div>
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-fg-muted">
              <span className="flex flex-wrap items-center gap-2">
                {isPartnerSelected ? "Partner" : "Person"}
                {isPartnerSelected ? (
                  <span
                    className="inline-flex items-center rounded-full border border-energy/25 bg-energy/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-energy-ink"
                    data-testid="soul-love-guidance-chip"
                  >
                    Partner · Love guidance
                  </span>
                ) : null}
                <Link
                  href="/profile"
                  className="ml-auto text-xs font-medium text-growth underline-offset-2 hover:underline"
                  data-testid="soul-add-person"
                >
                  Add person
                </Link>
              </span>
              <select
                className="min-h-11 rounded-lg border border-border bg-canvas px-3 text-sm text-fg"
                value={friendId ?? ""}
                onChange={(e) => setFriendId(Number(e.target.value))}
                data-testid="soul-friend-select"
              >
                {personOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {chartOptionLabel(r, "Person")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isPartnerSelected ? (
            <p
              className="text-xs text-fg-muted"
              data-testid="soul-love-guidance-reason"
            >
              Love guidance is on because you marked{" "}
              <span className="font-medium text-fg-secondary">
                {partnerFirstNameFromLabel(selectedFriend?.label) || "them"}
              </span>{" "}
              as Partner.{" "}
              <Link
                href="/profile"
                className="font-medium text-growth underline-offset-2 hover:underline"
              >
                Open Chart
              </Link>
            </p>
          ) : (
            <div
              className="rounded-2xl border border-border bg-elevated p-4"
              data-testid="soul-mark-partner-prompt"
            >
              <p
                className="mb-3 text-xs text-fg-muted"
                data-testid="soul-mark-partner-reason"
              >
                Want Love guidance with{" "}
                <span className="font-medium text-fg-secondary">
                  {partnerFirstNameFromLabel(selectedFriend?.label) || "them"}
                </span>
                ? Mark them as Partner — it opens a quieter love chapter.{" "}
                It doesn&apos;t score the bond.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={markingPartner || !selectedFriend}
                  onClick={() => void handleMarkAsPartner()}
                  className="inline-flex min-h-11 items-center rounded-xl bg-growth/20 px-4 py-2.5 text-sm font-medium text-growth hover:bg-growth/30 disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="soul-mark-as-partner"
                >
                  {markingPartner ? "Marking…" : "Mark as Partner"}
                </button>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-growth underline-offset-2 hover:underline"
                >
                  Open Chart
                </Link>
              </div>
              {markPartnerError ? (
                <p
                  className="mt-2 text-sm text-danger"
                  data-testid="soul-mark-partner-error"
                >
                  {markPartnerError}
                </p>
              ) : null}
            </div>
          )}

          <div data-testid="soul-playbook" className="space-y-6">
          {(apiMissing || schemaLag) && (
            <div
              className="rounded-2xl border border-border bg-growth/10 p-5"
              data-testid="soul-api-missing"
            >
              <p className="text-sm text-fg-secondary">
                {schemaLag
                  ? "Soul API is on an older schema. Redeploy with Aura Alchemy, then refresh."
                  : "Soul sync needs an API update. The page is ready; production API may still be on an older build (Railway deploy pause). Locally, restart the backend on this branch."}
              </p>
            </div>
          )}

          {syncError && (
            <p className="text-sm text-danger" data-testid="soul-sync-error">
              {syncError}
            </p>
          )}

          {syncLoading && !result && (
            <div
              className="rounded-2xl border border-border bg-elevated p-5"
              data-testid="soul-sync-loading"
            >
              <p className="text-sm text-fg-muted">Reading aura mechanics…</p>
            </div>
          )}

          {result && (
            <>
              {result.friend?.role === "partner" && !result.partner_overview ? (
                <div
                  className="rounded-2xl border border-border bg-elevated p-4"
                  data-testid="soul-partner-overview-missing"
                >
                  <p className="text-sm text-fg-secondary">
                    Partner is on; love chapters need a sync refresh.
                  </p>
                </div>
              ) : null}

              {(() => {
                const isPartner = result.friend?.role === "partner";
                const partnerCopy = isPartner
                  ? partnerSignatureForId(result.signature?.id)
                  : null;
                const secondaryPartner = isPartner
                  ? partnerSignatureForId(result.secondary_signature?.id)
                  : null;
                return (
              <div
                id="soul-hero"
                className="rounded-2xl border border-border bg-elevated p-5"
                data-testid="soul-hero"
              >
                {partnerCopy ? (
                  <>
                    <p className="text-xs uppercase tracking-wide text-fg-muted">
                      Between you
                    </p>
                    <div
                      className="mt-1.5 h-px w-12 bg-energy/50"
                      aria-hidden
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <h2
                        className="text-3xl font-bold text-growth"
                        data-testid="soul-signature"
                      >
                        <span aria-hidden className="mr-2">
                          {result.signature.emoji || "⚡"}
                        </span>
                        {partnerCopy.title}
                      </h2>
                      {(result.signature.tier === "highest" ||
                        result.signature.id === "magnetic_alchemy") && (
                        <span
                          data-testid="soul-signature-tier"
                          className="rounded-full border border-energy/35 bg-energy/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-energy-ink"
                        >
                          {partnerCopy.chip || "Strong charge"}
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-3 max-w-2xl text-base italic leading-snug text-fg sm:text-lg"
                      data-testid="soul-partner-signature-hook"
                    >
                      {partnerCopy.hook}
                    </p>
                    <p className="mt-3 max-w-2xl text-sm text-fg-secondary">
                      {partnerCopy.body}
                    </p>
                    <details className="mt-3 rounded-xl border border-border bg-sunken/40 px-3 py-2">
                      <summary className="cursor-pointer text-xs font-semibold text-fg-muted outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        Why it feels this way
                      </summary>
                      <p className="mt-2 text-xs text-fg-secondary">{partnerCopy.why}</p>
                    </details>
                  </>
                ) : (
                  <>
                    <p className="text-xs uppercase tracking-wide text-fg-muted">Aura Signature</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <h2
                        className="text-3xl font-bold text-growth"
                        data-testid="soul-signature"
                      >
                        <span aria-hidden className="mr-2">
                          {result.signature.emoji || "⚡"}
                        </span>
                        {result.signature.label}
                      </h2>
                      {(result.signature.tier === "highest" ||
                        result.signature.id === "magnetic_alchemy") && (
                        <span
                          data-testid="soul-signature-tier"
                          className="rounded-full border border-growth/50 bg-growth/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-growth"
                        >
                          {result.signature.tier_label || "Highest signature"}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 max-w-2xl text-sm text-fg-secondary">
                      {result.signature.subtext}
                    </p>
                  </>
                )}
                {result.secondary_signature && (
                  <div
                    className="mt-3 rounded-xl border border-border bg-sunken/60 px-3 py-2"
                    data-testid="soul-secondary-signature"
                  >
                    <p className="text-xs font-medium text-fg-secondary">
                      Also:{" "}
                      {secondaryPartner?.title || result.secondary_signature.label}
                    </p>
                    {secondaryPartner ? (
                      <p className="mt-1 text-xs text-fg-muted">
                        {secondaryPartner.hook}
                      </p>
                    ) : result.secondary_signature.subtext ? (
                      <p className="mt-1 text-xs text-fg-muted">
                        {result.secondary_signature.subtext.includes(". ")
                          ? `${result.secondary_signature.subtext.split(". ")[0]}.`
                          : result.secondary_signature.subtext}
                      </p>
                    ) : null}
                  </div>
                )}
                {result.badges.length > 0 && (
                  <ul
                    className="mt-4 space-y-3"
                    data-testid="soul-badges"
                  >
                    {result.badges.map((b) => (
                      <li
                        key={b.id}
                        data-testid={`soul-badge-${b.id}`}
                        className="rounded-xl border border-growth/30 bg-growth/5 px-3 py-2.5"
                      >
                        <p className="text-xs font-semibold text-growth">{b.label}</p>
                        {b.description ? (
                          <p className="mt-1 text-sm text-fg-secondary">{b.description}</p>
                        ) : null}
                        {b.detail ? (
                          <p className="mt-1 text-[10px] text-fg-muted">{b.detail}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs text-fg-muted" data-testid="soul-disclaimer">
                  {result.disclaimer}
                </p>
              </div>
                );
              })()}

              {result.friend?.role === "partner" ? (
                <p
                  className="text-center text-xs tracking-wide text-fg-muted"
                  data-testid="soul-explore-bond"
                >
                  Explore this bond
                </p>
              ) : null}

              <LiteracyCoach
                variant="soul"
                onJump={(targetId) => {
                  void handleSoulJump(targetId);
                }}
              />

              {(() => {
                const isPartner =
                  result.friend?.role === "partner" &&
                  Boolean(result.partner_overview);
                const loveTease =
                  truncateTease(result.partner_overview?.hook) ||
                  "How you love · where you harmonize · when it’s hard";
                const playbookTease =
                  truncateTease(result.playbook?.lede) ||
                  truncateTease(result.playbook?.focus_hint) ||
                  "Body-first moves, power, bridges, and spark for this pair";
                const toggleChapter = (id: SoulChapterId) => {
                  setOpenChapter((prev) => (prev === id ? null : id));
                  // Chapter header toggles start Playbook nested cards closed.
                  setOpenPlaybookCard(null);
                };

                return (
                  <div
                    className="space-y-3"
                    data-testid="soul-chapter-map"
                  >
                    {isPartner && result.partner_overview ? (
                      <SoulChapterCard
                        testId="soul-chapter-love"
                        title="Love guidance"
                        tease={loveTease}
                        open={openChapter === "love"}
                        onToggle={() => toggleChapter("love")}
                        accent="energy"
                      >
                        <PartnerOverviewCard
                          overview={result.partner_overview}
                          partnerFirstName={partnerFirstNameFromLabel(
                            result.friend?.label || selectedFriend?.label,
                          )}
                          yourType={result.self?.type}
                          theirType={result.friend?.type}
                          chapterActive={openChapter === "love"}
                        />
                        {openChapter === "love" ? (
                          <button
                            type="button"
                            className="mt-3 text-xs font-medium text-fg-muted underline-offset-2 hover:underline"
                            onClick={() => setOpenChapter(null)}
                          >
                            Back to chapters
                          </button>
                        ) : null}
                      </SoulChapterCard>
                    ) : null}

                    <SoulChapterCard
                      testId="soul-chapter-spectrums"
                      title="Spectrums"
                      tease="Pace · continuity · charge for this pair"
                      open={openChapter === "spectrums"}
                      onToggle={() => toggleChapter("spectrums")}
                    >
                      <div
                        id="soul-spectrums"
                        className="grid gap-3 md:grid-cols-3"
                        data-testid="soul-spectrums"
                      >
                        {result.spectrums.map((s) => (
                          <SpectrumBar key={s.id} spectrum={s} />
                        ))}
                      </div>
                    </SoulChapterCard>

                    <SoulChapterCard
                      testId="soul-chapter-playbook"
                      title="Playbook"
                      tease={playbookTease}
                      open={openChapter === "playbook"}
                      onToggle={() => toggleChapter("playbook")}
                    >
                      {(result.playbook?.lede || result.playbook?.focus_hint) && (
                        <div
                          className="mb-4 rounded-2xl border border-growth/30 bg-growth/10 p-4"
                          data-testid="soul-playbook-lede"
                        >
                          {result.playbook.focus_hint ? (
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-growth">
                              {result.playbook.focus_hint}
                            </p>
                          ) : null}
                          {result.playbook.lede ? (
                            <p className="text-sm text-fg-secondary">
                              {result.playbook.lede}
                            </p>
                          ) : null}
                        </div>
                      )}
                      <div
                        id="soul-cards"
                        className="space-y-3"
                        data-testid="soul-cards"
                      >
                        {orderedCards.map((card) => (
                          <InsightCard
                            key={card.id}
                            card={card}
                            showPartnerNuance={result.friend?.role === "partner"}
                            open={openPlaybookCard === card.id}
                            onToggle={() =>
                              setOpenPlaybookCard((prev) =>
                                prev === card.id ? null : card.id,
                              )
                            }
                          />
                        ))}
                      </div>
                    </SoulChapterCard>

                    <SoulChapterCard
                      testId="soul-chapter-channels"
                      title="Channels"
                      tease="Electromagnetic & companionship overlaps"
                      open={openChapter === "channels"}
                      onToggle={() => toggleChapter("channels")}
                    >
                      <CompletedChannelsList
                        channelRoles={result.channel_roles || {}}
                        showPartnerNuance={result.friend?.role === "partner"}
                      />
                      {!(
                        (result.channel_roles?.electromagnetic || []).length ||
                        (result.channel_roles?.companionship || []).length
                      ) ? (
                        <p
                          id="soul-completed-channels"
                          className="text-sm text-fg-muted"
                          data-testid="soul-completed-channels"
                        >
                          No electromagnetic or companionship overlaps for this pair.
                        </p>
                      ) : null}
                    </SoulChapterCard>

                    <SoulChapterCard
                      testId="soul-chapter-centers"
                      title="Centers"
                      tease="You vs them per center — how this is read"
                      open={openChapter === "centers"}
                      onToggle={() => toggleChapter("centers")}
                    >
                      <div
                        id="soul-conditioning"
                        className="space-y-3"
                        data-testid="soul-conditioning"
                      >
                        <ul className="space-y-2">
                          {result.conditioning_strip.map((row) => {
                            const arrow =
                              row.direction === "friend_to_self"
                                ? "Person → You"
                                : row.direction === "self_to_friend"
                                  ? "You → Person"
                                  : row.direction === "both_defined"
                                    ? "Both defined"
                                    : "Both open";
                            return (
                              <li
                                key={row.center}
                                className="rounded-lg border border-border/70 bg-canvas/50 px-3 py-2 text-sm"
                                data-testid={`soul-center-${row.center}`}
                              >
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                  <span className="font-medium text-fg">
                                    {displayCenter(row.center)}
                                  </span>
                                  <span className="text-xs text-fg-muted">
                                    {arrow}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-xs text-fg-secondary">
                                  You: {row.self} · Person: {row.friend}
                                </p>
                                {row.hint ? (
                                  <p className="mt-1 text-xs text-fg-muted">
                                    {row.hint}
                                  </p>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                        <div className="space-y-2 text-sm text-fg-secondary">
                          <p>
                            Spectrum bars show relative charge, continuity, and pacing
                            style — never a single compatibility percentage. Signature
                            and spectrums stay for this pair; the Playbook blurb and
                            cards are guidance for how you relate.
                          </p>
                        </div>
                      </div>
                    </SoulChapterCard>
                  </div>
                );
              })()}
            </>
          )}
          </div>
        </>
      )}
    </div>
  );
}


function LockedSoulMock() {
  const { t } = useI18n();
  return (
    <div className="space-y-4" aria-hidden data-testid="soul-locked-mock">
      <div className="rounded-2xl border border-border bg-elevated p-5">
        <p className="text-xs uppercase tracking-wide text-fg-muted">Aura Signature</p>
        <p className="mt-1 text-3xl font-bold text-growth">⚡ Magnetic Alchemy</p>
        <p className="mt-2 text-sm text-fg-secondary">
          Static preview — live pair sync unlocks with Pro.
        </p>
        <div className="mt-3 h-12 rounded-xl border border-growth/30 bg-growth/5" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-xl border border-border bg-sunken/40 p-4">
            <div className="mb-2 h-3 w-24 rounded bg-elevated/80" />
            <div className="h-2 rounded-full bg-elevated" />
            <div className="mt-2 h-8 rounded bg-elevated/60" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-elevated p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
          {t("page.soul.h1")} Playbook
        </p>
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-xl border border-border bg-sunken/50" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SoulPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6" data-testid="soul-page">
      <div>
        <h1 className="text-2xl font-bold">{t("page.soul.h1")}</h1>
        <p className="text-sm text-fg-muted">{t("page.soul.subtitle")}</p>
      </div>

      <BiohackingEntitlementGate
        blurredPreview={<LockedSoulMock />}
        teaserTitle={t("gate.unlockTitle")}
        teaserLines={[
          t("gate.soul.signature"),
          t("gate.soul.spectrums"),
          t("gate.soul.playbook"),
        ]}
        previewLockLabel={t("gate.soul.previewLock")}
      >
        <SoulUnlockedContent />
      </BiohackingEntitlementGate>
    </div>
  );
}
