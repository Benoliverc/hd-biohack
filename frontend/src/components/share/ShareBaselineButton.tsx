"use client";

import { useCallback, useState } from "react";
import { Share2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  captureAndShareBaseline,
} from "@/lib/share/captureShareCard";
import type { ShareAspect } from "@/lib/share/palette";
import type { ShareGraphProps } from "@/components/share/ShareBaselineCard";

type NatalBtn = {
  variant: "natal";
  typeLabel: string;
  profileLabel: string;
  strategyLabel: string;
  firstName?: string | null;
  graph: ShareGraphProps;
  disabled?: boolean;
  className?: string;
};

type TodayBtn = {
  variant: "today";
  moveText: string;
  typeLabel: string;
  graph: ShareGraphProps;
  disabled?: boolean;
  className?: string;
};

export type ShareBaselineButtonProps = NatalBtn | TodayBtn;

/**
 * Top-right "Share my Baseline" control. Primary = Stories 9:16;
 * secondary menu offers Feed 4:5. All shares go through shareCardImage.
 */
export function ShareBaselineButton(props: ShareBaselineButtonProps) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (aspect: ShareAspect) => {
      if (props.disabled || busy) return;
      setBusy(true);
      setError(null);
      setMenuOpen(false);
      try {
        if (props.variant === "natal") {
          await captureAndShareBaseline({
            variant: "natal",
            aspect,
            typeLabel: props.typeLabel,
            profileLabel: props.profileLabel,
            strategyLabel: props.strategyLabel,
            firstName: props.firstName,
            graph: props.graph,
          });
        } else {
          await captureAndShareBaseline({
            variant: "today",
            aspect,
            moveText: props.moveText,
            typeLabel: props.typeLabel,
            graph: props.graph,
          });
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          /* user cancelled share sheet */
        } else {
          setError(t("share.failed"));
        }
      } finally {
        setBusy(false);
      }
    },
    [busy, props, t]
  );

  return (
    <div className={`relative inline-flex flex-col items-end ${props.className || ""}`}>
      <div className="inline-flex items-stretch overflow-hidden rounded-full border border-border bg-elevated shadow-soft">
        <button
          type="button"
          data-testid="share-baseline-primary"
          disabled={props.disabled || busy}
          onClick={() => void run("story")}
          className="inline-flex min-h-10 items-center gap-2 px-3.5 text-sm font-semibold text-fg transition hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-growth/40 disabled:cursor-wait disabled:opacity-60"
          title={t("share.stories")}
        >
          <Share2 className="h-4 w-4 shrink-0 text-growth" aria-hidden />
          <span>{busy ? t("share.sharing") : t("share.myBaseline")}</span>
        </button>
        <button
          type="button"
          data-testid="share-baseline-menu"
          disabled={props.disabled || busy}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={t("share.moreSizes")}
          onClick={() => setMenuOpen((o) => !o)}
          className="inline-flex min-h-10 items-center border-l border-border px-2.5 text-fg-muted transition hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-growth/40 disabled:opacity-60"
        >
          <span aria-hidden className="text-xs">
            ▾
          </span>
        </button>
      </div>
      {menuOpen ? (
        <div
          role="menu"
          data-testid="share-baseline-menu-panel"
          className="absolute right-0 top-full z-40 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-border bg-elevated py-1 shadow-soft"
        >
          <button
            type="button"
            role="menuitem"
            data-testid="share-baseline-story"
            className="block w-full px-3 py-2.5 text-left text-sm text-fg hover:bg-sunken"
            onClick={() => void run("story")}
          >
            {t("share.stories")}
          </button>
          <button
            type="button"
            role="menuitem"
            data-testid="share-baseline-feed"
            className="block w-full px-3 py-2.5 text-left text-sm text-fg hover:bg-sunken"
            onClick={() => void run("feed")}
          >
            {t("share.feed")}
          </button>
        </div>
      ) : null}
      {error ? (
        <p className="mt-1 max-w-[14rem] text-right text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
