/**
 * Strip ownership restatements from Protocols why lines when a "From your kit"
 * badge already says the same thing. Clause-only strip — never [^.]* across
 * semicolons / missing periods (that left "Baseline kit —" husks).
 */
export function sanitizeProtocolWhy(
  why: string | undefined,
  inInventory: boolean | undefined
): string | undefined {
  if (!why) return undefined;
  const cleaned = why
    .replace(/\s*You already own something like this\.?/gi, " ")
    .replace(/\s*[Pp]refer what you already own\.?/gi, " ")
    .replace(/\s*From your kit\.?/gi, " ")
    // Orphan punctuation left beside an em/en dash after stripping a clause.
    .replace(/\s*[—–\-]\s*[;,]+\s*/g, " — ")
    .replace(/\s*[;,]+\s*[—–\-]\s*/g, " — ")
    .replace(/\s*[;,]+\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    // Trailing husk punctuation (dash / semicolon) with no remainder.
    .replace(/\s*[—–;,\-]+\s*$/g, "")
    .trim();
  if (!cleaned || /^Baseline kit\s*[—–\-]?\s*$/i.test(cleaned)) return undefined;
  if (!inInventory) return cleaned;
  return cleaned;
}
