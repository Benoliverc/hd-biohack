"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import LiteracyCoach from "@/components/LiteracyCoach";
import { BiohackingEntitlementGate } from "@/components/BiohackingEntitlementGate";
import PartnerOverviewCard from "@/components/soul/PartnerOverviewCard";
import PartnerNuanceBlock from "@/components/soul/PartnerNuanceBlock";
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
}: {
  card: SoulCard;
  showPartnerNuance: boolean;
}) {
  return (
    <div
      id={`soul-card-${card.id}`}
      className="rounded-2xl border border-border bg-elevated p-5"
      data-testid={`soul-card-${card.id}`}
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-muted">
        {card.title}
      </h2>
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

  const selectedFriend = useMemo(
    () => personOptions.find((r) => r.id === friendId) ?? null,
    [personOptions, friendId]
  );
  const isPartnerSelected = selectedFriend?.role === "partner";

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
  }, [user?.id, meId, friendId, context]);

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
          <p className="mb-3 text-sm text-fg-secondary">
            Soul needs someone else saved — add a person on Chart before aura alchemy can run.
          </p>
          <Link
            href="/profile"
            className="inline-flex min-h-11 items-center rounded-xl bg-growth/20 px-4 py-2.5 text-sm font-medium text-growth hover:bg-growth/30"
            data-testid="soul-cta-chart"
          >
            Open Chart to add someone
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

          <div data-testid="soul-playbook" className="space-y-6">
            <div>
              <p className="mb-1 text-sm font-medium text-fg">Playbook</p>
              <p className="text-xs text-fg-muted">
                {isPartnerSelected
                  ? "Love guidance for the two of you — then the mechanics underneath."
                  : "Guidance for this pair — signature, spectrums, and cards below."}
              </p>
            </div>

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
              {(() => {
                const partnerRole = result.friend?.role === "partner";
                const partnerName =
                  partnerFirstNameFromLabel(
                    result.friend?.label || selectedFriend?.label,
                  ) || "them";
                const reasonLine = partnerRole ? (
                  <p
                    className="text-xs text-fg-muted"
                    data-testid="soul-love-guidance-reason"
                  >
                    Love guidance is on because you marked{" "}
                    <span className="font-medium text-fg-secondary">{partnerName}</span>{" "}
                    as Partner on Chart.{" "}
                    <Link
                      href="/profile"
                      className="font-medium text-growth underline-offset-2 hover:underline"
                    >
                      Open Chart
                    </Link>
                  </p>
                ) : null;
                return (
                  <>
                    {partnerRole && result.partner_overview ? (
                      <PartnerOverviewCard
                        overview={result.partner_overview}
                        partnerFirstName={partnerFirstNameFromLabel(
                          result.friend?.label || selectedFriend?.label,
                        )}
                        yourType={result.self?.type}
                        theirType={result.friend?.type}
                        reasonLine={reasonLine}
                      />
                    ) : null}
                    {partnerRole && !result.partner_overview ? (
                      <div
                        className="rounded-2xl border border-border bg-elevated p-4"
                        data-testid="soul-partner-overview-missing"
                      >
                        {reasonLine}
                        <p className="mt-2 text-sm text-fg-secondary">
                          Partner is on; love chapters need a sync refresh.
                        </p>
                      </div>
                    ) : null}
                    {partnerRole && result.partner_overview ? (
                      <p
                        className="text-center text-xs tracking-wide text-fg-muted"
                        data-testid="soul-partner-signature-bridge"
                      >
                        Underneath: the charge pattern between you
                      </p>
                    ) : null}
                  </>
                );
              })()}
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

              <LiteracyCoach
                variant="soul"
                onJump={(targetId) => {
                  void jumpSoulSection(targetId);
                }}
              />

              <div id="soul-spectrums" className="grid gap-3 md:grid-cols-3" data-testid="soul-spectrums">
                {result.spectrums.map((s) => (
                  <SpectrumBar key={s.id} spectrum={s} />
                ))}
              </div>

              {(result.playbook?.lede || result.playbook?.focus_hint) && (
                <div
                  className="rounded-2xl border border-growth/30 bg-growth/10 p-4"
                  data-testid="soul-playbook-lede"
                >
                  {result.playbook.focus_hint ? (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-growth">
                      {result.playbook.focus_hint}
                    </p>
                  ) : null}
                  {result.playbook.lede ? (
                    <p className="text-sm text-fg-secondary">{result.playbook.lede}</p>
                  ) : null}
                </div>
              )}

              <div id="soul-cards" className="space-y-4" data-testid="soul-cards">
                {orderedCards.map((card) => (
                  <InsightCard
                    key={card.id}
                    card={card}
                    showPartnerNuance={result.friend?.role === "partner"}
                  />
                ))}
              </div>

              <CompletedChannelsList
                channelRoles={result.channel_roles || {}}
                showPartnerNuance={result.friend?.role === "partner"}
              />

              <details
                id="soul-conditioning"
                className="rounded-2xl border border-border bg-elevated p-5"
                data-testid="soul-conditioning"
              >
                <summary className="cursor-pointer text-sm font-semibold text-fg">
                  Centers &amp; how this is read
                </summary>
                <ul className="mt-3 space-y-2">
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
                          <span className="font-medium text-fg">{displayCenter(row.center)}</span>
                          <span className="text-xs text-fg-muted">{arrow}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-fg-secondary">
                          You: {row.self} · Person: {row.friend}
                        </p>
                        {row.hint ? (
                          <p className="mt-1 text-xs text-fg-muted">{row.hint}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 space-y-2 text-sm text-fg-secondary">
                  <p>
                    Spectrum bars show relative charge, continuity, and pacing style — never a
                    single compatibility percentage. Signature and spectrums stay for this pair;
                    the Playbook blurb and cards are guidance for how you relate.
                  </p>
                </div>
              </details>
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
