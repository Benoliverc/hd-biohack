/** Quiet You-chip label: never "You · You" / "YOU · You". */
export function youChipLabel(chart: { label?: string | null }, youFallback = "You"): string {
  const name = (chart.label || "").trim();
  if (!name || ["me", "you"].includes(name.toLowerCase())) return youFallback;
  return name;
}
