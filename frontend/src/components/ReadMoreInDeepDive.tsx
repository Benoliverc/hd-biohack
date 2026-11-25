"use client";

export const DEEP_DIVE_ROW_IDS = [
  "deep-dive-type",
  "deep-dive-profile",
  "deep-dive-strategy",
  "deep-dive-definition",
] as const;

export type DeepDiveRowId = (typeof DEEP_DIVE_ROW_IDS)[number];

/**
 * Shared “Read more in Deep dive” control. Visible label stays the short
 * catalog string; the accessible name names the destination row.
 */
export function ReadMoreInDeepDive({
  label,
  ariaLabel,
  testId,
  rowId,
  onJump,
}: {
  label: string;
  ariaLabel: string;
  testId: string;
  rowId: DeepDiveRowId;
  onJump: () => void;
}) {
  return (
    <a
      href={`#${rowId}`}
      data-testid={testId}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.preventDefault();
        onJump();
      }}
      onKeyDown={(event) => {
        if (event.key !== " ") return;
        event.preventDefault();
        onJump();
      }}
      className="mt-2 inline-flex min-h-11 items-center gap-1 type-caption text-growth underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      {label}
      <span aria-hidden="true">→</span>
    </a>
  );
}
