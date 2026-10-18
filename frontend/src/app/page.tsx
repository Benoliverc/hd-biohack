import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
        <p className="mb-2 text-sm uppercase tracking-widest text-violet-400">V1 MVP</p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          Human Design chart + live transits + biohacking protocols
        </h1>
        <p className="max-w-2xl text-slate-400">
          Self-hosted Swiss Ephemeris engine. Free chart &amp; daily transits. Biohacking module is
          entitlement-gated for a future Stripe tier. V2 wearables stubbed.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profile"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500"
          >
            Calculate your chart
          </Link>
          <Link
            href="/transits"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:border-violet-500"
          >
            Today&apos;s transits
          </Link>
          <Link
            href="/biohack"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:border-violet-500"
          >
            Biohack protocols
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Module A–B", "Natal chart, type, authority, centers, channels"],
          ["Module C", "Live transit overlay + bridged channels"],
          ["Module D–E", "Deterministic stacks + LLM optional + wearables stub"],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="mb-1 font-semibold text-violet-200">{t}</h2>
            <p className="text-sm text-slate-400">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
