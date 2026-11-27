"use client";

import { useI18n, type MessageKey } from "@/lib/i18n";
import { groupShelfByWhen, type ShelfDayItem, type ShelfWhenSlot } from "./shelfDay";

const SLOTS: { id: ShelfWhenSlot; testId: string; labelKey: MessageKey }[] = [
  { id: "morning", testId: "shelf-day-slot-morning", labelKey: "usual.when.morning" },
  { id: "midday", testId: "shelf-day-slot-midday", labelKey: "usual.when.midday" },
  { id: "evening", testId: "shelf-day-slot-evening", labelKey: "usual.when.evening" },
];

/** Read-only steady stack: names in the usual time slots. */
export function ShelfDayView({
  inventory,
  onEdit,
}: {
  inventory: ShelfDayItem[];
  onEdit: () => void;
}) {
  const { t } = useI18n();
  const groups = groupShelfByWhen(inventory);
  const usualCount =
    groups.morning.length + groups.midday.length + groups.evening.length + groups.unset.length;

  return (
    <div data-testid="shelf-day-view" className="space-y-3">
      <p className="type-body text-fg-secondary">{t("protocols.shelfDayCaption")}</p>
      {usualCount === 0 ? (
        <div className="space-y-2">
          <p className="type-body text-fg-secondary">{t("protocols.shelfDayEmpty")}</p>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-11 items-center text-sm font-medium text-growth-ink underline-offset-2 hover:underline"
          >
            {t("protocols.shelfViewEdit")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {SLOTS.map((slot) => {
            const items = groups[slot.id];
            return (
              <div key={slot.id} data-testid={slot.testId}>
                <p className="text-sm font-semibold text-fg">{t(slot.labelKey)}</p>
                {items.length === 0 ? (
                  <p className="mt-1 type-caption text-fg-muted">{t("protocols.shelfDaySlotEmpty")}</p>
                ) : (
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-full border border-border bg-sunken px-2.5 py-1 type-caption text-fg-secondary"
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {groups.unset.length > 0 ? (
            <div data-testid="shelf-day-slot-unset">
              <p className="text-sm font-semibold text-fg">{t("usual.when.clear")}</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {groups.unset.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-full border border-border bg-sunken px-2.5 py-1 type-caption text-fg-secondary"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
              <p className="mt-1 type-caption text-fg-muted">{t("protocols.shelfDayUnsetHint")}</p>
            </div>
          ) : null}
          {groups.notUsual.length > 0 ? (
            <p className="type-caption text-fg-muted" data-testid="shelf-day-not-usual">
              {t("protocols.shelfDayNotUsual", {
                names: groups.notUsual.map((item) => item.name).join(", "),
              })}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
