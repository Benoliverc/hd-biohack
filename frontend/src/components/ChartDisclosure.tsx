"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
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

type SnapshotExclusiveGroup = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

const SnapshotExclusiveContext = createContext<SnapshotExclusiveGroup | null>(null);

/**
 * Snapshot disclosures inside SnapshotExclusiveGroup keep only one box open.
 * The Type box lives outside the group and is not closed by it.
 */
export function SnapshotExclusiveGroup({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const value = useMemo(() => ({ openId, setOpenId }), [openId]);
  return <SnapshotExclusiveContext.Provider value={value}>{children}</SnapshotExclusiveContext.Provider>;
}

/**
 * After an earlier Snapshot box has collapsed, put this summary just below the sticky stack.
 * Measures the post-collapse position. Does not use scrollIntoView.
 */
function placeSummaryBelowSticky(details: HTMLElement | null, summary: HTMLElement | null) {
  if (!details || !summary || typeof summary.getBoundingClientRect !== "function") return;
  const stickyBottom = stickyStackBottom(details);
  const top = summary.getBoundingClientRect().top;
  const drift = top - stickyBottom;
  if (Math.abs(drift) >= 0.5 && typeof window.scrollBy === "function") {
    window.scrollBy({ top: drift, left: 0, behavior: "instant" as ScrollBehavior });
  }
}

/**
 * Snapshot essay card: closed by default. Inside ChartDisclosureGroup, opening one closes the others.
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
  const group = useContext(SnapshotExclusiveContext);
  const [localOpen, setLocalOpen] = useState(false);
  const open = group ? group.openId === testId : localOpen;
  const setOpen = (next: boolean) => {
    if (group) {
      if (next) group.setOpenId(testId);
      else if (group.openId === testId) group.setOpenId(null);
      return;
    }
    setLocalOpen(next);
  };
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
  /** Exclusive-open: after siblings collapse, sit the summary just below the sticky stack. */
  const stickyAnchorRef = useRef(false);

  useEffect(() => {
    if (!openOnHash || !id) return;
    const openWhenTargeted = () => {
      if (window.location.hash === `#${id}`) {
        pinTopRef.current = null;
        stickyAnchorRef.current = true;
        setOpen(true);
      }
    };
    openWhenTargeted();
    return observeChartNavigation(openWhenTargeted);
    // setOpen reads the group setter from this disclosure's mount. Hash opens only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!summary || typeof summary.getBoundingClientRect !== "function") return;
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
  // then put the summary back where it was. Exclusive-open measures after siblings collapse.
  useBrowserLayoutEffect(() => {
    if (!open) {
      animRef.current?.cancel();
      animRef.current = null;
      closingRef.current = false;
    }
    if (open && stickyAnchorRef.current) {
      stickyAnchorRef.current = false;
      placeSummaryBelowSticky(detailsRef.current, summaryRef.current);
    }
    const from = pendingExpandFromRef.current;
    const body = bodyRef.current;
    if (open && from !== null && body) {
      pendingExpandFromRef.current = null;
      animateBody(from, body.scrollHeight, releasePin);
      holdPinWhileAnimating();
    }
    // A finished close releases its pin only once the collapsed layout is committed.
    if (!open && !animRef.current && pinTopRef.current !== null) releasePin();
    else if (!stickyAnchorRef.current) restorePin();
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
    // Exclusive-open: do not keep the pre-close viewport Y. The layout effect measures
    // after the sibling above has collapsed and sits the title under the sticky stack.
    if (group && !open) {
      pinTopRef.current = null;
      stickyAnchorRef.current = true;
    }
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
        const next = event.currentTarget.open;
        // Reduced motion lets the browser toggle, then this syncs the exclusive group.
        // A sibling closing programmatically must not clear the row that just opened.
        if (prefersReducedMotion() && group && next) {
          pinTopRef.current = null;
          stickyAnchorRef.current = true;
        }
        if (!closingRef.current) setOpen(next);
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
