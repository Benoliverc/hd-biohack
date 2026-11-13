"use client";

import type { CSSProperties } from "react";
import {
  BodyGraph,
  type BodyGraphChannel,
} from "@/components/BodyGraph";
import {
  SHARE_GRAPH_ASPECT,
  SHARE_PALETTE,
  SHARE_SIZES,
  shareGraphHeightFrac,
  shareGraphTypeGapPx,
  shareLayoutPad,
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
  /** Exact same Move string as the on-page Today Move (localized). */
  moveText: string;
  typeLabel: string;
  graph: ShareGraphProps;
  /** Localized "My Baseline · today" chrome. */
  kicker?: string;
  /** Localized "Move" label. */
  moveLabel?: string;
};

export type ShareBaselineCardProps = NatalShareProps | TodayShareProps;

/**
 * Dedicated off-screen share card — Hero Graph Lockup.
 * All critical layout uses inline styles so foreignObject rasterization does
 * not depend on Tailwind stylesheets. Graph size is % of FULL canvas.
 */
export function ShareBaselineCard(props: ShareBaselineCardProps) {
  const { w, h } = SHARE_SIZES[props.aspect];
  const pad = shareLayoutPad(props.aspect, w, h);
  const contentW = w - pad.side * 2;

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

  const column: CSSProperties = {
    position: "absolute",
    top: pad.top,
    left: pad.side,
    width: contentW,
    height: h - pad.top - pad.bottom,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  // Soft washes: decorative full-bleed (OK in Story danger bands).
  const washTopH =
    props.aspect === "story" ? Math.round(h * 0.14) : Math.round(h * 0.1);
  const washBottomH =
    props.aspect === "story" ? Math.round(h * 0.28) : Math.round(h * 0.14);

  return (
    <div
      data-share-card
      data-share-variant={props.variant}
      data-share-aspect={props.aspect}
      style={shell}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: washTopH,
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
          height: washBottomH,
          background: `linear-gradient(0deg, ${SHARE_PALETTE.softSage} 0%, transparent 100%)`,
        }}
      />

      <div style={column}>
        {props.variant === "natal" ? (
          <NatalBody
            canvasW={w}
            canvasH={h}
            contentW={contentW}
            aspect={props.aspect}
            typeLabel={props.typeLabel}
            profileLabel={props.profileLabel}
            strategyLabel={props.strategyLabel}
            firstName={props.firstName}
            graph={props.graph}
          />
        ) : (
          <TodayBody
            canvasW={w}
            canvasH={h}
            contentW={contentW}
            aspect={props.aspect}
            moveText={props.moveText}
            typeLabel={props.typeLabel}
            graph={props.graph}
            kicker={props.kicker}
            moveLabel={props.moveLabel}
          />
        )}
      </div>
    </div>
  );
}

function Wordmark({ size }: { size: number }) {
  return (
    <div
      style={{
        fontSize: size,
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

function GraphSpotlight({ size }: { size: number }) {
  const spot = Math.round(size * 1.35);
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        width: spot,
        height: spot,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${SHARE_PALETTE.graphSpotlight} 0%, transparent 68%)`,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

function NatalBody({
  canvasH,
  contentW,
  aspect,
  typeLabel,
  profileLabel,
  strategyLabel,
  firstName,
  graph,
}: {
  canvasW: number; // reserved for future width clamps
  canvasH: number;
  contentW: number;
  aspect: ShareAspect;
  typeLabel: string;
  profileLabel: string;
  strategyLabel: string;
  firstName?: string | null;
  graph: ShareGraphProps;
}) {
  const name = (firstName || "").trim();
  const isFeed = aspect === "feed";
  const graphH = Math.round(canvasH * shareGraphHeightFrac("natal", aspect));
  const graphW = Math.min(Math.round(graphH / SHARE_GRAPH_ASPECT), contentW);
  const gapGraphType = shareGraphTypeGapPx(aspect);

  const wordmarkSize = isFeed ? 18 : 21;
  const nameSize = isFeed ? 28 : 30;
  const subtitleSize = isFeed ? 17 : 19;
  const typeSize = isFeed ? 44 : 52;
  const profileSize = isFeed ? 24 : 27;
  const strategySize = isFeed ? 19 : 21;

  return (
    <>
      <Wordmark size={wordmarkSize} />
      {name ? (
        <div
          style={{
            marginTop: 14,
            fontSize: nameSize,
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
          marginTop: name ? 8 : 16,
          fontSize: subtitleSize,
          fontWeight: 500,
          letterSpacing: "0.04em",
          color: SHARE_PALETTE.muted,
          textAlign: "center",
        }}
      >
        My natal Baseline
      </div>

      {/* Hero graph — sized from full canvas %; glued to type below */}
      <div
        style={{
          marginTop: isFeed ? 22 : 24,
          width: graphW,
          height: graphH,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <GraphSpotlight size={Math.max(graphW, graphH)} />
        <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
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
      </div>

      {/* Type lockup — no marginTop:auto void */}
      <div
        style={{
          marginTop: gapGraphType,
          width: "100%",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: typeSize,
            fontWeight: 700,
            color: SHARE_PALETTE.sage,
            lineHeight: 1.1,
          }}
        >
          {typeLabel || "—"}
        </div>
        <div
          style={{
            marginTop: isFeed ? 10 : 12,
            fontSize: profileSize,
            fontWeight: 600,
            color: SHARE_PALETTE.obsidian,
          }}
        >
          Profile {profileLabel || "—"}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: strategySize,
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
            marginTop: isFeed ? 16 : 18,
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
  canvasH,
  contentW,
  aspect,
  moveText,
  typeLabel,
  graph,
  kicker = "My Baseline · today",
  moveLabel = "Move",
}: {
  canvasW: number; // reserved for future width clamps
  canvasH: number;
  contentW: number;
  aspect: ShareAspect;
  moveText: string;
  typeLabel: string;
  graph: ShareGraphProps;
  kicker?: string;
  moveLabel?: string;
}) {
  const isFeed = aspect === "feed";
  const move = (moveText || "").trim();
  const graphH = Math.round(canvasH * shareGraphHeightFrac("today", aspect));
  const graphW = Math.min(Math.round(graphH / SHARE_GRAPH_ASPECT), contentW);
  const gapGraphType = shareGraphTypeGapPx(aspect);
  const moveMaxH = Math.round(canvasH * (isFeed ? 0.24 : 0.24));
  const headerSize = isFeed ? 16 : 18;
  const typeSize = isFeed ? 30 : 32;
  const wordmarkSize = isFeed ? 18 : 20;
  const moveFont = move.length > 70 ? (isFeed ? 26 : 28) : isFeed ? 30 : 34;
  // Story: place wordmark ~74% down canvas via a spacer after type (graph↔type stay glued).
  const wordmarkTargetFromColumnTop = isFeed
    ? null
    : Math.round(canvasH * 0.74) - Math.round(canvasH * 0.1);
  // Approximate pixels used above wordmark inside the column (header+move+gaps+graph+type).
  const approxUsedAboveWordmark = isFeed
    ? 0
    : headerSize +
      28 +
      Math.min(moveMaxH, 200) +
      32 +
      graphH +
      gapGraphType +
      13 +
      8 +
      typeSize +
      8;
  const wordmarkSpacer = isFeed
    ? 22
    : Math.max(28, (wordmarkTargetFromColumnTop as number) - approxUsedAboveWordmark);

  return (
    <>
      <div
        style={{
          fontSize: headerSize,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: SHARE_PALETTE.terracotta,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {kicker}
      </div>

      <div
        style={{
          marginTop: isFeed ? 20 : 28,
          width: "100%",
          maxHeight: moveMaxH,
          boxSizing: "border-box",
          padding: isFeed ? "20px 22px" : "26px 28px",
          borderRadius: 28,
          background: SHARE_PALETTE.alabaster,
          border: `1px solid rgba(63, 98, 77, 0.18)`,
          boxShadow: "0 12px 40px rgba(26, 26, 26, 0.06)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: SHARE_PALETTE.sage,
            marginBottom: 12,
          }}
        >
          {moveLabel}
        </div>
        <div
          style={{
            fontSize: moveFont,
            fontWeight: 600,
            color: SHARE_PALETTE.obsidian,
            lineHeight: 1.35,
            textAlign: "left",
          }}
        >
          {move || "—"}
        </div>
      </div>

      {/* Centered BodyGraph — not a side postage stamp */}
      <div
        style={{
          marginTop: isFeed ? 24 : 32,
          width: graphW,
          height: graphH,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <GraphSpotlight size={Math.max(graphW, graphH)} />
        <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
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
      </div>

      <div
        style={{
          marginTop: gapGraphType,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 13,
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
            fontSize: typeSize,
            fontWeight: 700,
            color: SHARE_PALETTE.sage,
            lineHeight: 1.15,
          }}
        >
          {typeLabel || "—"}
        </div>
      </div>

      {/* Wordmark ~74% down on story via spacer after type — never marginTop:auto */}
      <div style={{ marginTop: wordmarkSpacer, flexShrink: 0 }}>
        <Wordmark size={wordmarkSize} />
      </div>
    </>
  );
}
