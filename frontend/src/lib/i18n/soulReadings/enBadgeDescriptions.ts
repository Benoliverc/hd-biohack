/**
 * English badge-description overrides. EN Soul copy otherwise falls through
 * to the API body. Labels and details stay on the API / NL catalog.
 */
const EN_BADGE_DESCRIPTIONS: Record<string, string> = {
  composite_8_1:
    'When you are together, eight of nine centers are defined in the pair — a nearly full circuit, with one center still open as the pressure-release valve. A center can be open in both of your own charts and still define when you meet. Classic HD composite lore frames 8-1 as "have some fun": high capability with a reminder not to take the bond as total identity. Honor the center that stays open; over-defining the last gap invites exhaustion.',
  composite_9_0:
    'When you are together, all nine centers are defined in the pair — maximum circuitry and conditioning density. A center that stays open in both of your own charts can still define when you meet. Powerful for building and immersion; easy to lose solo aura hygiene. Schedule deliberate separation so the full circuit does not become the only way either of you feels "online."',
};

export function enSoulBadgeDescription(id: string): string | undefined {
  return EN_BADGE_DESCRIPTIONS[id];
}
