"use client";

import { useEffect, useRef } from "react";

import type { DayCompletions } from "@/lib/protocolCompletions";
import { progressPct, protocolsMoveCardState } from "@/lib/protocolCompletions";
import type { CheckItem } from "./types";
import { useI18n } from "@/lib/i18n";
import { Sunrise, Sun, Moon } from "lucide-react";

function SlotGlyph({ slot }: { slot?: "morning" | "midday" | "evening" }) {
  if (slot === "morning") return <Sunrise className="h-3.5 w-3.5 shrink-0 text-energy-ink" aria-hidden />;
  if (slot === "midday") return <Sun className="h-3.5 w-3.5 shrink-0 text-energy-ink" aria-hidden />;
  if (slot === "evening") return <Moon className="h-3.5 w-3.5 shrink-0 text-fg-secondary" aria-hidden />;
  return null;
}

/**
 * Prove-it checklist for Protocols. Keeps "Today's Move" naming.
 * What's-new narrative is not nested here.
 */
export function TodaysMoveCard({
  items,
  completions,
  doneMap,
  onToggle,
  onNote,
  doneCount,
  moveComplete,
  completeFlash,
  showNoKitFootnote,
  showUsualApplies,
  rotatedSlot,
  todayKitPick,
  highlightTodayKitPick = false,
  todayMoveLogged = false,
}: {
  items: CheckItem[];
  completions: DayCompletions;
  doneMap: Record<string, boolean>;
  onToggle: (it: CheckItem) => void;
  onNote: (id: string, note: string) => void;
  doneCount: number;
  moveComplete: boolean;
  completeFlash: boolean;
  showNoKitFootnote?: boolean;
  /** Quiet line when usual covers the day and no ad-hoc kit pick. */
  showUsualApplies?: boolean;
  /** Slot id that rotated vs yesterday — badge only, no essay. */
  rotatedSlot?: string | null;
  /** Today's kit pick — distinct row above the trio, not in checkItems / flash. */
  todayKitPick?: CheckItem | null;
  highlightTodayKitPick?: boolean;
  /** True when Today I-did-it (lifestyle Move) is already logged for this day. */
  todayMoveLogged?: boolean;
}) {
  const { t } = useI18n();
  const pct = progressPct(doneCount, items.length);
  const state = protocolsMoveCardState({
    itemCount: items.length,
    doneCount,
    todayMoveLogged,
    completeFlash,
  });
  const pickRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (!highlightTodayKitPick || !todayKitPick) return;
    pickRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightTodayKitPick, todayKitPick]);

  return (
    <section
      id="todays-move"
      className={`scroll-mt-[calc(var(--app-header-h,4.5rem)+0.75rem)] space-y-4 rounded-2xl border border-border p-5 shadow-soft ${
        moveComplete && items.length > 0 ? "today-move-achieved" : "bg-elevated"
      }`}
      data-testid="todays-move"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-growth-ink">{t("protocols.moveTitle")}</h2>
        {items.length > 0 && !(todayMoveLogged && doneCount === 0) && (
          <span className="sr-only" data-testid="protocol-done-count">
            {t("protocols.donePct", { done: doneCount, total: items.length, pct })}
          </span>
        )}
      </div>

      {items.length > 0 && !(todayMoveLogged && doneCount === 0) && (
        <div
          className="rounded-xl border border-growth/25 bg-sunken/60 px-3 py-2.5"
          data-testid="protocol-progress-strip"
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="type-chip uppercase tracking-wide text-growth-ink">
              {todayMoveLogged ? t("protocols.timedLeadsProgress") : t("protocols.moveProgress")}
            </span>
            <span className="text-xs font-semibold tabular-nums text-fg" data-testid="protocol-done-count-inline">
              {t("protocols.donePct", { done: doneCount, total: items.length, pct })}
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-elevated ring-1 ring-growth/25"
            data-testid="protocol-progress"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={todayMoveLogged ? t("protocols.timedLeadsProgress") : t("protocols.moveProgress")}
          >
            <div
              className="h-full rounded-full bg-growth transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {state === "complete" && (
        <div
          className={`rounded-xl border border-growth/50 bg-elevated px-3 py-2 type-body font-medium text-growth-ink ${
            completeFlash ? "animate-pulse" : ""
          }`}
          data-testid="protocol-move-complete"
          role="status"
        >
          {t("protocols.moveComplete")}
        </div>
      )}

      {state === "loggedOnToday" && (
        <p className="type-caption text-fg-secondary" data-testid="protocol-move-logged-on-today">
          {t("protocols.moveLoggedOnToday")}
        </p>
      )}

      {todayKitPick ? (
        <ul className="space-y-2">
          {(() => {
            const it = todayKitPick;
            const checked = Boolean(doneMap[it.id]);
            const note = completions[it.id]?.note || "";
            const whenLabel =
              it.slot === "morning"
                ? t("today.when.morning")
                : it.slot === "midday"
                  ? t("today.when.midday")
                  : it.slot === "evening"
                    ? t("today.when.evening")
                    : it.sub;
            return (
              <li key={it.id} ref={pickRef}>
                <div
                  className={`rounded-xl border px-3 py-2.5 ${
                    checked
                      ? "border-growth/50 bg-growth-soft/70 opacity-95"
                      : "border-border bg-canvas"
                  } ${highlightTodayKitPick ? "ring-2 ring-growth/40 shadow-soft" : ""}`}
                  data-testid="protocol-today-kit-pick"
                >
                  <label className="flex min-h-11 cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--growth,theme(colors.emerald.600))]"
                      checked={checked}
                      onChange={() => onToggle(it)}
                      data-testid={`protocol-check-${it.id}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="type-chip uppercase tracking-wide text-fg">
                        {t("protocols.todayKitPick")}
                      </span>
                      <span className="flex flex-wrap items-center gap-2">
                        <SlotGlyph slot={it.slot} />
                        <span
                          className={`type-body font-medium text-fg ${checked ? "line-through" : ""}`}
                        >
                          {it.label}
                        </span>
                      </span>
                      {whenLabel ? (
                        <span className="mt-0.5 block type-caption text-fg">{whenLabel}</span>
                      ) : null}
                      {it.why ? (
                        <span className="mt-1 block text-xs text-fg">{it.why}</span>
                      ) : null}
                    </span>
                  </label>
                  {checked && (
                    <div className="mt-2 pl-7">
                      <label className="block type-caption text-fg" htmlFor={`note-${it.id}`}>
                        {t("protocols.reflection")}
                      </label>
                      <input
                        id={`note-${it.id}`}
                        type="text"
                        maxLength={120}
                        defaultValue={note}
                        placeholder={t("protocols.reflectionPlaceholder")}
                        className="mt-0.5 w-full rounded-lg border border-border bg-sunken px-2.5 py-1.5 text-xs text-fg placeholder:text-fg-muted"
                        data-testid={`protocol-note-${it.id}`}
                        onBlur={(e) => {
                          if (e.target.value.trim() !== (note || "").trim()) {
                            onNote(it.id, e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })()}
        </ul>
      ) : null}

      <ul className="space-y-2">
        {items.map((it, idx) => {
          const checked = Boolean(doneMap[it.id]);
          const note = completions[it.id]?.note || "";
          return (
            <li key={it.id}>
              <div
                className={`rounded-xl border px-3 py-2.5 ${
                  checked
                    ? "border-growth/50 bg-growth-soft/70 opacity-95"
                    : "border-border bg-canvas"
                } ${idx === 0 && !checked ? "ring-1 ring-growth/25 shadow-soft" : ""}`}
              >
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--growth,theme(colors.emerald.600))]"
                    checked={checked}
                    onChange={() => onToggle(it)}
                    data-testid={`protocol-check-${it.id}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <SlotGlyph slot={it.slot} />
                      <span
                        className={`type-body ${
                          idx === 0 ? "font-semibold text-growth-ink" : "font-medium text-fg"
                        } ${checked ? "line-through" : ""}`}
                      >
                        {it.label}
                      </span>
                      {it.inInventory && (
                        <span
                          className="inline-flex items-center rounded-full bg-growth-soft px-2 py-0.5 text-[12px] font-medium text-growth-ink ring-1 ring-growth/30"
                          data-testid={`from-kit-badge-${it.id}`}
                        >
                          {t("protocols.fromKit")}
                        </span>
                      )}
                      {it.inInventory &&
                        it.momentChip &&
                        !(rotatedSlot && it.id === rotatedSlot) && (
                          <span
                            className="inline-flex items-center rounded-full border border-border/70 bg-elevated/80 px-2 py-0.5 type-chip font-medium text-fg-secondary"
                            data-testid={`moment-chip-${it.id}`}
                          >
                            {it.momentChip}
                          </span>
                        )}
                    </span>
                    {it.sub && (
                      <span className="mt-0.5 block type-caption text-fg-secondary">{it.sub}</span>
                    )}
                    {it.why && (
                      <span className="mt-1 block text-xs text-fg-secondary">{it.why}</span>
                    )}
                    {rotatedSlot && it.id === rotatedSlot && (
                      <span
                        className="mt-1 inline-flex items-center rounded-full bg-energy/15 px-2 py-0.5 text-[12px] font-medium text-energy-ink ring-1 ring-energy/30"
                        data-testid={`new-vs-yesterday-badge-${it.id}`}
                      >
                        {t("protocols.newVsYesterday")}
                      </span>
                    )}
                  </span>
                </label>
                {checked && (
                  <div className="mt-2 pl-7">
                    <label className="block type-caption text-fg-secondary" htmlFor={`note-${it.id}`}>
                      {t("protocols.reflection")}
                    </label>
                    <input
                      id={`note-${it.id}`}
                      type="text"
                      maxLength={120}
                      defaultValue={note}
                      placeholder={t("protocols.reflectionPlaceholder")}
                      className="mt-0.5 w-full rounded-lg border border-border bg-sunken px-2.5 py-1.5 text-xs text-fg placeholder:text-fg-muted"
                      data-testid={`protocol-note-${it.id}`}
                      onBlur={(e) => {
                        if (e.target.value.trim() !== (note || "").trim()) {
                          onNote(it.id, e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {showUsualApplies ? (
        <p className="type-caption text-fg-secondary" data-testid="usual-applies-footnote">
          {t("protocols.usualStillApplies")}
        </p>
      ) : showNoKitFootnote ? (
        <p className="type-caption text-fg-secondary" data-testid="no-kit-match-footnote">
          {t("protocols.noKitMatch")}
        </p>
      ) : null}
    </section>
  );
}
