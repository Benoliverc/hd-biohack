"use client";

import { useEffect, useState, type ReactNode } from "react";
import { observeChartNavigation } from "@/lib/observeChartNavigation";

/** Snapshot essay card: closed by default, independent of the other boxes. */
export function ChartDisclosure({
  id,
  testId,
  value,
  label,
  openOnHash = false,
  children,
}: {
  id?: string;
  testId: string;
  value: ReactNode;
  label: string;
  /** Open when the URL hash targets this box (e.g. How to read jumps). */
  openOnHash?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!openOnHash || !id) return;
    const openWhenTargeted = () => {
      if (window.location.hash === `#${id}`) setOpen(true);
    };
    openWhenTargeted();
    return observeChartNavigation(openWhenTargeted);
  }, [id, openOnHash]);
  return (
    <details
      id={id}
      data-testid={testId}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="rounded-xl border border-border bg-elevated px-3"
    >
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-fg">
        {value}
        <span className="ml-2 font-normal text-fg-secondary">{label}</span>
      </summary>
      <div className="pb-3">{children}</div>
    </details>
  );
}
