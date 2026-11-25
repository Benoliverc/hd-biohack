/**
 * Snapshot Strategy / Definition body: the same summary + learnMore markup as the
 * Deep dive Core accordions (ChartDeepDive's SummaryLearnMore). ChartDeepDive is a
 * byte-pinned file, so this mirrors it rather than editing it; an assert keeps the
 * two render paths identical.
 */
export function ChartSummaryLearnMore({
  info,
  fallback,
}: {
  info?: { summary: string; learnMore: string };
  fallback: string;
}) {
  if (!info) return <p>{fallback}</p>;
  return (
    <>
      <p className="mb-2 text-fg">{info.summary}</p>
      {info.learnMore
        .split(/\n\n+/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((para, i) => (
          <p key={i} className={i === 0 ? undefined : "mt-3"}>
            {para}
          </p>
        ))}
    </>
  );
}
