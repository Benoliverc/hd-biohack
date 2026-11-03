"use client";

import type { DayCompletions } from "@/lib/protocolCompletions";
import { progressPct } from "@/lib/protocolCompletions";
import type { CheckItem } from "./types";

/**
 * Prove-it checklist for Protocols. Keeps "Today's Move" naming.
 * What's-new narrative lives once on WeatherStrip — not nested here.
 */
export function TodaysMoveCard({
  items,
  baselineItems,
  completions,
  doneMap,
  onToggle,
  onNote,
  doneCount,
  baselineDoneCount,
  moveComplete,
  completeFlash,
  doList,
  dontList,
  baselineKitOpen,
  onToggleBaseline,
  showNoKitFootnote,
  rotatedSlot,
}: {
  items: CheckItem[];
  baselineItems: CheckItem[];
  completions: DayCompletions;
  doneMap: Record<string, boolean>;
  onToggle: (it: CheckItem) => void;
  onNote: (id: string, note: string) => void;
  doneCount: number;
  baselineDoneCount: number;
  moveComplete: boolean;
  completeFlash: boolean;
  doList: string[];
  dontList: string[];
  baselineKitOpen: boolean;
  onToggleBaseline: () => void;
  showNoKitFootnote?: boolean;
  /** Slot id that rotated vs yesterday — badge only, no essay. */
  rotatedSlot?: string | null;
}) {
  const pct = progressPct(doneCount, items.length);
  const baselinePct = progressPct(baselineDoneCount, baselineItems.length);

  return (
    <section
      className="space-y-4 rounded-2xl border border-growth/40 bg-growth-soft p-5"
      data-testid="todays-move"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-growth-ink">Today&apos;s Move</h2>
        {items.length > 0 && (
          <span className="text-xs text-fg-muted" data-testid="protocol-done-count">
            {doneCount}/{items.length} done · {pct}%
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div
          className="h-2 overflow-hidden rounded-full bg-elevated/80 ring-1 ring-growth/20"
          data-testid="protocol-progress"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Today's move progress"
        >
          <div
            className="h-full rounded-full bg-growth transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {(completeFlash || moveComplete) && items.length > 0 && (
        <div
          className={`rounded-xl border border-growth/50 bg-elevated px-3 py-2 text-sm font-medium text-growth-ink ${
            completeFlash ? "animate-pulse" : ""
          }`}
          data-testid="protocol-move-complete"
          role="status"
        >
          Today&apos;s move complete — nice work.
        </div>
      )}

      <ul className="space-y-2">
        {items.map((it, idx) => {
          const checked = Boolean(doneMap[it.id]);
          const note = completions[it.id]?.note || "";
          return (
            <li key={it.id}>
              <div
                className={`rounded-xl border px-3 py-2.5 ${
                  checked
                    ? "border-growth/50 bg-elevated/60 opacity-90"
                    : "border-growth/30 bg-elevated/90"
                } ${idx === 0 ? "shadow-soft" : ""}`}
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
                      <span
                        className={`text-sm ${
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
                          From your kit
                        </span>
                      )}
                      {it.inInventory &&
                        it.momentChip &&
                        !(rotatedSlot && it.id === rotatedSlot) && (
                          <span
                            className="inline-flex items-center rounded-full border border-border/70 bg-elevated/80 px-2 py-0.5 text-[11px] font-medium text-fg-muted"
                            data-testid={`moment-chip-${it.id}`}
                          >
                            {it.momentChip}
                          </span>
                        )}
                    </span>
                    {it.sub && (
                      <span className="mt-0.5 block text-[11px] text-fg-muted">{it.sub}</span>
                    )}
                    {it.why && (
                      <span className="mt-1 block text-xs text-fg-secondary">{it.why}</span>
                    )}
                    {rotatedSlot && it.id === rotatedSlot && (
                      <span
                        className="mt-1 inline-flex items-center rounded-full bg-energy/15 px-2 py-0.5 text-[12px] font-medium text-energy-ink ring-1 ring-energy/30"
                        data-testid={`new-vs-yesterday-badge-${it.id}`}
                      >
                        New vs yesterday
                      </span>
                    )}
                  </span>
                </label>
                {checked && (
                  <div className="mt-2 pl-7">
                    <label className="block text-[11px] text-fg-muted" htmlFor={`note-${it.id}`}>
                      Reflection
                    </label>
                    <input
                      id={`note-${it.id}`}
                      type="text"
                      maxLength={120}
                      defaultValue={note}
                      placeholder="How did it go?"
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
      {showNoKitFootnote && (
        <p className="text-xs text-fg-muted" data-testid="no-kit-match-footnote">
          No kit item matched today&apos;s weather
        </p>
      )}

      {(doList.length > 0 || dontList.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-growth/30 bg-elevated/70 p-3">
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-growth-ink">
              Do
            </h3>
            <ul className="list-disc space-y-1 pl-4 text-sm text-fg-secondary">
              {doList.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-energy/40 bg-energy/10 p-3">
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-energy-ink">
              Don&apos;t
            </h3>
            <ul className="list-disc space-y-1 pl-4 text-sm text-fg-secondary">
              {dontList.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {baselineItems.length > 0 && (
        <div className="rounded-xl border border-border/80 bg-elevated/50" data-testid="baseline-kit">
          <button
            type="button"
            onClick={onToggleBaseline}
            className="flex min-h-10 w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-fg-muted"
            aria-expanded={baselineKitOpen}
          >
            <span>
              Baseline kit (always-on defaults)
              <span className="ml-1 text-fg-muted" data-testid="baseline-done-count">
                · {baselineDoneCount}/{baselineItems.length}
              </span>
            </span>
            <span>{baselineKitOpen ? "Hide" : "Show"}</span>
          </button>
          {baselineKitOpen && (
            <div className="space-y-2 border-t border-border px-3 pb-3 pt-2">
              <div
                className="h-1.5 overflow-hidden rounded-full bg-sunken"
                data-testid="baseline-progress"
                role="progressbar"
                aria-valuenow={baselinePct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Baseline kit progress"
              >
                <div
                  className="h-full rounded-full bg-growth/70 transition-[width] duration-300 ease-out"
                  style={{ width: `${baselinePct}%` }}
                />
              </div>
              <ul className="space-y-2">
                {baselineItems.map((it) => {
                  const checked = Boolean(doneMap[it.id]);
                  const note = completions[it.id]?.note || "";
                  return (
                    <li key={it.id}>
                      <div className="rounded-lg border border-border/60 bg-elevated/80 px-2.5 py-2">
                        <label className="flex cursor-pointer gap-2.5">
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--growth,theme(colors.emerald.600))]"
                            checked={checked}
                            onChange={() => onToggle(it)}
                            data-testid={`protocol-check-${it.id}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span
                              className={`text-sm font-medium text-fg ${checked ? "line-through" : ""}`}
                            >
                              {it.label}
                            </span>
                            {it.sub && (
                              <span className="mt-0.5 block text-[11px] text-fg-muted">{it.sub}</span>
                            )}
                            {it.why && (
                              <span className="mt-0.5 block text-xs text-fg-muted">{it.why}</span>
                            )}
                          </span>
                        </label>
                        {checked && (
                          <div className="mt-1.5 pl-6">
                            <input
                              type="text"
                              maxLength={120}
                              defaultValue={note}
                              placeholder="Optional note…"
                              className="w-full rounded-lg border border-border bg-sunken px-2 py-1 text-xs text-fg placeholder:text-fg-muted"
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
            </div>
          )}
        </div>
      )}
    </section>
  );
}
