"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import {
  api,
  type SavedChartRow,
  type SoulCard,
  type SoulContext,
  type SoulSpectrum,
  type SoulSyncResult,
} from "@/lib/api";
import { useApp } from "@/lib/store";
import { displayCenter } from "@/lib/hdCopy";
import LiteracyCoach from "@/components/LiteracyCoach";

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
  const fillClass = isPacing ? "bg-energy/80" : "bg-growth/70";
  const highClass = isPacing ? "text-energy" : "text-growth";
  return (
    <div
      data-testid={`soul-spectrum-${spectrum.id}`}
      className="rounded-xl border border-border bg-sunken/40 p-4"
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-fg">{spectrum.label}</span>
        <span className={`text-xs font-medium tabular-nums ${highClass}`}>
          {spectrum.position}
        </span>
      </div>
      <div className="mb-2 flex justify-between gap-2 text-[10px] uppercase tracking-wide text-fg-muted">
        <span>{spectrum.low_label}</span>
        <span className={isPacing ? "text-energy" : undefined}>{spectrum.high_label}</span>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-elevated">
        <div
          className={`h-full rounded-full transition-[width] ${fillClass}`}
          style={{ width: `${Math.max(0, Math.min(100, spectrum.position))}%` }}
        />
      </div>
      <p className="text-xs text-fg-muted">{spectrum.summary}</p>
    </div>
  );
}

function InsightCard({ card }: { card: SoulCard }) {
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
        <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-fg-muted">
          {card.bridges.map((b) => (
            <li key={`${b.missing_for}-${b.gate}`}>
              Gate {b.gate} · {b.channel || "channel"} · completes{" "}
              {b.missing_for === "self" ? "you" : "them"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function pickDefaultSelf(rows: SavedChartRow[], natalId: number | null): number | null {
  if (natalId != null && rows.some((r) => r.id === natalId)) return natalId;
  const self = rows.find((r) => r.slot_kind === "self");
  if (self) return self.id;
  return rows[0]?.id ?? null;
}

function pickDefaultFriend(rows: SavedChartRow[], selfId: number | null): number | null {
  const friends = rows.filter((r) => r.id !== selfId);
  const prefer = friends.find((r) => r.slot_kind === "friend");
  return (prefer ?? friends[0])?.id ?? null;
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

export default function SoulPage() {
  const { user, natalChartId, sessionReady } = useApp();
  const [charts, setCharts] = useState<SavedChartRow[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [chartsError, setChartsError] = useState<string | null>(null);

  const [selfId, setSelfId] = useState<number | null>(null);
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
      setSelfId((prev) => {
        if (prev != null && rows.some((r) => r.id === prev)) return prev;
        return pickDefaultSelf(rows, natalChartId);
      });
    } catch (e) {
      setChartsError(e instanceof Error ? e.message : String(e));
      setCharts([]);
    } finally {
      setChartsLoading(false);
    }
  }, [user?.id, natalChartId]);

  useEffect(() => {
    if (!sessionReady) return;
    void loadCharts();
  }, [sessionReady, loadCharts]);

  useEffect(() => {
    if (!charts.length) {
      setFriendId(null);
      return;
    }
    setFriendId((prev) => {
      if (prev != null && prev !== selfId && charts.some((r) => r.id === prev)) return prev;
      return pickDefaultFriend(charts, selfId);
    });
  }, [charts, selfId]);

  useEffect(() => {
    if (!user?.id || selfId == null || friendId == null || selfId === friendId) {
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
        self_chart_id: selfId,
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
  }, [user?.id, selfId, friendId, context]);

  const enoughPeople = charts.length >= 2;

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
    <div className="space-y-6" data-testid="soul-page">
      <div>
        <h1 className="text-2xl font-bold">Soul</h1>
        <p className="text-sm text-fg-muted">
          Aura mechanics between you and someone you&apos;ve charted.
        </p>
      </div>

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
      ) : !enoughPeople ? (
        <div
          className="rounded-2xl border border-border bg-elevated p-5"
          data-testid="soul-empty"
        >
          <p className="mb-3 text-sm text-fg-secondary">
            Soul needs at least two saved people — you and a friend — before aura alchemy can run.
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
            className="flex flex-col gap-3 rounded-2xl border border-border bg-elevated p-4 sm:flex-row sm:items-end sm:gap-4"
            data-testid="soul-pickers"
          >
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-fg-muted">
              You
              <select
                className="min-h-11 rounded-lg border border-border bg-canvas px-3 text-sm text-fg"
                value={selfId ?? ""}
                onChange={(e) => setSelfId(Number(e.target.value))}
                data-testid="soul-self-select"
              >
                {charts.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.id === friendId}>
                    {r.label || "Me"} · {r.type || "—"} · {r.profile || "—"}
                  </option>
                ))}
              </select>
            </label>
            <div className="hidden pb-2 text-fg-muted sm:block" aria-hidden>
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-fg-muted">
              Friend
              <select
                className="min-h-11 rounded-lg border border-border bg-canvas px-3 text-sm text-fg"
                value={friendId ?? ""}
                onChange={(e) => setFriendId(Number(e.target.value))}
                data-testid="soul-friend-select"
              >
                {charts.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.id === selfId}>
                    {r.label || "Friend"} · {r.type || "—"} · {r.profile || "—"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div data-testid="soul-playbook">
            <p className="mb-1 text-sm font-medium text-fg">Playbook</p>
            <p className="text-xs text-fg-muted">
              Guidance for this pair — signature, spectrums, and cards below.
            </p>
          </div>

          {(apiMissing || schemaLag) && (
            <div
              className="rounded-2xl border border-energy/40 bg-energy/10 p-5"
              data-testid="soul-api-missing"
            >
              <p className="text-sm text-energy-ink">
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
              <div
                id="soul-hero"
                className="rounded-2xl border border-border bg-elevated p-5"
                data-testid="soul-hero"
              >
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
                {result.secondary_signature && (
                  <div
                    className="mt-3 rounded-xl border border-border bg-sunken/60 px-3 py-2"
                    data-testid="soul-secondary-signature"
                  >
                    <p className="text-xs font-medium text-fg-secondary">
                      Also: {result.secondary_signature.label}
                    </p>
                    {result.secondary_signature.subtext ? (
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
                  <InsightCard key={card.id} card={card} />
                ))}
              </div>

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
                        ? "Friend → You"
                        : row.direction === "self_to_friend"
                          ? "You → Friend"
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
                          You: {row.self} · Friend: {row.friend}
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
        </>
      )}
    </div>
  );
}
