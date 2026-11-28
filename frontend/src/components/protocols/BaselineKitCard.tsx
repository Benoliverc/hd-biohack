"use client";

import { ChevronRight } from "lucide-react";
import type { DayCompletions } from "@/lib/protocolCompletions";
import { progressPct } from "@/lib/protocolCompletions";
import type { CheckItem } from "./types";
import { useI18n } from "@/lib/i18n";

/**
 * Everyday defaults, outside Today's Move. The same three rows every day.
 * A covered Magnesium row is visible and not a second checkbox.
 */
export function BaselineKitCard({
  items,
  completions,
  doneMap,
  onToggle,
  onNote,
  doneCount,
  totalCount,
  open,
  onToggleOpen,
}: {
  items: CheckItem[];
  completions: DayCompletions;
  doneMap: Record<string, boolean>;
  onToggle: (it: CheckItem) => void;
  onNote: (id: string, note: string) => void;
  doneCount: number;
  totalCount: number;
  open: boolean;
  onToggleOpen: () => void;
}) {
  const { t } = useI18n();
  const pct = progressPct(doneCount, totalCount);

  return (
    <section
      className="rounded-2xl border border-border bg-elevated shadow-soft"
      data-testid="baseline-kit"
    >
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <ChevronRight
            data-disclosure-chevron
            data-open={open ? "true" : "false"}
            className="h-4 w-4 shrink-0 text-fg-secondary"
            aria-hidden
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-fg">{t("protocols.baselineKit")}</span>
            <span
              className="mt-0.5 block type-caption text-fg-secondary"
              data-testid="baseline-kit-caption"
            >
              {t("protocols.baselineKitSameEveryDay")}
            </span>
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 text-xs text-fg-muted">
          <span data-testid="baseline-done-count">
            {doneCount}/{totalCount}
          </span>
        </span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-border px-4 pb-4 pt-3 disclosure-panel">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-sunken"
            data-testid="baseline-progress"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("protocols.baselineProgress")}
          >
            <div
              className="h-full rounded-full bg-growth/70 transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <ul className="space-y-2">
            {items.map((it) => {
              if (it.covered) {
                return (
                  <li key={it.id} data-testid={`baseline-row-${it.id}`}>
                    <div className="rounded-lg border border-border/60 bg-elevated/80 px-2.5 py-2">
                      <span className="type-body font-medium text-fg">{it.label}</span>
                      <span
                        className="mt-0.5 block type-caption text-fg-secondary"
                        data-testid="baseline-covered-caption"
                      >
                        {t("protocols.alreadyOnTodaysProtocol")}
                      </span>
                    </div>
                  </li>
                );
              }
              const checked = Boolean(doneMap[it.id]);
              const note = completions[it.id]?.note || "";
              return (
                <li key={it.id} data-testid={`baseline-row-${it.id}`}>
                  <div className="rounded-lg border border-border/60 bg-elevated/80 px-2.5 py-2">
                    <label className="flex min-h-11 cursor-pointer gap-2.5">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--growth,theme(colors.emerald.600))]"
                        checked={checked}
                        onChange={() => onToggle(it)}
                        data-testid={`protocol-check-${it.id}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`type-body font-medium text-fg ${checked ? "line-through" : ""}`}
                        >
                          {it.label}
                        </span>
                        {it.sub && (
                          <span className="mt-0.5 block type-caption text-fg-secondary">{it.sub}</span>
                        )}
                        {it.dose && (
                          <span className="mt-0.5 block type-caption text-fg-secondary">{it.dose}</span>
                        )}
                        {it.why && (
                          <span className="mt-0.5 block type-caption text-fg-secondary">{it.why}</span>
                        )}
                      </span>
                    </label>
                    {checked && (
                      <div className="mt-1.5 pl-6">
                        <input
                          type="text"
                          maxLength={120}
                          defaultValue={note}
                          placeholder={t("protocols.optionalNote")}
                          className="min-h-11 w-full rounded-lg border border-border bg-sunken px-2 py-1 text-xs text-fg placeholder:text-fg-muted"
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
    </section>
  );
}
