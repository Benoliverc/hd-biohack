/**
 * de/fr essays fall back to the English bundle. Only the Manifesting Generator
 * Strategy summary is localized for them (brief 2026-11-25, sha d42d08d2…);
 * every learnMore stays on the English fallback.
 */
export const MG_STRATEGY_KEY = "To Respond (then inform)";

export const MG_STRATEGY_SUMMARY_OVERLAY = {
  de: "Warte auf ein Ja aus dem Bauch, dann sag den Betroffenen Bescheid, bevor du loslegst. (Strategy: To Respond, then inform)",
  fr: "Attends un oui du corps, puis préviens les personnes concernées avant d’avancer. (Strategy: To Respond, then inform)",
} as const;
