"use client";

import { STARTER_SUPPLEMENTS } from "./constants";

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
  const empty = !loading && count === 0;
  return (
    <div
      className="rounded-2xl border border-border bg-elevated px-4 py-3"
      data-testid="kit-strip"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-fg">
          <span className="font-semibold">Your kit</span>
          <span className="text-fg-muted"> · {loading ? "…" : count}</span>
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="min-h-9 rounded-lg border border-border bg-sunken px-3 py-1.5 text-xs font-medium text-fg hover:border-growth"
          data-testid="kit-strip-edit"
        >
          {empty ? "Add items" : "Edit"}
        </button>
      </div>
      {empty && (
        <div className="mt-2 space-y-2" data-testid="kit-strip-empty">
          <p className="text-xs text-fg-secondary">
            Add what you own — timed supports prefer your shelf
          </p>
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
