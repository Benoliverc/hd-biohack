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
  kind: CompletionKind;
};
