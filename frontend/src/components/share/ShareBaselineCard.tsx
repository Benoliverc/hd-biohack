"use client";

import type { CSSProperties } from "react";
import {
  BodyGraph,
  type BodyGraphChannel,
} from "@/components/BodyGraph";
import {
  SHARE_PALETTE,
  SHARE_SIZES,
  shareSafeInsets,
  type ShareAspect,
} from "@/lib/share/palette";

export type ShareGraphProps = {
  definedCenters: string[];
  channels: BodyGraphChannel[];
  activatedGates?: number[];
  hangingGates?: Array<{ held?: number; missing?: number; channel?: string }>;
  personalityGates?: number[];
  designGates?: number[];
};

export type NatalShareProps = {
  variant: "natal";
  aspect: ShareAspect;
  typeLabel: string;
  profileLabel: string;
  strategyLabel: string;
  firstName?: string | null;
  graph: ShareGraphProps;
};

export type TodayShareProps = {
  variant: "today";
  aspect: ShareAspect;
  /** Exact same Move string as the on-page Today Move (main_action_text). */
  moveText: string;
  typeLabel: string;
  graph: ShareGraphProps;
};

export type ShareBaselineCardProps = NatalShareProps | TodayShareProps;

/**
 * Dedicated off-screen share card. All critical layout uses inline styles so
 * foreignObject rasterization does not depend on Tailwind stylesheets.
 */
export function ShareBaselineCard(props: ShareBaselineCardProps) {
  const { w, h } = SHARE_SIZES[props.aspect];
  const inset = shareSafeInsets(w, h);
  const contentH = h - inset.top - inset.bottom;
  const contentW = w - inset.side * 2;

  const shell: CSSProperties = {
    width: w,
    height: h,
    boxSizing: "border-box",
    margin: 0,
    padding: 0,
    backgroundColor: SHARE_PALETTE.linen,
    color: SHARE_PALETTE.obsidian,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    position: "relative",
    overflow: "hidden",
  };

  const safe: CSSProperties = {
    position: "absolute",
    top: inset.top,
    left: inset.side,
    width: contentW,
    height: contentH,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  return (
    <div data-share-card data-share-variant={props.variant} data-share-aspect={props.aspect} style={shell}>
      {/* Soft terracotta wash — designed, not a screenshot */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: inset.top + 80,
          background: `linear-gradient(180deg, ${SHARE_PALETTE.softTerracotta} 0%, transparent 100%)`,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Math.round(inset.bottom * 0.55),
          background: `linear-gradient(0deg, ${SHARE_PALETTE.softSage} 0%, transparent 100%)`,
        }}
      />

      <div style={safe}>
        {props.variant === "natal" ? (
          <NatalBody
            contentW={contentW}
            contentH={contentH}
            typeLabel={props.typeLabel}
            profileLabel={props.profileLabel}
            strategyLabel={props.strategyLabel}
            firstName={props.firstName}
            graph={props.graph}
          />
        ) : (
          <TodayBody
            contentW={contentW}
            contentH={contentH}
            moveText={props.moveText}
            typeLabel={props.typeLabel}
            graph={props.graph}
          />
        )}
      </div>
    </div>
  );
}

function Wordmark({ large }: { large?: boolean }) {
  return (
    <div
      style={{
        fontSize: large ? 28 : 22,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: SHARE_PALETTE.sage,
        textAlign: "center",
      }}
    >
      Baseline
    </div>
  );
}

function NatalBody({
  contentW,
  contentH,
  typeLabel,
  profileLabel,
  strategyLabel,
  firstName,
  graph,
}: {
  contentW: number;
  contentH: number;
  typeLabel: string;
  profileLabel: string;
  strategyLabel: string;
  firstName?: string | null;
  graph: ShareGraphProps;
}) {
  const name = (firstName || "").trim();
  const graphSize = Math.min(Math.round(contentW * 0.78), Math.round(contentH * 0.52));

  return (
    <>
      <Wordmark large />
      {name ? (
        <div
          style={{
            marginTop: 18,
            fontSize: 36,
            fontWeight: 600,
            color: SHARE_PALETTE.obsidian,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: "100%",
          }}
        >
          {name}
        </div>
      ) : null}
      <div
        style={{
          marginTop: name ? 10 : 22,
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: "0.04em",
          color: SHARE_PALETTE.muted,
          textAlign: "center",
        }}
      >
        My natal Baseline
      </div>

      <div
        style={{
          marginTop: 28,
          width: graphSize,
          height: Math.round(graphSize * (360 / 240)),
          maxHeight: Math.round(contentH * 0.55),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BodyGraph
          compact
          definedCenters={graph.definedCenters}
          channels={graph.channels}
          activatedGates={graph.activatedGates}
          hangingGates={graph.hangingGates}
          personalityGates={graph.personalityGates}
          designGates={graph.designGates}
          svgWidth="100%"
          svgHeight="100%"
        />
      </div>

      <div
        style={{
          marginTop: "auto",
          width: "100%",
          textAlign: "center",
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: SHARE_PALETTE.sage,
            lineHeight: 1.1,
          }}
        >
          {typeLabel || "—"}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 26,
            fontWeight: 600,
            color: SHARE_PALETTE.obsidian,
          }}
        >
          Profile {profileLabel || "—"}
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 22,
            fontWeight: 500,
            color: SHARE_PALETTE.muted,
            lineHeight: 1.3,
          }}
        >
          {strategyLabel || ""}
        </div>
        <div
          aria-hidden
          style={{
            marginTop: 22,
            width: 48,
            height: 4,
            borderRadius: 999,
            background: SHARE_PALETTE.terracotta,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
    </>
  );
}

function TodayBody({
  contentW,
  contentH,
  moveText,
  typeLabel,
  graph,
}: {
  contentW: number;
  contentH: number;
  moveText: string;
  typeLabel: string;
  graph: ShareGraphProps;
}) {
  const graphSize = Math.min(Math.round(contentW * 0.42), Math.round(contentH * 0.28));
  const move = (moveText || "").trim();

  return (
    <>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: SHARE_PALETTE.terracotta,
          textAlign: "center",
        }}
      >
        My Baseline · today
      </div>

      <div
        style={{
          marginTop: 36,
          width: "100%",
          boxSizing: "border-box",
          padding: "28px 24px",
          borderRadius: 28,
          background: SHARE_PALETTE.alabaster,
          border: `1px solid rgba(63, 98, 77, 0.18)`,
          boxShadow: "0 12px 40px rgba(26, 26, 26, 0.06)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: SHARE_PALETTE.sage,
            marginBottom: 14,
          }}
        >
          Move
        </div>
        <div
          style={{
            fontSize: move.length > 70 ? 30 : 36,
            fontWeight: 600,
            color: SHARE_PALETTE.obsidian,
            lineHeight: 1.35,
            textAlign: "left",
          }}
        >
          {move || "—"}
        </div>
      </div>

      <div
        style={{
          marginTop: 36,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          width: "100%",
        }}
      >
        <div
          style={{
            width: graphSize,
            height: Math.round(graphSize * (360 / 240)),
            flexShrink: 0,
          }}
        >
          <BodyGraph
            compact
            definedCenters={graph.definedCenters}
            channels={graph.channels}
            activatedGates={graph.activatedGates}
            hangingGates={graph.hangingGates}
            personalityGates={graph.personalityGates}
            designGates={graph.designGates}
            svgWidth="100%"
            svgHeight="100%"
          />
        </div>
        <div style={{ minWidth: 0, textAlign: "left" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: SHARE_PALETTE.muted,
            }}
          >
            Type
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 32,
              fontWeight: 700,
              color: SHARE_PALETTE.sage,
              lineHeight: 1.15,
            }}
          >
            {typeLabel || "—"}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "auto", paddingBottom: 8 }}>
        <Wordmark />
      </div>
    </>
  );
}
