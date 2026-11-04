"use client";

import { STARTER_SUPPLEMENTS } from "./constants";
import { useI18n } from "@/lib/i18n";
import { Package, Plus } from "lucide-react";

export function KitStrip({
  count,
  loading,
  onEdit,
  onAddStarter,
  adding,
  disabled,
}: {
  count: number;
  loading: boolean;
  onEdit: () => void;
  onAddStarter: (name: string) => void;
  adding: boolean;
  disabled: boolean;
}) {
  const { t } = useI18n();
  const empty = !loading && count === 0;
  return (
    <div
      className="rounded-2xl border border-border bg-elevated px-4 py-3 shadow-soft"
      data-testid="kit-strip"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-sm text-fg">
          <Package className="h-4 w-4 shrink-0 text-growth" aria-hidden />
          <span className="font-semibold">{t("protocols.yourKit")}</span>
          <span className="text-fg-muted"> · {loading ? "…" : count}</span>
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-sunken px-3 py-1.5 text-xs font-medium text-fg hover:border-growth"
          data-testid="kit-strip-edit"
        >
          {empty ? <Plus className="h-3.5 w-3.5" aria-hidden /> : null}
          {empty ? t("protocols.addItems") : t("protocols.edit")}
        </button>
      </div>
      {empty && (
        <div className="mt-2 space-y-2" data-testid="kit-strip-empty">
          <p className="text-xs text-fg-secondary">{t("protocols.kitEmptyHint")}</p>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_SUPPLEMENTS.map((name) => (
              <button
                key={name}
                type="button"
                disabled={disabled || adding}
                onClick={() => onAddStarter(name)}
                className="rounded-full border border-border bg-sunken px-2.5 py-1 text-[11px] text-fg-secondary hover:border-growth disabled:opacity-50"
                data-testid={`kit-starter-${name}`}
              >
                +{name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
