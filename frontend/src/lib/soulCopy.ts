"use client";

import { useCallback } from "react";
import type { CopyPart } from "@/lib/api";
import { esSoulReadings } from "@/lib/i18n/soulReadings/es";
import { nlSoulReadings } from "@/lib/i18n/soulReadings/nl";
import { useI18n } from "@/lib/i18n";

type Params = Record<string, string | number>;

const SOUL_READING_CATALOGS: Record<string, Record<string, string>> = {
  es: esSoulReadings,
  nl: nlSoulReadings,
};

function catalogFor(locale: string): Record<string, string> | null {
  return SOUL_READING_CATALOGS[locale] ?? null;
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    params[name] != null ? String(params[name]) : match
  );
}

function lookup(locale: string, key: string | null | undefined): string | null {
  if (!key) return null;
  const catalog = catalogFor(locale);
  if (!catalog) return null;
  const raw = catalog[key];
  return raw ? raw : null;
}

function normalizeChannelId(raw: string): string {
  const parts = raw.split("-").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2 && parts.every((p) => /^\d+$/.test(p))) {
    return [...parts].map((n) => Number(n)).sort((a, b) => a - b).join("-");
  }
  return raw.trim();
}

function channelName(locale: string, id: string): string {
  const cid = normalizeChannelId(id);
  return lookup(locale, `soul.read.channelName.${cid}`) || id.trim();
}

function listJoin(locale: string, items: string[]): string {
  const clean = items.map((item) => item.trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  const conj = locale === "nl" ? "en" : "y";
  if (clean.length === 2) return `${clean[0]} ${conj} ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, ${conj} ${clean[clean.length - 1]}`;
}

function holderFallback(locale: string, holder: "self" | "friend"): string {
  if (locale === "nl") return holder === "self" ? "Je" : "Hun";
  return holder === "self" ? "Tu" : "Su";
}

function channelIdsFrom(params?: Params): string[] {
  if (!params?.channel_ids) return [];
  return String(params.channel_ids)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}


const CHANNEL_ARTICLES = /^(the|el|la|les|los|las|der|die|das|het)\s+/i;

/** "Your" + "The Money Line" → "Your Money Line". */
export function possessChannel(poss: string, name: string): string {
  const label = (poss || "").trim();
  const raw = (name || "").trim();
  if (!raw) return label;
  const bare = raw.replace(CHANNEL_ARTICLES, "");
  return label ? `${label} ${bare}` : bare;
}

function formatCites(locale: string, params?: Params): string {
  const ids = channelIdsFrom(params);
  if (!ids.length) return params?.cites != null ? String(params.cites) : "";
  const holders = params?.holders != null ? String(params.holders).split(",") : [];
  return ids
    .map((id, i) => {
      const name = channelName(locale, id);
      const holder = holders[i]?.trim();
      const gateTxt = normalizeChannelId(id);
      if (holder === "self" || holder === "friend") {
        const label =
          lookup(locale, holder === "self" ? "soul.read.holder.your" : "soul.read.holder.their") ||
          holderFallback(locale, holder);
        return possessChannel(label, name);
      }
      return gateTxt ? `${name} (${gateTxt})` : name;
    })
    .join(", ");
}

function formatListed(locale: string, params?: Params): string {
  if (params?.channel_ids) return listJoin(locale, channelIdsFrom(params).map((id) => channelName(locale, id)));
  return params?.listed != null ? String(params.listed) : "";
}

function formatExtras(locale: string, params?: Params): string {
  if (!params?.extras) return "";
  const names = String(params.extras)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => lookup(locale, `soul.read.extra.${id}`) || id);
  return listJoin(locale, names);
}

function enrichParams(locale: string, part: CopyPart): Params {
  const params: Params = { ...(part.params || {}) };
  if (params.channel_ids) {
    params.cites = formatCites(locale, params);
    params.listed = formatListed(locale, params);
  }
  if (params.channel_id) {
    params.channel = channelName(locale, String(params.channel_id));
  } else if (params.channel) {
    const raw = String(params.channel);
    params.channel = /^\d/.test(raw) ? channelName(locale, raw) : raw;
  }
  if (params.extras) {
    params.extras = formatExtras(locale, params);
  }
  return params;
}

function resolveComposed(locale: string, params: Params, fallback: string): string {
  const bits = [params.lead_key, params.you_key, params.they_key, params.tail_key]
    .map((key) => (key != null ? lookup(locale, String(key)) : null))
    .map((tpl) => {
      if (!tpl) return "";
      return interpolate(tpl, params);
    })
    .filter(Boolean);
  return bits.length ? bits.join(" ") : fallback;
}

function isTranslatedLocale(locale: string): locale is "es" | "nl" {
  return locale === "es" || locale === "nl";
}

/** Nickname for a completed channel when locale is es or nl; otherwise the English fallback. */
export function resolveSoulChannelNickname(
  locale: string,
  gates: Array<number | string> | string | null | undefined,
  fallback: string,
): string {
  if (!isTranslatedLocale(locale)) return fallback;
  let id = "";
  if (Array.isArray(gates) && gates.length >= 2) {
    const nums = gates.map(Number).filter((n) => Number.isFinite(n));
    if (nums.length >= 2) id = [...nums].sort((a, b) => a - b).join("-");
  } else if (typeof gates === "string" && gates.trim()) {
    id = normalizeChannelId(gates);
  }
  if (!id) return fallback;
  return lookup(locale, `soul.read.channelName.${id}`) || fallback;
}

/** Resolve a Soul CopyPart for the current UI locale. Non-es/nl (and missing keys) fall back to the English API body. */
export function resolveSoulCopy(
  locale: string,
  part?: CopyPart | null,
  fallback = ""
): string {
  if (!isTranslatedLocale(locale) || !part?.key) return fallback;
  if (part.key === "soul.read.decide.composed") {
    return resolveComposed(locale, enrichParams(locale, part), fallback);
  }
  const tpl = lookup(locale, part.key);
  if (!tpl) return fallback;
  return interpolate(tpl, enrichParams(locale, part));
}

export function useSoulCopy(): (part: CopyPart | null | undefined, fallback?: string) => string {
  const { locale } = useI18n();
  return useCallback(
    (part, fallback = "") => resolveSoulCopy(locale, part, fallback),
    [locale]
  );
}
