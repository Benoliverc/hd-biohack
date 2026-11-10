"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  testId: string;
  title: string;
  tease?: string | null;
  open: boolean;
  onToggle: () => void;
  children?: ReactNode;
  /** Optional accent for Partner Love chapter shell. */
  accent?: "default" | "energy";
};

/**
 * Full-width tease-then-reveal chapter row for the Soul Chapter Map.
 * Whole header is the hit target; one-open is owned by the parent.
 */
export default function SoulChapterCard({
  testId,
  title,
  tease,
  open,
  onToggle,
  children,
  accent = "default",
}: Props) {
  const border =
    accent === "energy" ? "border-energy/55" : "border-border";
  const headerBg =
    accent === "energy"
      ? open
        ? "bg-transparent"
        : "bg-transparent hover:bg-energy/10"
      : open
        ? "bg-elevated"
        : "bg-elevated/80 hover:bg-elevated";
  const shell =
    accent === "energy"
      ? `soul-love-guidance-chapter overflow-hidden rounded-2xl border ${border}`
      : `overflow-hidden rounded-2xl border ${border} bg-elevated`;

  return (
    <div data-testid={testId} className={shell}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${headerBg}`}
      >
        <span className="min-w-0 flex-1">
          <span className="block type-meta font-semibold text-fg">{title}</span>
          {!open && tease ? (
            <span className="mt-0.5 block type-caption text-fg-secondary line-clamp-2">
              {tease}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 text-fg-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div className="border-t border-border/80 px-4 py-4">{children}</div>
      ) : null}
    </div>
  );
}
