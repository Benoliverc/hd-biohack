"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { observeChartNavigation } from "@/lib/observeChartNavigation";

/** Open/close easing for Snapshot boxes (~220ms). Skipped under prefers-reduced-motion: reduce. */
const EXPAND_MS = 220;
const EXPAND_EASING = "cubic-bezier(0.2, 0, 0, 1)";

function prefersReducedMotion(): boolean {
  return (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Snapshot essay card: closed by default, independent of the other boxes.
 * Title is label-first (`Profile: 6/2`). Body expands/collapses smoothly; instant when the
 * user prefers reduced motion.
 */
export function ChartDisclosure({
  id,
  testId,
  value,
  label,
  openOnHash = false,
  children,
}: {
  id?: string;
  testId: string;
  value: ReactNode;
  label: string;
  /** Open when the URL hash targets this box (e.g. How to read jumps). */
  openOnHash?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    if (!openOnHash || !id) return;
    const openWhenTargeted = () => {
      if (window.location.hash === `#${id}`) setOpen(true);
    };
    openWhenTargeted();
    return observeChartNavigation(openWhenTargeted);
  }, [id, openOnHash]);

  useEffect(() => () => animRef.current?.cancel(), []);

  const animateBody = (from: number, to: number, onDone?: () => void) => {
    const body = bodyRef.current;
    animRef.current?.cancel();
    if (!body || typeof body.animate !== "function") {
      onDone?.();
      return;
    }
    const anim = body.animate(
      [
        { height: `${from}px`, opacity: from === 0 ? 0 : 1, overflow: "hidden" },
        { height: `${to}px`, opacity: to === 0 ? 0 : 1, overflow: "hidden" },
      ],
      { duration: EXPAND_MS, easing: EXPAND_EASING },
    );
    animRef.current = anim;
    anim.onfinish = () => {
      animRef.current = null;
      onDone?.();
    };
  };

  const onSummaryClick = (event: MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion()) return; // native, instant toggle
    const body = bodyRef.current;
    if (!body) return;
    event.preventDefault();
    if (!open || closingRef.current) {
      closingRef.current = false;
      const from = animRef.current ? body.getBoundingClientRect().height : 0;
      setOpen(true);
      // Measure after the details element renders its content.
      requestAnimationFrame(() => animateBody(from, body.scrollHeight));
    } else {
      closingRef.current = true;
      animateBody(body.getBoundingClientRect().height, 0, () => {
        if (closingRef.current) {
          closingRef.current = false;
          setOpen(false);
        }
      });
    }
  };

  return (
    <details
      id={id}
      data-testid={testId}
      open={open}
      onToggle={(event) => {
        if (!closingRef.current) setOpen(event.currentTarget.open);
      }}
      className="rounded-xl border border-border bg-elevated px-3"
    >
      <summary
        className="min-h-11 cursor-pointer py-2 text-sm text-fg"
        onClick={onSummaryClick}
      >
        <span className="font-semibold">{label}:</span>{" "}
        <span className="font-medium text-growth">{value}</span>
      </summary>
      <div ref={bodyRef} data-chart-disclosure-body className="pb-3">
        {children}
      </div>
    </details>
  );
}
