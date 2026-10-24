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

  useEffect(() => {
    const dismissed = readDismissed(storageKey);
    setExpanded(!dismissed);
    setHydrated(true);
  }, [storageKey]);

  const handleDismiss = useCallback(() => {
    writeDismissed(storageKey);
    setExpanded(false);
  }, [storageKey]);

  const handleKeepOpen = useCallback(() => {
    setExpanded(true);
  }, []);

  const handleReopen = useCallback(() => {
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
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1.5 text-xs font-medium text-fg-secondary transition hover:border-growth/40 hover:text-growth"
        >
          {reopenLabel}
        </button>
      </div>
    );
  }

  return (
    <section
      data-testid={testId}
      data-literacy-state="expanded"
      className="rounded-2xl border border-border bg-elevated/80 p-4 sm:p-5"
      aria-label={title}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        <p className="text-[11px] text-fg-muted">
          {steps.length} short steps · jump into the live map
        </p>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const n = String(index + 1).padStart(2, "0");
          return (
            <li
              key={step.id}
              data-testid={`${testId}-step-${step.id}`}
              className="flex gap-3 rounded-xl border border-border/70 bg-canvas/40 px-3 py-2.5"
            >
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-growth/30 bg-growth/10 text-[11px] font-semibold tabular-nums text-growth"
                aria-hidden
              >
                {n}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-fg">{step.title}</h3>
                  <button
                    type="button"
                    onClick={() => handleJump(step)}
                    data-testid={`${testId}-jump-${step.id}`}
                    className="shrink-0 rounded-full border border-border bg-elevated px-2.5 py-0.5 text-[11px] font-medium text-fg-secondary transition hover:border-growth/40 hover:text-growth"
                  >
                    Jump · {step.jumpLabel}
                  </button>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-fg-secondary">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <button
          type="button"
          onClick={handleDismiss}
          data-testid={`${testId}-dismiss`}
          className="rounded-lg bg-growth px-3 py-1.5 text-xs font-semibold text-growth-ink transition hover:opacity-90"
        >
          Got it
        </button>
        <button
          type="button"
          onClick={handleKeepOpen}
          data-testid={`${testId}-keep-open`}
          className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-fg-secondary transition hover:border-growth/40 hover:text-fg"
        >
          Keep open
        </button>
      </div>
    </section>
  );
}
