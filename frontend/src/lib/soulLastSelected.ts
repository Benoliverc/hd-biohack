/** Last selected Soul person, persisted per signed-in account in the browser. */

export const SOUL_LAST_PERSON_KEY_PREFIX = "hd-biohack:soul-last-person:";

export type SoulPersonOption = {
  id: number;
  role?: string | null;
  slot_kind?: string | null;
};

export function soulLastPersonKey(userId: number): string {
  return `${SOUL_LAST_PERSON_KEY_PREFIX}${userId}`;
}

function getLocalStorage(): Storage | null {
  try {
    const ls = (globalThis as { localStorage?: Storage }).localStorage;
    return ls ?? null;
  } catch {
    return null;
  }
}

export function readSoulLastPersonId(userId: number): number | null {
  try {
    const raw = getLocalStorage()?.getItem(soulLastPersonKey(userId));
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function writeSoulLastPersonId(userId: number, id: number | null): void {
  try {
    const ls = getLocalStorage();
    if (!ls) return;
    const key = soulLastPersonKey(userId);
    if (id == null) ls.removeItem(key);
    else ls.setItem(key, String(id));
  } catch {
    /* ignore quota / private mode */
  }
}

/** First friend slot, else the first remaining row (existing Soul default). */
export function pickDefaultFriend(
  rows: SoulPersonOption[],
  meId: number | null,
): number | null {
  const others = rows.filter((r) => r.id !== meId);
  const prefer = others.find((r) => r.slot_kind === "friend");
  return (prefer ?? others[0])?.id ?? null;
}

export function pickPartnerId(rows: SoulPersonOption[]): number | null {
  return rows.find((r) => r.role === "partner")?.id ?? null;
}

/**
 * Who Soul should open for this visit:
 * 1. In-session selection if still in options
 * 2. Remembered id if still in options
 * 3. Marked Partner if one exists
 * 4. pickDefaultFriend (anyone else)
 * Empty options → null (add-person / empty state).
 */
export function pickSoulOpenPerson(args: {
  options: SoulPersonOption[];
  meId: number | null;
  previousId: number | null;
  rememberedId: number | null;
}): number | null {
  const { options, meId, previousId, rememberedId } = args;
  if (!options.length) return null;
  if (previousId != null && options.some((r) => r.id === previousId)) {
    return previousId;
  }
  if (rememberedId != null && options.some((r) => r.id === rememberedId)) {
    return rememberedId;
  }
  const partnerId = pickPartnerId(options);
  if (partnerId != null) return partnerId;
  return pickDefaultFriend(options, meId);
}
