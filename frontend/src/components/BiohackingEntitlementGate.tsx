"use client";

import { useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export function BiohackingEntitlementGate({
  children,
  blurredPreview,
  teaserTitle,
  teaserLines,
  previewLockLabel,
}: {
  children: React.ReactNode;
  /** Non-interactive mock shown behind the lock. Prefer static UI over live controls. */
  blurredPreview?: React.ReactNode;
  /** Optional surface-specific unlock title (defaults to Protocols gate copy). */
  teaserTitle?: string;
  /** Optional three teaser bullets (defaults to Protocols natal / week / kit lines). */
  teaserLines?: [string, string, string];
  /** Optional lock pill label (defaults to Protocols Today's Move preview copy). */
  previewLockLabel?: string;
}) {
  const { biohackingUnlocked } = useApp();
  const { t } = useI18n();
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  if (biohackingUnlocked) return <>{children}</>;

  const title = teaserTitle ?? t("gate.unlockTitle");
  const lines = teaserLines ?? [
    t("gate.natalBaseline"),
    t("gate.weekTweaks"),
    t("gate.kitAware"),
  ];
  const lineClasses = ["text-growth", "text-energy-ink", "text-fg"] as const;
  const lockLabel = previewLockLabel ?? t("gate.previewLock");

  return (
    <div className="space-y-4">
      {/* Clear value teaser above the lock — readable, not blurred */}
      <div className="rounded-2xl border border-growth/30 bg-growth-soft p-5">
        <h2 className="mb-2 text-sm font-semibold text-growth">{title}</h2>
        <ul className="mb-4 list-disc space-y-1.5 pl-5 type-body text-fg-secondary">
          {lines.map((line, i) => (
            <li key={i}>
              <span className={lineClasses[i] ?? "text-fg"}>{line}</span>
            </li>
          ))}
        </ul>
        {waitlistJoined ? (
          <p
            role="status"
            data-testid="unlock-waitlist-joined"
            className="rounded-xl border border-growth/30 bg-canvas/60 px-4 py-3 type-body text-fg-secondary"
          >
            {t("gate.waitlistJoined")}
          </p>
        ) : (
          <>
            <button
              type="button"
              data-testid="unlock-protocols"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep"
              onClick={() => setWaitlistJoined(true)}
            >
              <Sparkles className="h-4 w-4" />
              {t("gate.joinWaitlist")}
            </button>
            <p className="mt-2 text-xs text-fg-muted">
              {t("gate.comingSoon")}
            </p>
          </>
        )}
      </div>

      <div className="relative">
        <div className="relative max-h-[min(50vh,28rem)] overflow-hidden">
          <div className="pointer-events-none select-none blur-sm opacity-50">
            {blurredPreview ?? children}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas to-transparent"
            aria-hidden
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-growth/40 bg-canvas/90 px-3 py-1.5 text-xs text-growth shadow-soft backdrop-blur">
            <Lock className="h-3.5 w-3.5" />
            {lockLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
