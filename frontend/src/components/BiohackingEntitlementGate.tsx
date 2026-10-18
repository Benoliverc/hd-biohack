"use client";

import { Lock, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";

export function BiohackingEntitlementGate({
  children,
  blurredPreview,
}: {
  children: React.ReactNode;
  blurredPreview?: React.ReactNode;
}) {
  const { biohackingUnlocked, enforcePaywall } = useApp();

  if (biohackingUnlocked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-60">
        {blurredPreview || children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-violet-500/40 bg-slate-950/90 p-6 shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-violet-300">
            <Lock className="h-5 w-5" />
            <span className="font-semibold">Biohacking Pro</span>
          </div>
          <p className="mb-4 text-sm text-slate-300">
            Chart + daily transits stay free. Weekly/daily supplement protocols and V2 wearables
            unlock with Biohacker Pro.
            {enforcePaywall ? " Paywall preview is ON." : ""}
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
            onClick={() => alert("Stripe checkout stub — wire Stripe later.")}
          >
            <Sparkles className="h-4 w-4" />
            Unlock Biohacking Pro
          </button>
        </div>
      </div>
    </div>
  );
}
