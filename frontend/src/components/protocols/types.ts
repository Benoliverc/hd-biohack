import type { CompletionKind } from "@/lib/protocolCompletions";

export type WhatsNew = {
  chip?: string;
  body?: string;
  source?: string;
  key?: string;
  rotated?: boolean;
  rotated_slot?: string | null;
  forced_rotation?: boolean;
  lead_fingerprint?: string;
  yesterday_lead_fingerprint?: string | null;
  fingerprint_matched?: boolean;
};

export type CheckItem = {
  id: string;
  label: string;
  sub?: string;
  why?: string;
  inInventory?: boolean;
  momentChip?: string;
  /** Timed lead slot — glyph on Move rows. */
  slot?: "morning" | "midday" | "evening";
  kind: CompletionKind;
  /** Baseline kit dose line. Omitted when the row is already covered today. */
  dose?: string;
  /** True when today's protocol already covers this Baseline kit row. */
  covered?: boolean;
};
