"use client";

import { useEffect, useId, useState } from "react";
import { observeChartNavigation } from "@/lib/observeChartNavigation";
import { useI18n } from "@/lib/i18n";
import { ReadMoreInDeepDive } from "@/components/ReadMoreInDeepDive";
import { readChartTypeOpen, writeChartTypeOpen } from "@/lib/chartTypeOpen";

const TYPES = [
  "Generator",
  "Manifesting Generator",
  "Manifestor",
  "Projector",
  "Reflector",
] as const;
type TypeName = (typeof TYPES)[number];
const ACCENTS = {
  Projector: ["#4a6b53", "#dce5de"],
  Generator: ["#cbad80", "#f2ece3"],
  "Manifesting Generator": ["#6d4f2c", "#f2ece3"],
  Manifestor: ["#8f4a3a", "#efece4"],
  Reflector: ["#5e645c", "#e8e4da"],
} satisfies Record<TypeName, [string, string]>;

function typeName(value: string): TypeName | null {
  return TYPES.find((name) => name === value) ?? null;
}

export type ChartTypeBoxProps = {
  actualType: string;
  /** Set when viewing someone else's chart: switches copy to their voice. */
  personName?: string;
  /** Opens the actual chart Type row in Deep dive. Preview never changes the destination. */
  onReadMoreInDeepDive?: () => void;
  /** Per-user, per-chart fold memory. Absent on Share, tests, and a bare render. */
  openStorageKey?: { userId: number; chartId: number };
  /** When nothing is stored. A chart that was just generated passes true. */
  initialOpen?: boolean;
};

/** The single Chart Type presentation: collapsed details plus presentation-only Preview. */
export function ChartTypeBox({
  actualType,
  personName,
  onReadMoreInDeepDive,
  openStorageKey,
  initialOpen,
}: ChartTypeBoxProps) {
  const { t } = useI18n();
  const id = useId();
  const [previewOpen, setPreviewOpen] = useState(false);
  // The box mounts only after the client has a chart, so this read is not an SSR paint.
  const [typeDetailsOpen, setTypeDetailsOpen] = useState(() => {
    if (openStorageKey) {
      const stored = readChartTypeOpen(openStorageKey.userId, openStorageKey.chartId);
      if (stored !== null) return stored;
    }
    return initialOpen ?? false;
  });
  const [typeThemePreview, setTypeThemePreview] = useState<TypeName | null>(
    null,
  );
  useEffect(
    () =>
      observeChartNavigation(() => {
        // Brief 17353706… part D: navigation no longer folds the Type box.
        // #152's #deep-dive-type exception is superseded by that.
        setTypeThemePreview(null);
        setPreviewOpen(false);
      }),
    [],
  );
  const actual = typeName(actualType);
  const displayedType = typeThemePreview ?? actual;
  const accent = displayedType ? ACCENTS[displayedType] : ACCENTS.Reflector;

  return (
    <div
      id="chart-type-box"
      className="relative w-full scroll-mt-[calc(var(--app-header-h,4.5rem)+0.75rem)] rounded-2xl border bg-elevated p-3 text-left"
      data-testid="bodygraph-type-card"
      style={{
        borderColor: accent[0],
        backgroundColor: `color-mix(in srgb, ${accent[1]} 35%, var(--elevated))`,
      }}
    >
      <button
        type="button"
        className="absolute right-2 top-2 inline-flex h-6 min-w-6 items-center justify-center gap-1 px-1 text-[11px] leading-4 text-fg-secondary"
        aria-expanded={previewOpen}
        aria-controls={`${id}-preview`}
        onClick={() => {
          setPreviewOpen(!previewOpen);
          setTypeThemePreview(null);
        }}
      >
        {t("chart.bodygraphModule.preview")} <span aria-hidden="true">⌄</span>
      </button>
      <details
        open={typeDetailsOpen}
        onToggle={(event) => setTypeDetailsOpen(event.currentTarget.open)}
      >
        <summary
          className="min-h-11 cursor-pointer py-2 pr-20 text-sm font-semibold text-fg"
          onClick={() => {
            if (!openStorageKey) return;
            // The visitor's own tap. Preview chips open details without writing.
            writeChartTypeOpen(
              openStorageKey.userId,
              openStorageKey.chartId,
              !typeDetailsOpen,
            );
          }}
        >
          {personName && <span>{personName} · </span>}
          {/* Type stays an English feature name in every locale. */}
          <span>Type:</span>{" "}
          <span className="font-medium text-growth">{displayedType ?? actualType}</span>
        </summary>
        {displayedType ? (
          <>
            <h3 className="type-section text-fg">
              {t(
                `chart.bodygraphModule.type.${displayedType}.${personName ? "otherLead" : "youLead"}`,
                { name: personName ?? "" },
              )}
            </h3>
            <p className="mt-3 type-body text-fg-secondary">
              {t(
                `chart.bodygraphModule.type.${displayedType}.${personName ? "otherBody" : "youBody"}`,
                { name: personName ?? "" },
              )}
            </p>
          </>
        ) : (
          <h3 className="type-section text-fg">{actualType}</h3>
        )}
        <ReadMoreInDeepDive
          label={t("chart.people.readMoreInDeepDive")}
          ariaLabel={t("chart.people.readMoreAboutTypeInDeepDive")}
          testId="chart-type-deep-dive-pointer"
          rowId="deep-dive-type"
          onJump={() => onReadMoreInDeepDive?.()}
        />
      </details>
      <div aria-live="polite">
        {typeThemePreview && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-elevated px-2 py-1 type-caption text-fg">
              {t(
                personName
                  ? "chart.bodygraphModule.previewOther"
                  : "chart.bodygraphModule.previewMine",
              )}
            </span>
            <button
              type="button"
              className="min-h-11 text-sm font-medium text-growth-ink underline underline-offset-4"
              onClick={() => {
                setTypeThemePreview(null);
                setPreviewOpen(false);
              }}
            >
              {t(
                personName
                  ? "chart.bodygraphModule.resetOther"
                  : "chart.bodygraphModule.resetMine",
                { name: personName ?? "" },
              )}
            </button>
          </div>
        )}
      </div>
      {previewOpen && (
        <div id={`${id}-preview`} className="mt-3 flex flex-wrap gap-2">
          {TYPES.filter((name) => name !== actual).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={typeThemePreview === name}
              className="min-h-11 rounded-full border border-border bg-elevated px-3 py-2 text-xs text-fg"
              onClick={() => {
                setTypeThemePreview(name);
                setTypeDetailsOpen(true);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
