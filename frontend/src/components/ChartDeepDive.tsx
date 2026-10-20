"use client";
import type { ReactNode } from "react";

import {
  AUTHORITY_COPY,
  CENTER_COPY,
  CENTER_ORDER,
  DEFINITION_COPY,
  STRATEGY_COPY,
  TYPE_COPY,
  channelMeaning,
  displayCenter,
  profileLearnMore,
  type CenterKey,
} from "@/lib/hdCopy";

type Chart = Record<string, unknown>;

function Accordion({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border bg-elevated open:bg-elevated"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-fg">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-sm text-growth/90 break-words">{subtitle}</div>
          )}
        </div>
        <span className="mt-0.5 shrink-0 text-xs text-fg-muted group-open:hidden">Learn more</span>
        <span className="mt-0.5 hidden shrink-0 text-xs text-fg-muted group-open:inline">Hide</span>
      </summary>
      <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-fg-secondary whitespace-pre-wrap">
        {children}
      </div>
    </details>
  );
}

export function ChartDeepDive({ chart }: { chart: Chart }) {
  const defined = new Set((chart.defined_centers as string[]) || []);
  const channels = (chart.channels as Array<Record<string, unknown>>) || [];
  const hanging = (chart.hanging_gates as Array<Record<string, unknown>>) || [];
  const gates = ((chart.activated_gates as number[]) || []).slice().sort((a, b) => a - b);
  const hdType = String(chart.type || "");
  const strategy = String(chart.strategy || "");
  const authority = String(chart.authority || "");
  const profile = String(chart.profile || "");
  const definition = String(chart.definition || "");

  const typeInfo = TYPE_COPY[hdType];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-fg">Core blueprint</h2>
        <p className="text-xs text-fg-muted">
          Tap each row to expand. Short labels on the card; deeper context inside.
        </p>
        <div className="space-y-2">
          <Accordion title="Type" subtitle={hdType} defaultOpen>
            {typeInfo ? (
              <>
                <p className="mb-2 text-fg">{typeInfo.summary}</p>
                <p>{typeInfo.learnMore}</p>
              </>
            ) : (
              <p>Your energetic Role in how you correctly engage with life.</p>
            )}
          </Accordion>
          <Accordion title="Strategy" subtitle={strategy}>
            {STRATEGY_COPY[strategy] ||
              "How you correctly engage opportunities so resistance drops."}
          </Accordion>
          <Accordion title="Inner Authority" subtitle={authority}>
            {AUTHORITY_COPY[authority] ||
              "Your body's decision-making process — follow this over mental urgency."}
          </Accordion>
          <Accordion title="Profile" subtitle={profile}>
            {profileLearnMore(profile)}
          </Accordion>
          <Accordion title="Definition" subtitle={definition}>
            {DEFINITION_COPY[definition] ||
              "How your defined centers connect into one or more circuits."}
          </Accordion>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-fg">Nine centers</h2>
        <p className="text-xs text-fg-muted">
          Defined = consistent energy. Open / undefined = where you take in and amplify life (wisdom
          potential + conditioning).
        </p>
        <div className="space-y-2">
          {CENTER_ORDER.map((key) => {
            const isDefined = defined.has(key);
            const copy = CENTER_COPY[key as CenterKey];
            const status = isDefined ? "Defined" : "Open";
            return (
              <Accordion
                key={key}
                title={displayCenter(key)}
                subtitle={`${status}${isDefined ? " — consistent" : " — takes in / amplifies"}`}
              >
                <p className="mb-2">{isDefined ? copy.defined : copy.open}</p>
                <p className="text-xs text-fg-muted">Body / energy hint: {copy.bodyHint}</p>
              </Accordion>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-fg">Channels &amp; gates</h2>
        <Accordion
          title="Active channels"
          subtitle={`${channels.length} defined`}
          defaultOpen={channels.length > 0 && channels.length <= 8}
        >
          {channels.length === 0 ? (
            <p>No full channels (Reflector or hanging-only activations).</p>
          ) : (
            <ul className="space-y-2">
              {channels.map((ch) => {
                const g = (ch.gates as number[]) || [];
                const centers = ((ch.centers as string[]) || []).map(displayCenter).join(" ↔ ");
                return (
                  <li key={`${g.join("-")}-${String(ch.name)}`} className="rounded-lg bg-sunken/80 px-3 py-2">
                    <div className="font-medium text-growth">
                      {g.join("–")} — {String(ch.name)}
                    </div>
                    <div className="text-xs text-fg-muted">{centers}</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-fg-secondary">
                      {channelMeaning(g, String(ch.name || ""))}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Accordion>

        <Accordion title="Activated gates" subtitle={`${gates.length} gates`}>
          <div className="flex flex-wrap gap-1.5">
            {gates.map((g) => (
              <span
                key={g}
                className="rounded-full border border-border bg-sunken px-2.5 py-0.5 text-xs text-fg"
              >
                {g}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-fg-muted">
            Personality (black) + Design (red) activations combined. See tables below for planet and
            line detail.
          </p>
        </Accordion>

        <Accordion title="Hanging gates" subtitle={`${hanging.length} open channel halves`}>
          {hanging.length === 0 ? (
            <p>No hanging gates listed.</p>
          ) : (
            <>
              <p className="mb-3 text-xs text-fg-muted">
                You hold one gate of a channel; the missing half can feel magnetic when others (or
                transits) bring it.
              </p>
              <ul className="space-y-2">
                {hanging.map((h) => (
                  <li
                    key={`${h.held}-${h.missing}-${String(h.channel)}`}
                    className="rounded-lg bg-sunken/80 px-3 py-2 text-sm"
                  >
                    <span className="text-growth">Gate {String(h.held)}</span>
                    <span className="text-fg-muted"> waiting for </span>
                    <span className="text-energy-ink/90">{String(h.missing)}</span>
                    <span className="text-fg-muted"> — {String(h.channel)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Accordion>
      </section>
    </div>
  );
}
