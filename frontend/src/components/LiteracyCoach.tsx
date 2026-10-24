"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CHART_LITERACY_STEPS,
  LITERACY_STORAGE_KEYS,
  SOUL_LITERACY_STEPS,
  type LiteracyJumpMeta,
  type LiteracyStep,
} from "@/lib/hdCopy";

export type LiteracyCoachVariant = "chart" | "soul";

type Props = {
  variant: LiteracyCoachVariant;
  onJump?: (targetId: string, meta?: LiteracyJumpMeta) => void;
};

function readDismissed(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(key: string): void {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    /* private mode / quota — still collapse in UI */
  }
}

function defaultJump(targetId: string): void {
  const el = document.getElementById(targetId);
  if (!el) return;
  const url = `${window.location.pathname}${window.location.search}#${targetId}`;
  window.history.replaceState(null, "", url);
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LiteracyCoach({ variant, onJump }: Props) {
  const storageKey =
    variant === "chart" ? LITERACY_STORAGE_KEYS.chart : LITERACY_STORAGE_KEYS.soul;
  const steps: LiteracyStep[] =
    variant === "chart" ? CHART_LITERACY_STEPS : SOUL_LITERACY_STEPS;
  const testId = variant === "chart" ? "chart-literacy-coach" : "soul-literacy-coach";
  const title =
    variant === "chart" ? "How to read your chart" : "How to read Soul";
  const reopenLabel = variant === "chart" ? "How to read" : "How to read Soul";

  const [hydrated, setHydrated] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const dismissed = readDismissed(storageKey);
    setExpanded(!dismissed);
    setActiveIndex(0);
    setHydrated(true);
  }, [storageKey]);

  const handleDismiss = useCallback(() => {
    writeDismissed(storageKey);
    setExpanded(false);
  }, [storageKey]);

  const handleReopen = useCallback(() => {
    setActiveIndex(0);
    setExpanded(true);
  }, []);

  const handleJump = useCallback(
    (step: LiteracyStep) => {
      const meta: LiteracyJumpMeta | undefined = step.deepDiveTab
        ? { deepDiveTab: step.deepDiveTab }
        : undefined;
      if (onJump) {
        onJump(step.targetId, meta);
      } else {
        defaultJump(step.targetId);
      }
    },
    [onJump]
  );

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(steps.length - 1, i + 1));
  }, [steps.length]);

  if (!hydrated) {
    return (
      <div
        data-testid={testId}
        data-literacy-state="hydrating"
        className="h-10"
        aria-hidden
      />
    );
  }

  if (!expanded) {
    return (
      <div data-testid={testId} data-literacy-state="collapsed" className="flex justify-start">
        <button
          type="button"
          onClick={handleReopen}
          data-testid={`${testId}-reopen`}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-2 text-xs font-medium text-fg-secondary transition hover:border-growth/40 hover:text-growth"
        >
          {reopenLabel}
        </button>
      </div>
    );
  }

  const active = steps[activeIndex] ?? steps[0];
  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= steps.length - 1;

  /* Chart @narrow: true single-step (no stacked inactive titles) + tighter cap.
     Soul / sm+ keep the full accordion list. */
  const chartCompact =
    variant === "chart"
      ? "max-h-[min(32vh,240px)] p-3 sm:max-h-[50vh] sm:p-5"
      : "max-h-[50vh] p-4 sm:p-5";

  return (
    <section
      data-testid={testId}
      data-literacy-state="expanded"
      data-literacy-step={active?.id}
      data-literacy-compact={variant === "chart" ? "chart-narrow" : "default"}
      className={`overflow-y-auto rounded-2xl border border-border bg-elevated/80 ${chartCompact}`}
      aria-label={title}
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 sm:mb-3">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        <p className="text-xs text-fg-muted">
          <span className="sm:hidden">
            {activeIndex + 1}/{steps.length}
          </span>
          <span className="hidden sm:inline">
            Step {activeIndex + 1} of {steps.length} · jump into the live map
          </span>
        </p>
      </div>

      {/* Narrow Chart: step dots only (inactive titles hidden to reclaim fold). */}
      {variant === "chart" ? (
        <div
          className="mb-2 flex flex-wrap gap-1.5 sm:hidden"
          role="tablist"
          aria-label="Literacy steps"
        >
          {steps.map((step, index) => {
            const n = String(index + 1).padStart(2, "0");
            const isActive = index === activeIndex;
            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveIndex(index)}
                data-testid={`${testId}-dot-${step.id}`}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-[11px] font-semibold tabular-nums ${
                  isActive
                    ? "border-growth/40 bg-growth/15 text-growth"
                    : "border-border bg-elevated text-fg-muted"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      ) : null}

      <ol className="space-y-2">
        {steps.map((step, index) => {
          const n = String(index + 1).padStart(2, "0");
          const isActive = index === activeIndex;
          /* Chart narrow: mount only the active step card. */
          if (variant === "chart" && !isActive) {
            return (
              <li
                key={step.id}
                data-testid={`${testId}-step-${step.id}`}
                data-literacy-active="false"
                className="hidden sm:block rounded-xl border border-border/70 bg-canvas/20 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="flex min-h-10 w-full items-center gap-3 text-left"
                  aria-expanded={false}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-[11px] font-semibold tabular-nums text-fg-muted"
                    aria-hidden
                  >
                    {n}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-fg-secondary">
                    {step.title}
                  </span>
                </button>
              </li>
            );
          }
          return (
            <li
              key={step.id}
              data-testid={`${testId}-step-${step.id}`}
              data-literacy-active={isActive ? "true" : "false"}
              className={`rounded-xl border px-3 py-2 ${
                isActive
                  ? "border-growth/40 bg-canvas/50"
                  : "border-border/70 bg-canvas/20"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`flex min-h-10 w-full items-center gap-3 text-left ${
                  variant === "chart" ? "hidden sm:flex" : ""
                }`}
                aria-expanded={isActive}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums ${
                    isActive
                      ? "border-growth/40 bg-growth/15 text-growth"
                      : "border-border bg-elevated text-fg-muted"
                  }`}
                  aria-hidden
                >
                  {n}
                </span>
                <span
                  className={`min-w-0 flex-1 text-sm font-medium ${
                    isActive ? "text-fg" : "text-fg-secondary"
                  }`}
                >
                  {step.title}
                </span>
              </button>

              {/* Chart narrow: always show title inline above body (header button hidden). */}
              {variant === "chart" && isActive ? (
                <div className="mb-1 flex items-center gap-3 sm:hidden">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-growth/40 bg-growth/15 text-[11px] font-semibold tabular-nums text-growth"
                    aria-hidden
                  >
                    {n}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-fg">
                    {step.title}
                  </span>
                </div>
              ) : null}

              {isActive ? (
                <div
                  className={`mt-1 border-t border-border/50 pb-1 pt-2 ${
                    variant === "chart" ? "pl-0 sm:pl-10" : "pl-10"
                  }`}
                >
                  <p className="text-sm leading-relaxed text-fg-secondary">
                    {step.body}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleJump(step)}
                    data-testid={`${testId}-jump-${step.id}`}
                    className="mt-2 inline-flex min-h-10 items-center rounded-full border border-border bg-elevated px-3 py-2 text-xs font-medium text-fg-secondary transition hover:border-growth/40 hover:text-growth"
                  >
                    Jump · {step.jumpLabel}
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2 sm:mt-4 sm:pt-3">
        <button
          type="button"
          onClick={handleDismiss}
          data-testid={`${testId}-dismiss`}
          className="inline-flex min-h-10 items-center rounded-lg bg-growth px-3 py-2 text-xs font-semibold text-fg-inverse transition hover:bg-growth-deep"
        >
          Got it
        </button>
        <button
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          data-testid={`${testId}-prev`}
          className="inline-flex min-h-10 items-center rounded-lg border border-border bg-transparent px-3 py-2 text-xs font-medium text-fg-secondary transition hover:border-growth/40 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          data-testid={`${testId}-next`}
          className="inline-flex min-h-10 items-center rounded-lg border border-border bg-transparent px-3 py-2 text-xs font-medium text-fg-secondary transition hover:border-growth/40 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  );
}
