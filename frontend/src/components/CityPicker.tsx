"use client";

import { useEffect, useRef, useState } from "react";
import { api, GeoPlace } from "@/lib/api";
import { formatTimezoneLabel } from "@/lib/timezone";
import { useI18n } from "@/lib/i18n";

type Props = {
  value: string;
  lat: number | null;
  lon: number | null;
  timezone?: string | null;
  birthDate?: string;
  birthTime?: string;
  disabled?: boolean;
  onChange: (
    city: string,
    lat: number | null,
    lon: number | null,
    timezone?: string | null
  ) => void;
  /** First-run Chart surface: quieter typeahead, no Resolve / default lat-lon chrome. */
  variant?: "default" | "first-run";
  fieldError?: string | null;
};

function looksLikeCoordinates(value: string): boolean {
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(value.trim());
}

function shortPlaceLabel(value: string): string | null {
  const raw = value.trim();
  if (!raw || looksLikeCoordinates(raw)) return null;
  return raw.split(",")[0]?.trim() || raw;
}

function shortTimezoneLabel(
  timeZone: string | null | undefined,
  birthDate?: string,
  birthTime?: string
): string | null {
  if (!timeZone) return null;
  try {
    const t = (birthTime || "00:00").slice(0, 8);
    const hhmmss = t.length === 5 ? `${t}:00` : t;
    const at =
      birthDate && !Number.isNaN(new Date(`${birthDate}T${hhmmss}Z`).getTime())
        ? new Date(`${birthDate}T${hhmmss}Z`)
        : new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(at);
    const name = parts.find((p) => p.type === "timeZoneName")?.value;
    return name || timeZone;
  } catch {
    return timeZone;
  }
}

export function CityPicker({
  value,
  lat,
  lon,
  timezone,
  birthDate,
  birthTime,
  disabled = false,
  onChange,
  variant = "default",
  fieldError = null,
}: Props) {
  const { t } = useI18n();
  const firstRun = variant === "first-run";
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [manual, setManual] = useState(false);
  const [latStr, setLatStr] = useState(lat != null ? String(lat) : "");
  const [lonStr, setLonStr] = useState(lon != null ? String(lon) : "");
  const [geoError, setGeoError] = useState<string | null>(null);
  const resolvedLabel = useRef<string>(value);
  const boxRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isResolved = lat != null && lon != null;

  useEffect(() => {
    setQ(value);
  }, [value]);

  useEffect(() => {
    if (lat != null) setLatStr(String(lat));
    if (lon != null) setLonStr(String(lon));
  }, [lat, lon]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const search = (text: string) => {
    setQ(text);
    setGeoError(null);
    // Only clear coords when the user edits away from the resolved place label
    if (text.trim() !== resolvedLabel.current.trim()) {
      onChange(text, null, null, null);
    } else {
      onChange(text, lat, lon, timezone ?? null);
    }
    if (timer.current) clearTimeout(timer.current);
    if (text.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.geocodeSuggest(text.trim());
        setResults(res.results);
        setOpen(true);
        if (res.results.length === 0) {
          setGeoError(null);
        }
      } catch {
        setResults([]);
        setOpen(true);
        setGeoError(
          firstRun
            ? t("chart.firstRun.cityNetwork")
            : "Couldn't reach the geocoder. Check that the API is up, then try again."
        );
      } finally {
        setLoading(false);
      }
    }, 280);
  };

  const pick = (place: GeoPlace) => {
    resolvedLabel.current = place.display_name;
    setQ(place.display_name);
    setLatStr(String(place.lat));
    setLonStr(String(place.lon));
    onChange(place.display_name, place.lat, place.lon, place.timezone ?? null);
    setGeoError(null);
    setOpen(false);
  };

  const applyManual = async () => {
    const la = Number(latStr);
    const lo = Number(lonStr);
    if (Number.isFinite(la) && Number.isFinite(lo) && la >= -90 && la <= 90 && lo >= -180 && lo <= 180) {
      const label = q.trim() || `${la}, ${lo}`;
      resolvedLabel.current = label;
      setGeoError(null);
      try {
        const place = await api.geocode(`${la}, ${lo}`);
        const nextLabel =
          firstRun && place.display_name && !looksLikeCoordinates(place.display_name)
            ? place.display_name
            : label;
        resolvedLabel.current = nextLabel;
        setQ(nextLabel);
        onChange(nextLabel, la, lo, place.timezone ?? null);
      } catch {
        onChange(label, la, lo, null);
      }
    } else {
      setGeoError("Enter valid latitude (−90…90) and longitude (−180…180).");
    }
  };

  const resolveNow = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setGeoError(null);
    try {
      const place = await api.geocode(q.trim());
      pick(place);
    } catch (e) {
      setOpen(true);
      setResults([]);
      const msg = e instanceof Error ? e.message : String(e);
      const looksNetwork =
        /can't reach|failed to fetch|network|geocoder/i.test(msg);
      setGeoError(
        looksNetwork
          ? msg
          : "No matches for that place. Try a fuller name, or enter lat/lon."
      );
    } finally {
      setLoading(false);
    }
  };

  const tzLabel = formatTimezoneLabel(timezone, birthDate, birthTime);
  const firstRunTz = shortTimezoneLabel(timezone, birthDate, birthTime);
  const firstRunPlace = shortPlaceLabel(q);
  const firstRunConfirm =
    firstRunPlace && firstRunTz
      ? `${firstRunPlace} · ${firstRunTz}`
      : firstRunPlace || firstRunTz || "";

  return (
    <div className={firstRun ? "relative z-20 space-y-2" : "relative z-20 space-y-2 md:col-span-2"} ref={boxRef}>
      <label className="block text-sm">
        <span className={`mb-1 block ${firstRun ? "text-fg" : "text-fg-muted"}`}>
          {firstRun ? t("chart.firstRun.cityLabel") : "Birth city / place"}
        </span>
        <div className="relative flex gap-2">
          <input
            className={`w-full rounded-lg border border-border bg-sunken px-3 py-2 disabled:cursor-wait disabled:opacity-60 ${
              firstRun ? "min-h-11" : ""
            }`}
            value={q}
            onChange={(e) => search(e.target.value)}
            onFocus={() => {
              if (results.length) setOpen(true);
            }}
            placeholder={
              firstRun
                ? t("chart.firstRun.cityPlaceholder")
                : disabled
                  ? "Loading…"
                  : "Type a city or place name"
            }
            autoComplete="off"
            disabled={disabled}
            aria-invalid={firstRun && Boolean(fieldError) ? true : undefined}
          />
          {/* Resolve only when unresolved and typing (not lat/lon mode) — hidden on first-run */}
          {!firstRun && !isResolved && !manual && (
            <button
              type="button"
              onClick={resolveNow}
              disabled={disabled || loading || !q.trim()}
              className="inline-flex min-h-10 shrink-0 items-center rounded-lg border border-border px-3 py-2.5 text-sm text-fg-muted hover:border-growth hover:text-fg disabled:opacity-50"
              title="Pin coordinates for typed city"
            >
              {loading ? "…" : "Resolve"}
            </button>
          )}
        </div>
      </label>

      {firstRun && fieldError && (
        <p className="type-caption text-danger" data-testid="first-run-city-error">
          {fieldError}
        </p>
      )}

      {geoError && (
        <p className="text-xs text-danger">{geoError}</p>
      )}

      {open && !disabled && (
        <ul className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-auto rounded-xl border border-border bg-sunken text-sm shadow-xl">
          {results.length === 0 && (
            <li className="px-3 py-2 text-fg-muted">
              {firstRun
                ? geoError
                  ? t("chart.firstRun.cityNetwork")
                  : t("chart.firstRun.cityUnresolved")
                : geoError
                  ? "Geocoder unavailable — try again or enter lat/lon."
                  : "No matches yet — try a fuller name or enter lat/lon."}
            </li>
          )}
          {results.map((r) => (
            <li key={`${r.display_name}-${r.lat}-${r.lon}`}>
              <button
                type="button"
                className="flex min-h-10 w-full items-start justify-between gap-2 px-3 py-2.5 text-left hover:bg-growth/15"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(r)}
              >
                <span>{r.display_name}</span>
                {!firstRun && (
                  <span className="shrink-0 text-[10px] uppercase text-fg-muted">
                    {r.source || (r.cached ? "cache" : "live")}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={disabled}
            className={
              firstRun
                ? "min-h-10 rounded-full px-1 py-2 type-caption text-fg-secondary underline-offset-2 hover:text-fg hover:underline disabled:cursor-wait disabled:opacity-50"
                : "min-h-10 rounded-full border border-dashed border-border px-3 py-2 text-xs text-fg-muted hover:text-fg-secondary disabled:cursor-wait disabled:opacity-50"
            }
            onClick={() => setManual((v) => !v)}
          >
            {firstRun
              ? manual
                ? t("chart.firstRun.coordsHide")
                : t("chart.firstRun.coordsToggle")
              : manual
                ? "Hide lat/lon"
                : "Enter lat/lon"}
          </button>
        </div>
      )}

      {manual && (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-sunken/80 p-3">
          <label className="text-xs">
            <span className="mb-1 block text-fg-muted">Latitude</span>
            <input
              className="w-28 rounded-lg border border-border bg-sunken px-2 py-2 disabled:opacity-60"
              value={latStr}
              onChange={(e) => setLatStr(e.target.value)}
              placeholder="22.3193"
              disabled={disabled}
            />
          </label>
          <label className="text-xs">
            <span className="mb-1 block text-fg-muted">Longitude</span>
            <input
              className="w-28 rounded-lg border border-border bg-sunken px-2 py-2 disabled:opacity-60"
              value={lonStr}
              onChange={(e) => setLonStr(e.target.value)}
              placeholder="114.1694"
              disabled={disabled}
            />
          </label>
          <button
            type="button"
            onClick={applyManual}
            disabled={disabled}
            className="min-h-10 rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-fg hover:border-growth disabled:opacity-50"
          >
            Use coordinates
          </button>
        </div>
      )}

      {firstRun ? (
        disabled ? null : isResolved && firstRunConfirm ? (
          <p className="type-caption text-fg" data-testid="first-run-city-confirm">
            {firstRunConfirm}
          </p>
        ) : q.trim() && !isResolved && !fieldError ? (
          <p className="type-caption text-fg" data-testid="first-run-city-unresolved">
            {t("chart.firstRun.cityUnresolved")}
          </p>
        ) : null
      ) : disabled ? (
        <p className="text-xs text-fg-muted">Waiting for saved chart…</p>
      ) : isResolved ? (
        <p className="text-xs text-growth">
          Resolved: {lat!.toFixed(4)}, {lon!.toFixed(4)}
          {tzLabel ? ` · ${tzLabel}` : ""} — ready to calculate
        </p>
      ) : q.trim() ? (
        <p className="text-xs text-energy-ink">
          Tip: pick a suggestion to pin coordinates. Calculate &amp; Save needs a city
          (or lat/lon).
        </p>
      ) : (
        <p className="text-xs text-fg-muted">
          Enter a birth city (or lat/lon) before Calculate &amp; Save.
        </p>
      )}
    </div>
  );
}
