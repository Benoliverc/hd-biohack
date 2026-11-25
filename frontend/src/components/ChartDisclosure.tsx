"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { observeChartNavigation } from "@/lib/observeChartNavigation";

/** Open/close easing for Snapshot boxes (~220ms). Skipped under prefers-reduced-motion: reduce. */
const EXPAND_MS = 220;
const EXPAND_EASING = "cubic-bezier(0.2, 0, 0, 1)";

/** Layout effect in the browser (runs before paint); plain effect during server render. */
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Bottom edge of the sticky app header + Chart section nav, read from this box's own
 * scroll-margin-top (globals.css --chart-scroll-mt), so the clamp and the anchors share one token.
 */
function stickyStackBottom(details: HTMLElement | null): number {
  if (!details) return 0;
  const px = parseFloat(window.getComputedStyle(details).scrollMarginTop);
  return Number.isFinite(px) ? px : 0;
}

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
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  /** Viewport Y the summary must keep while this box opens or closes (null when not toggling). */
  const pinTopRef = useRef<number | null>(null);
  /** Set by an animated open tap: start height for the expand, applied before first paint. */
  const pendingExpandFromRef = useRef<number | null>(null);
  const pinFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!openOnHash || !id) return;
    const openWhenTargeted = () => {
      if (window.location.hash === `#${id}`) setOpen(true);
    };
    openWhenTargeted();
    return observeChartNavigation(openWhenTargeted);
  }, [id, openOnHash]);

  useEffect(
    () => () => {
      animRef.current?.cancel();
      if (pinFrameRef.current !== null) cancelAnimationFrame(pinFrameRef.current);
    },
    [],
  );

  /**
   * Scroll pin: remember the summary's viewport top before the layout change (clamped to just
   * below the sticky stack). Never scrollIntoView, which would send the title to the very top.
   */
  const capturePin = () => {
    const summary = summaryRef.current;
    if (!summary) return;
    pinTopRef.current = Math.max(summary.getBoundingClientRect().top, stickyStackBottom(detailsRef.current));
  };

  /** Scroll by the summary's drift so it is back at the pinned viewport top. */
  const restorePin = () => {
    const summary = summaryRef.current;
    const target = pinTopRef.current;
    if (!summary || target === null) return;
    const drift = summary.getBoundingClientRect().top - target;
    if (Math.abs(drift) >= 0.5) window.scrollBy({ top: drift, left: 0, behavior: "instant" as ScrollBehavior });
  };

  /** Hold the pin every frame while the body animates (content below grows or shrinks). */
  const holdPinWhileAnimating = () => {
    if (pinFrameRef.current !== null) cancelAnimationFrame(pinFrameRef.current);
    const tick = () => {
      restorePin();
      pinFrameRef.current = animRef.current ? requestAnimationFrame(tick) : null;
    };
    pinFrameRef.current = requestAnimationFrame(tick);
  };

  const releasePin = () => {
    restorePin();
    pinTopRef.current = null;
    if (pinFrameRef.current !== null) cancelAnimationFrame(pinFrameRef.current);
    pinFrameRef.current = null;
  };

  // After React commits `open`: start the expand from 0 in this same frame (no full-height flash),
  // then put the summary back where it was.
  useBrowserLayoutEffect(() => {
    const from = pendingExpandFromRef.current;
    const body = bodyRef.current;
    if (open && from !== null && body) {
      pendingExpandFromRef.current = null;
      animateBody(from, body.scrollHeight, releasePin);
      holdPinWhileAnimating();
    }
    // A finished close releases its pin only once the collapsed layout is committed.
    if (!open && !animRef.current && pinTopRef.current !== null) releasePin();
    else restorePin();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs only on open/close commits
  }, [open]);

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
    capturePin();
    if (prefersReducedMotion()) return; // native, instant toggle (onToggle restores the pin)
    const body = bodyRef.current;
    if (!body) return;
    event.preventDefault();
    if (!open || closingRef.current) {
      const from = animRef.current ? body.getBoundingClientRect().height : 0;
      if (open) {
        // Re-opened mid-close: details is still open, so reverse the running animation now.
        closingRef.current = false;
        animateBody(from, body.scrollHeight, releasePin);
        holdPinWhileAnimating();
      } else {
        // The layout effect starts the expand from `from` before the first paint.
        pendingExpandFromRef.current = from;
        setOpen(true);
      }
    } else {
      closingRef.current = true;
      animateBody(body.getBoundingClientRect().height, 0, () => {
        if (closingRef.current) {
          closingRef.current = false;
          setOpen(false); // the layout effect releases the pin after this commit
        } else {
          releasePin();
        }
      });
      holdPinWhileAnimating();
    }
  };

  return (
    <details
      ref={detailsRef}
      id={id}
      data-testid={testId}
      open={open}
      onToggle={(event) => {
        if (!closingRef.current) setOpen(event.currentTarget.open);
        // Reduced-motion native toggle (or hash open): keep the tapped summary where it was.
        if (pinTopRef.current !== null && !animRef.current) releasePin();
      }}
      className="rounded-xl border border-border bg-elevated px-3"
    >
      <summary
        ref={summaryRef}
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
