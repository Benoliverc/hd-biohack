/**
 * Chart voice: undefined means "you" (the account's own chart).
 * A returned name is the other-person voice, including an unsaved new-person preview.
 * Brief 17353706… (chart profile personalization).
 */

export type ChartVoiceRow = {
  slot_kind?: string;
  label?: string;
};

export type ChartVoiceInput = {
  selectedRow?: ChartVoiceRow | null;
  viewMode: "saved" | "preview" | null;
  isNewPersonUi: boolean;
  saveAs: "self" | "friend";
  hasSelfSaved: boolean;
  friendName: string;
  personFallback: string;
};

/** People never fall back to "Me" — empty labels become the localized Person word. */
function friendChipLabel(row: ChartVoiceRow, personFallback: string): string {
  const label = (row.label || "").trim();
  if (!label || label.toLowerCase() === "me") return personFallback;
  return label;
}

export function chartVoiceName(input: ChartVoiceInput): string | undefined {
  const {
    selectedRow,
    viewMode,
    isNewPersonUi,
    saveAs,
    hasSelfSaved,
    friendName,
    personFallback,
  } = input;

  if (selectedRow?.slot_kind === "friend") {
    return friendChipLabel(selectedRow, personFallback);
  }

  if (
    viewMode === "preview" &&
    isNewPersonUi &&
    !selectedRow &&
    (saveAs === "friend" || hasSelfSaved)
  ) {
    const trimmed = friendName.trim();
    if (!trimmed || trimmed.toLowerCase() === "me") return personFallback;
    return trimmed;
  }

  return undefined;
}
