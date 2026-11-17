"use client";

import { useCallback } from "react";
import type { CopyPart } from "@/lib/api";
import { esSoulReadings } from "@/lib/i18n/soulReadings/es";
import { useI18n } from "@/lib/i18n";

type Params = Record<string, string | number>;

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    params[name] != null ? String(params[name]) : match
  );
}

function lookup(key: string | null | undefined): string | null {
  if (!key) return null;
  const raw = esSoulReadings[key];
  return raw ? raw : null;
}

function normalizeChannelId(raw: string): string {
  const parts = raw.split("-").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2 && parts.every((p) => /^\d+$/.test(p))) {
    return [...parts].map((n) => Number(n)).sort((a, b) => a - b).join("-");
  }
  return raw.trim();
}

function channelName(id: string): string {
  const cid = normalizeChannelId(id);
  return lookup(`soul.read.channelName.${cid}`) || id.trim();
}

function listEs(items: string[]): string {
  const clean = items.map((item) => item.trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} y ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, y ${clean[clean.length - 1]}`;
}

function channelIdsFrom(params?: Params): string[] {
  if (!params?.channel_ids) return [];
  return String(params.channel_ids)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function formatCites(params?: Params): string {
  const ids = channelIdsFrom(params);
  if (!ids.length) return params?.cites != null ? String(params.cites) : "";
  const holders = params?.holders != null ? String(params.holders).split(",") : [];
  return ids
    .map((id, i) => {
      const name = channelName(id);
      const holder = holders[i]?.trim();
      const gateTxt = normalizeChannelId(id);
      if (holder === "self" || holder === "friend") {
        const label = lookup(holder === "self" ? "soul.read.holder.your" : "soul.read.holder.their") || (holder === "self" ? "Tu" : "Su");
        return `${label} ${name}`;
      }
      return gateTxt ? `${name} (${gateTxt})` : name;
    })
    .join(", ");
}

function formatListed(params?: Params): string {
  if (params?.channel_ids) return listEs(channelIdsFrom(params).map(channelName));
  return params?.listed != null ? String(params.listed) : "";
}

function formatExtras(params?: Params): string {
  if (!params?.extras) return "";
  const names = String(params.extras)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => lookup(`soul.read.extra.${id}`) || id);
  return listEs(names);
}

function enrichParams(part: CopyPart): Params {
  const params: Params = { ...(part.params || {}) };
  if (params.channel_ids) {
    params.cites = formatCites(params);
    params.listed = formatListed(params);
  }
  if (params.channel_id) {
    params.channel = channelName(String(params.channel_id));
  } else if (params.channel) {
    const raw = String(params.channel);
    params.channel = /^\d/.test(raw) ? channelName(raw) : raw;
  }
  if (params.extras) {
    params.extras = formatExtras(params);
  }
  return params;
}

function resolveComposed(params: Params, fallback: string): string {
  const bits = [params.lead_key, params.you_key, params.they_key, params.tail_key]
    .map((key) => (key != null ? lookup(String(key)) : null))
    .map((tpl) => {
      if (!tpl) return "";
      return interpolate(tpl, params);
    })
    .filter(Boolean);
  return bits.length ? bits.join(" ") : fallback;
}


/** Spanish nickname for a completed channel when locale is es; otherwise the English fallback. */
export function resolveSoulChannelNickname(
  locale: string,
  gates: Array<number | string> | string | null | undefined,
  fallback: string,
): string {
  if (locale !== "es") return fallback;
  let id = "";
  if (Array.isArray(gates) && gates.length >= 2) {
    const nums = gates.map(Number).filter((n) => Number.isFinite(n));
    if (nums.length >= 2) id = [...nums].sort((a, b) => a - b).join("-");
  } else if (typeof gates === "string" && gates.trim()) {
    id = normalizeChannelId(gates);
  }
  if (!id) return fallback;
  return lookup(`soul.read.channelName.${id}`) || fallback;
}

/** Resolve a Soul CopyPart for the current UI locale. Non-es (and missing keys) fall back to the English API body. */
export function resolveSoulCopy(
  locale: string,
  part?: CopyPart | null,
  fallback = ""
): string {
  if (locale !== "es" || !part?.key) return fallback;
  if (part.key === "soul.read.decide.composed") {
    return resolveComposed(enrichParams(part), fallback);
  }
  const tpl = lookup(part.key);
  if (!tpl) return fallback;
  return interpolate(tpl, enrichParams(part));
}

export function useSoulCopy(): (part: CopyPart | null | undefined, fallback?: string) => string {
  const { locale } = useI18n();
  return useCallback(
    (part, fallback = "") => resolveSoulCopy(locale, part, fallback),
    [locale]
  );
}
