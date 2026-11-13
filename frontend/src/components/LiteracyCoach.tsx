"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  CHART_LITERACY_STEPS,
  LITERACY_STORAGE_KEYS,
  SOUL_LITERACY_STEPS,
  type LiteracyJumpMeta,
  type LiteracyStep,
} from "@/lib/hdCopy";
import { useI18n } from "@/lib/i18n";
import { TODAY_LITERACY_I18N } from "@/lib/todayCopy";
import {
  useLiteracyHowToReadOptional,
  type LiteracyHowToReadOpenOpts,
} from "@/components/LiteracyHowToReadContext";

export type LiteracyCoachVariant = "chart" | "soul" | "today";

type Props = {
  variant: LiteracyCoachVariant;
  onJump?: (targetId: string, meta?: LiteracyJumpMeta) => void;
};

const HISTORY_FLAG = "literacyReader";

type HistoryState = { literacyReader?: boolean } & Record<string, unknown>;

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
    /* private mode / quota — still quiet the chip in UI */
  }
}

function isReaderHistoryState(state: unknown): boolean {
  return Boolean(
    state &&
      typeof state === "object" &&
      (state as HistoryState).literacyReader === true
  );
}

function defaultJump(targetId: string): void {
  const el = document.getElementById(targetId);
  if (!el) return;
  const url = `${window.location.pathname}${window.location.search}#${targetId}`;
  window.history.replaceState(window.history.state, "", url);
  // Post-Jump scroll is instant so it never fights a just-closed overlay.
  el.scrollIntoView({ behavior: "auto", block: "start" });
}

function focusableElements(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(nodes).filter(
    (el) => el.getAttribute("aria-hidden") !== "true" && !el.hasAttribute("inert")
  );
}

type OverlayProps = {
  testId: string;
  title: string;
  titleId: string;
  steps: LiteracyStep[];
  initialStepId?: string;
  closeRef: RefObject<HTMLButtonElement>;
  onClose: () => void;
  onJumpStep: (step: LiteracyStep) => void;
  onGotIt: () => void;
};

function LiteracyReaderOverlay({
  testId,
  title,
  titleId,
  steps,
  initialStepId,
  closeRef,
  onClose,
  onJumpStep,
  onGotIt,
}: OverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const [chromeH, setChromeH] = useState(96);
  const portalTarget = useLiteracyPortal();

  useLayoutEffect(() => {
    const el = chromeRef.current;
    if (!el) return;
    const publish = () => setChromeH(el.getBoundingClientRect().height);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    closeRef.current?.focus();
    const scroller = articleRef.current;
    if (!scroller) return;
    if (initialStepId) {
      const section = document.getElementById(`${testId}-section-${initialStepId}`);
      section?.scrollIntoView({ behavior: "auto", block: "start" });
    } else {
      scroller.scrollTop = 0;
    }
  }, [closeRef, initialStepId, testId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const root = overlayRef.current;
      if (!root) return;
      const list = focusableElements(root);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const jumpToSection = (stepId: string) => {
    const section = document.getElementById(`${testId}-section-${stepId}`);
    section?.scrollIntoView({ behavior: "auto", block: "start" });
  };

  if (!portalTarget) return null;

  const overlay = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid={`${testId}-reader`}
      className="fixed inset-0 flex h-[100dvh] w-full flex-col bg-canvas"
    >
      <div
        ref={chromeRef}
        className="shrink-0 border-b border-border bg-canvas px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="type-section text-fg">
              {title}
            </h2>
            <p
              className="mt-1 type-caption text-fg"
              data-testid={`${testId}-sections-count`}
            >
              {steps.length} sections
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-testid={`${testId}-close`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-fg transition hover:bg-sunken"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <nav
          className="mt-3 flex flex-wrap gap-1.5"
          aria-label="Sections"
          data-testid={`${testId}-rail`}
        >
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => jumpToSection(step.id)}
              data-testid={`${testId}-rail-${step.id}`}
              className="inline-flex min-h-9 items-center rounded-full border border-border bg-elevated px-2.5 py-1 text-xs font-medium text-fg transition hover:border-growth/40 hover:bg-sunken"
            >
              {step.title}
            </button>
          ))}
        </nav>
      </div>

      <div
        ref={articleRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
      >
        <article className="mx-auto max-w-prose py-6">
          {steps.map((step) => (
            <section
              key={step.id}
              id={`${testId}-section-${step.id}`}
              data-testid={`${testId}-step-${step.id}`}
              data-literacy-step={step.id}
              className="border-b border-border/60 py-6 first:pt-0 last:border-b-0"
              style={{ scrollMarginTop: `${chromeH + 8}px` }}
            >
              <h3 className="type-section text-fg">{step.title}</h3>
              <div className="mt-3 space-y-4 type-body text-fg">
                {step.body.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onJumpStep(step)}
                data-testid={`${testId}-jump-${step.id}`}
                className="mt-4 inline-flex min-h-10 items-center rounded-full border border-border bg-elevated px-3 py-2 text-xs font-medium text-fg transition hover:border-growth/40 hover:text-growth-ink"
              >
                Jump · {step.jumpLabel}
              </button>
            </section>
          ))}

          <div className="pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
            <button
              type="button"
              onClick={onGotIt}
              data-testid={`${testId}-dismiss`}
              className="inline-flex min-h-10 items-center rounded-lg bg-growth px-3 py-2 text-xs font-semibold text-fg-inverse transition hover:bg-growth-deep"
            >
              Got it
            </button>
          </div>
        </article>
      </div>
    </div>
  );

  return createPortal(overlay, portalTarget);
}

function useLiteracyPortal(): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-literacy-reader-portal", "true");
    el.style.position = "relative";
    el.style.zIndex = "50";
    document.body.appendChild(el);
    setTarget(el);
    return () => {
      el.remove();
    };
  }, []);

  return target;
}

export default function LiteracyCoach({ variant, onJump }: Props) {
  const { t } = useI18n();
  const storageKey = LITERACY_STORAGE_KEYS[variant];
  const steps: LiteracyStep[] =
    variant === "chart"
      ? CHART_LITERACY_STEPS
      : variant === "soul"
        ? SOUL_LITERACY_STEPS
        : TODAY_LITERACY_I18N.map((step) => ({
            id: step.id,
            title: t(step.titleKey),
            body: t(step.bodyKey),
            jumpLabel: t(step.jumpKey),
            targetId: step.targetId,
          }));
  const testId =
    variant === "chart"
      ? "chart-literacy-coach"
      : variant === "soul"
        ? "soul-literacy-coach"
        : "today-literacy-coach";
  const title =
    variant === "chart"
      ? "How to read your chart"
      : variant === "soul"
        ? "How to read Soul"
        : t("today.literacy.howToReadTitle");
  const reopenLabel =
    variant === "chart"
      ? "How to read"
      : variant === "soul"
        ? "How to read Soul"
        : "How to read";

  const titleDomId = useId();
  const pathname = usePathname();
  const howToRead = useLiteracyHowToReadOptional();
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [openStepId, setOpenStepId] = useState<string | undefined>(undefined);
  const chipRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const pushedRef = useRef(false);
  const consumingRef = useRef(false);
  const pendingConsumeRef = useRef<(() => void) | null>(null);
  const pendingAfterCloseRef = useRef<(() => void) | null>(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    setDismissed(readDismissed(storageKey));
    setHydrated(true);
  }, [storageKey]);

  const lockPage = useCallback((portal: Element | null) => {
    const previous: Array<{
      el: HTMLElement;
      inert: string | null;
      hidden: string | null;
    }> = [];
    Array.from(document.body.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;
      if (child === portal || child.hasAttribute("data-literacy-reader-portal")) return;
      previous.push({
        el: child,
        inert: child.getAttribute("inert"),
        hidden: child.getAttribute("aria-hidden"),
      });
      child.setAttribute("inert", "");
      child.setAttribute("aria-hidden", "true");
    });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      previous.forEach(({ el, inert, hidden }) => {
        if (inert === null) el.removeAttribute("inert");
        else el.setAttribute("inert", inert);
        if (hidden === null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", hidden);
      });
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const unlockRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const portal = document.querySelector("[data-literacy-reader-portal]");
    unlockRef.current = lockPage(portal);
    return () => {
      unlockRef.current?.();
      unlockRef.current = null;
      const after = pendingAfterCloseRef.current;
      pendingAfterCloseRef.current = null;
      after?.();
    };
  }, [open, lockPage]);

  const consumeHistoryEntry = useCallback((): Promise<void> => {
    if (!pushedRef.current) return Promise.resolve();
    if (typeof window !== "undefined" && isReaderHistoryState(window.history.state)) {
      return new Promise((resolve) => {
        consumingRef.current = true;
        pushedRef.current = false;
        pendingConsumeRef.current = resolve;
        window.history.back();
      });
    }
    pushedRef.current = false;
    return Promise.resolve();
  }, []);

  const finishClose = useCallback(
    (opts?: { after?: () => void; focus?: HTMLElement | null }) => {
      const run = () => {
        void consumeHistoryEntry().then(() => {
          requestAnimationFrame(() => {
            opts?.focus?.focus();
            opts?.after?.();
          });
        });
      };
      if (openRef.current) {
        pendingAfterCloseRef.current = run;
        setOpen(false);
        setOpenStepId(undefined);
      } else {
        run();
      }
    },
    [consumeHistoryEntry]
  );

  const openReader = useCallback((opts?: LiteracyHowToReadOpenOpts) => {
    openerRef.current = opts?.returnFocus ?? openerRef.current;
    setOpenStepId(opts?.stepId);
    setOpen(true);
    if (typeof window !== "undefined" && !pushedRef.current) {
      const prev =
        window.history.state && typeof window.history.state === "object"
          ? (window.history.state as HistoryState)
          : {};
      window.history.pushState({ ...prev, [HISTORY_FLAG]: true }, "", window.location.href);
      pushedRef.current = true;
    }
  }, []);

  const closeWithoutWriting = useCallback(() => {
    finishClose({ focus: openerRef.current });
  }, [finishClose]);

  const handleGotIt = useCallback(() => {
    writeDismissed(storageKey);
    setDismissed(true);
    finishClose({ focus: chipRef.current });
  }, [finishClose, storageKey]);

  const handleJump = useCallback(
    (step: LiteracyStep) => {
      const meta: LiteracyJumpMeta | undefined = step.deepDiveTab
        ? { deepDiveTab: step.deepDiveTab }
        : undefined;
      const runJump = () => {
        if (onJump) {
          onJump(step.targetId, meta);
        } else {
          defaultJump(step.targetId);
        }
      };
      finishClose({ after: runJump });
    },
    [finishClose, onJump]
  );

  useEffect(() => {
    const onPopState = () => {
      if (consumingRef.current) {
        consumingRef.current = false;
        const resolve = pendingConsumeRef.current;
        pendingConsumeRef.current = null;
        resolve?.();
        return;
      }
      if (openRef.current) {
        // User Back / Android back / popstate: close without writing the key
        // and without leaving the page (the popped entry is the reader only).
        pushedRef.current = false;
        pendingAfterCloseRef.current = () => {
          openerRef.current?.focus();
        };
        setOpen(false);
        setOpenStepId(undefined);
        return;
      }
      if (isReaderHistoryState(window.history.state)) {
        // Ghost reader entry after an earlier close or route change.
        window.history.back();
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const pathRef = useRef(pathname);
  useEffect(() => {
    const prev = pathRef.current;
    pathRef.current = pathname;
    if (prev !== pathname && openRef.current) {
      pushedRef.current = false;
      pendingAfterCloseRef.current = null;
      setOpen(false);
      setOpenStepId(undefined);
    }
  }, [pathname]);

  useEffect(() => {
    if (!howToRead) return;
    howToRead.register({
      open: (opts) => {
        openReader(opts);
      },
    });
    return () => howToRead.register(null);
  }, [howToRead, openReader]);

  const handleChipOpen = useCallback(() => {
    openReader({ returnFocus: chipRef.current, stepId: undefined });
  }, [openReader]);

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

  const chipLabel = dismissed ? reopenLabel : title;
  const chipClass = dismissed
    ? "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-2 text-xs font-medium text-fg transition hover:border-growth/40 hover:text-growth-ink"
    : "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-growth/40 bg-elevated px-3 py-2 text-xs font-medium text-fg transition hover:border-growth/40 hover:text-growth-ink";

  return (
    <div
      data-testid={testId}
      data-literacy-state="chip"
      data-literacy-dismissed={dismissed ? "true" : "false"}
      className="flex justify-start"
    >
      <button
        ref={chipRef}
        type="button"
        onClick={handleChipOpen}
        data-testid={`${testId}-reopen`}
        className={chipClass}
      >
        {chipLabel}
      </button>
      {open ? (
        <LiteracyReaderOverlay
          testId={testId}
          title={title}
          titleId={titleDomId}
          steps={steps}
          initialStepId={openStepId}
          closeRef={closeRef}
          onClose={closeWithoutWriting}
          onJumpStep={handleJump}
          onGotIt={handleGotIt}
        />
      ) : null}
    </div>
  );
}
