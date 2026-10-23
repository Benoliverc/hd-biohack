"use client";

import { Lock, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";

export function BiohackingEntitlementGate({
  children,
  blurredPreview,
}: {
  children: React.ReactNode;
  /** Non-interactive mock shown behind the lock. Prefer static UI over live controls. */
  blurredPreview?: React.ReactNode;
}) {
  const { biohackingUnlocked } = useApp();

  if (biohackingUnlocked) return <>{children}</>;

  return (
    <div className="space-y-4">
      {/* Clear value teaser above the lock — readable, not blurred */}
      <div className="rounded-2xl border border-growth/30 bg-growth-soft p-5">
        <h2 className="mb-2 text-sm font-semibold text-growth">What you unlock</h2>
        <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm text-fg-secondary">
          <li>
            <span className="text-growth">Natal baseline</span> — emphasize / increase /
            ease from your Type and centers
          </li>
          <li>
            <span className="text-energy-ink">This week&apos;s transit tweaks</span> — temporary
            morning / midday / evening adjustments
          </li>
          <li>
            <span className="text-fg">Kit-aware Today&apos;s Move</span> — prefer what
            you already own
          </li>
        </ul>
        <button
          type="button"
          data-testid="unlock-protocols"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep"
          onClick={() => alert("Stripe checkout stub — wire Stripe later.")}
        >
          <Sparkles className="h-4 w-4" />
          Unlock protocols
        </button>
        <p className="mt-2 text-xs text-fg-muted">
          Chart + daily transits stay free. Pro unlocks Today’s Move and your kit.
        </p>
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
            Preview — unlock to open live Today’s Move
          </div>
        </div>
      </div>
    </div>
  );
}
