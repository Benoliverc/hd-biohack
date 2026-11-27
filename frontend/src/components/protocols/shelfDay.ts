export type ShelfWhenSlot = "morning" | "midday" | "evening";

export type ShelfDayItem = {
  id: number;
  name: string;
  is_usual?: boolean;
  usual_when?: ShelfWhenSlot | null | "";
};

export type ShelfDayGroups<T> = {
  morning: T[];
  midday: T[];
  evening: T[];
  unset: T[];
  notUsual: T[];
};

/** Inventory order is kept inside each bucket. */
export function groupShelfByWhen<T extends ShelfDayItem>(
  inventory: readonly T[],
): ShelfDayGroups<T> {
  const groups: ShelfDayGroups<T> = {
    morning: [],
    midday: [],
    evening: [],
    unset: [],
    notUsual: [],
  };
  for (const item of inventory) {
    if (item.is_usual === true) {
      const when = item.usual_when;
      if (when === "morning" || when === "midday" || when === "evening") {
        groups[when].push(item);
      } else {
        groups.unset.push(item);
      }
    } else {
      groups.notUsual.push(item);
    }
  }
  return groups;
}
