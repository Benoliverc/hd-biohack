"use client";

import { useCallback, useEffect, useState } from "react";
import { api, SavedChartRow } from "@/lib/api";
import { useApp } from "@/lib/store";
import { CityPicker } from "@/components/CityPicker";
import { ChartDeepDive } from "@/components/ChartDeepDive";
import { BodyGraph } from "@/components/BodyGraph";
import { formatTimezoneLabel, toTimeInputValue } from "@/lib/timezone";
import {
  TYPE_COPY,
  TYPE_BATTERY,
  STRATEGY_COPY,
  AUTHORITY_PLAIN,
  AUTHORITY_COPY,
  centersToWatch,
  profilePlainLine,
  displayCenter,
} from "@/lib/hdCopy";

type Chart = Record<string, unknown>;
type BusyMode = "preview" | "save" | null;
type ViewMode = "saved" | "preview" | null;
type SaveAs = "self" | "friend";

type FormSnapshot = {
  birthDate: string;
  birthTime: string;
  birthCity: string;
  lat: number | null;
  lon: number | null;
};

function near(a: number | null, b: number | null, eps = 0.0001): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return Math.abs(a - b) < eps;
}

function snapshotsEqual(a: FormSnapshot, b: FormSnapshot): boolean {
  return (
    a.birthDate === b.birthDate &&
    toTimeInputValue(a.birthTime) === toTimeInputValue(b.birthTime) &&
    a.birthCity.trim() === b.birthCity.trim() &&
    near(a.lat, b.lat) &&
    near(a.lon, b.lon)
  );
}

const DEMO_BIRTH = {
  birthDate: "1948-04-09",
  birthTime: "00:05",
  birthCity: "Montreal, Canada",
  lat: 45.5017,
  lon: -73.5673,
  timezone: "America/Toronto",
} as const;

const MAX_PEOPLE = 10;

export default function ProfilePage() {
  const {
    user,
    usersLoading,
    usersError,
    ensureUser,
    refreshUsers,
    setNatalChart,
    natalChartId,
  } = useApp();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyMode, setBusyMode] = useState<BusyMode>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(null);
  const [savedForm, setSavedForm] = useState<FormSnapshot | null>(null);
  const [hydratedUserId, setHydratedUserId] = useState<number | null>(null);
  const [savedPeople, setSavedPeople] = useState<SavedChartRow[]>([]);
  const [friendName, setFriendName] = useState("");
  const [saveAs, setSaveAs] = useState<SaveAs>("self");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const formReady = Boolean(user && hydratedUserId === user.id);

  const refreshPeople = useCallback(async (userId: number) => {
    const rows = await api.charts(userId);
    setSavedPeople(rows);
    return rows;
  }, []);

  const applyRow = useCallback(
    (latest: SavedChartRow) => {
      const c = (latest.chart || {}) as Chart;
      const nextDate = latest.birth_date || "";
      const nextTime = toTimeInputValue(latest.birth_time) || "";
      const nextCity = latest.birth_city || "";
      const nextLat =
        typeof latest.lat === "number"
          ? latest.lat
          : typeof c.lat === "number"
            ? c.lat
            : null;
      const nextLon =
        typeof latest.lon === "number"
          ? latest.lon
          : typeof c.lon === "number"
            ? c.lon
            : null;
      const nextTz =
        (typeof latest.timezone === "string" && latest.timezone) ||
        (typeof c.timezone === "string" ? c.timezone : null);

      setBirthDate(nextDate);
      setBirthTime(nextTime);
      setBirthCity(nextCity);
      setLat(nextLat);
      setLon(nextLon);
      setTimezone(nextTz);
      setChart(c);
      setNatalChart({
        id: latest.id,
        label: latest.label || "Me",
        birth_city: nextCity,
        birth_date: nextDate,
        birth_time: latest.birth_time,
        timezone: nextTz,
      });
      setViewMode("saved");
      setSavedForm({
        birthDate: nextDate,
        birthTime: nextTime,
        birthCity: nextCity,
        lat: nextLat,
        lon: nextLon,
      });
      setSaveAs(latest.slot_kind === "friend" ? "friend" : "self");
      setFriendName(latest.slot_kind === "friend" ? latest.label || "" : "");
    },
    [setNatalChart]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setHydratedUserId(null);
        return;
      }
      if (hydratedUserId === user.id) return;

      setBirthDate("");
      setBirthTime("");
      setBirthCity("");
      setLat(null);
      setLon(null);
      setTimezone(null);
      setChart(null);
      setViewMode(null);
      setSavedForm(null);
      setError(null);
      setSavedPeople([]);

      try {
        const rows = await refreshPeople(user.id);
        if (cancelled) return;
        if (!rows.length) {
          setBirthDate(DEMO_BIRTH.birthDate);
          setBirthTime(DEMO_BIRTH.birthTime);
          setBirthCity(DEMO_BIRTH.birthCity);
          setLat(DEMO_BIRTH.lat);
          setLon(DEMO_BIRTH.lon);
          setTimezone(DEMO_BIRTH.timezone);
          setChart(null);
          setViewMode(null);
          setSavedForm(null);
          setHydratedUserId(user.id);
          return;
        }
        const preferred =
          natalChartId != null ? rows.find((r) => r.id === natalChartId) : null;
        applyRow(preferred || rows[0]);
        setHydratedUserId(user.id);
      } catch {
        if (!cancelled) setHydratedUserId(user.id);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per user
  }, [user, hydratedUserId, refreshPeople, applyRow]);

  const formNow: FormSnapshot = {
    birthDate,
    birthTime,
    birthCity,
    lat,
    lon,
  };

  const formDirtyVsSaved = Boolean(savedForm && !snapshotsEqual(formNow, savedForm));

  const onCityChange = (
    city: string,
    nextLat: number | null,
    nextLon: number | null,
    nextTz?: string | null
  ) => {
    setBirthCity(city);
    setLat(nextLat);
    setLon(nextLon);
    if (nextTz !== undefined) setTimezone(nextTz);
  };

  const submit = async (save: boolean, kind: SaveAs = saveAs) => {
    setBusyMode(save ? "save" : "preview");
    setError(null);
    try {
      if (!birthDate) throw new Error("Enter a birth date.");
      if (!birthTime) throw new Error("Enter a birth time.");
      let city = birthCity.trim();
      if (!city) throw new Error("Enter a birth city or lat/lon.");

      const activeUser = user ?? (await ensureUser());
      if (!activeUser?.id) throw new Error("No user account loaded — tap Retry user, then try again.");

      if (save && savedPeople.length >= MAX_PEOPLE) {
        throw new Error(
          `Chart limit reached (${MAX_PEOPLE}/10). Delete a saved person before adding another.`
        );
      }

      let useLat = lat;
      let useLon = lon;
      if (useLat == null || useLon == null) {
        const place = await api.geocode(city);
        city = place.display_name;
        useLat = place.lat;
        useLon = place.lon;
        setBirthCity(city);
        setLat(useLat);
        setLon(useLon);
        if (place.timezone) setTimezone(place.timezone);
      }

      const label =
        kind === "friend"
          ? friendName.trim() || "Friend"
          : friendName.trim() || "Me";

      const res = await api.calculateChart({
        birth_date: birthDate,
        birth_time: birthTime.length === 5 ? `${birthTime}:00` : birthTime,
        birth_city: city,
        user_id: activeUser.id,
        save,
        lat: useLat,
        lon: useLon,
        label: save ? label : undefined,
        slot_kind: save ? kind : undefined,
      });
      setChart(res.chart);
      const chartTz =
        typeof res.chart?.timezone === "string" ? (res.chart.timezone as string) : null;
      if (chartTz) setTimezone(chartTz);

      if (save) {
        if (res.natal_chart_id) {
          setNatalChart({
            id: res.natal_chart_id,
            label,
            birth_city: city,
            birth_date: birthDate,
            birth_time: birthTime.length === 5 ? `${birthTime}:00` : birthTime,
            timezone: chartTz || timezone,
          });
          setViewMode("saved");
          setSavedForm({
            birthDate,
            birthTime: toTimeInputValue(birthTime),
            birthCity: city,
            lat: useLat,
            lon: useLon,
          });
          await refreshPeople(activeUser.id);
        } else {
          setError("Chart calculated but save did not return an id. Try again.");
        }
      } else {
        setViewMode("preview");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyMode(null);
    }
  };

  const selectPerson = (row: SavedChartRow) => {
    applyRow(row);
    setError(null);
  };

  const deletePerson = async (row: SavedChartRow) => {
    if (!user) return;
    const ok = window.confirm(`Remove “${row.label || "chart"}” from saved people?`);
    if (!ok) return;
    setDeletingId(row.id);
    setError(null);
    try {
      await api.deleteChart(row.id, user.id);
      const rows = await refreshPeople(user.id);
      if (natalChartId === row.id) {
        if (rows[0]) applyRow(rows[0]);
        else {
          setChart(null);
          setNatalChart(null);
          setViewMode(null);
          setSavedForm(null);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeletingId(null);
    }
  };

  const personality = (chart?.personality as Array<Record<string, unknown>>) || [];
  const design = (chart?.design as Array<Record<string, unknown>>) || [];
  const defined = (chart?.defined_centers as string[]) || [];
  const undefinedCenters = (chart?.undefined_centers as string[]) || [];
  const channels =
    ((chart?.channels as Array<{ gates: number[]; name?: string; centers?: string[] }>) || []);
  const activatedGates = (chart?.activated_gates as number[]) || [];
  const hangingGates =
    (chart?.hanging_gates as Array<{ held?: number; missing?: number; channel?: string }>) || [];
  const watch = centersToWatch(undefinedCenters, 3);
  const typeKey = String(chart?.type || "");
  const profileStr = String(chart?.profile || "");
  const authorityStr = String(chart?.authority || "");
  const strategyStr = String(chart?.strategy || "");

  const busy = busyMode !== null;
  const tzBesideTime = formatTimezoneLabel(timezone, birthDate, birthTime);
  const atCap = savedPeople.length >= MAX_PEOPLE;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chart — your energy map</h1>
      <p className="text-sm text-fg-muted">
        Calculate a chart, see the bodygraph, and save up to {MAX_PEOPLE} people (you + friends).
        Plain language — how your battery and decisions work.
      </p>

      {(usersLoading || usersError || (!usersLoading && !user)) && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-energy/50 bg-energy/10 px-4 py-3 text-sm text-energy-ink">
          {usersLoading && <span>Loading account…</span>}
          {usersError && <span>Account load issue: {usersError}</span>}
          {!usersLoading && !user && <span>No Dev user selected yet.</span>}
          {(usersError || (!usersLoading && !user)) && (
            <button
              type="button"
              className="min-h-10 rounded-lg border border-energy-ink px-3 py-2.5 text-sm hover:bg-energy/15"
              onClick={() => refreshUsers()}
            >
              Retry user
            </button>
          )}
        </div>
      )}

      {/* Saved people */}
      {user && formReady && (
        <div className="rounded-2xl border border-border bg-elevated p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-fg">Saved people</h2>
            <span className="text-xs text-fg-muted">
              {savedPeople.length}/{MAX_PEOPLE}
            </span>
          </div>
          {savedPeople.length === 0 ? (
            <p className="text-sm text-fg-muted">None yet — calculate &amp; save below.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {savedPeople.map((row) => {
                const active = natalChartId === row.id && viewMode === "saved";
                return (
                  <li key={row.id} className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => selectPerson(row)}
                      className={`min-h-10 rounded-full border px-3 py-2 text-left text-xs transition ${
                        active
                          ? "border-growth bg-growth-soft text-growth-ink ring-2 ring-growth/30"
                          : "border-border bg-sunken text-fg hover:border-growth/50"
                      }`}
                    >
                      <span className="font-medium">{row.label || "Me"}</span>
                      <span className="text-fg-muted">
                        {" "}
                        · {row.type || "—"} · {row.profile || "—"}
                      </span>
                      <span className="block text-[10px] text-fg-muted">{row.birth_city}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${row.label || "chart"}`}
                      disabled={deletingId === row.id}
                      onClick={() => void deletePerson(row)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-sunken hover:text-danger disabled:opacity-50"
                    >
                      {deletingId === row.id ? "…" : "×"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {atCap && (
            <p className="mt-2 text-xs text-energy-ink">
              At the {MAX_PEOPLE}-person limit — delete someone to save another.
            </p>
          )}
        </div>
      )}

      {user && !formReady && (
        <div className="rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-fg-secondary">
          Loading saved chart…
        </div>
      )}

      <div className="relative z-0 grid gap-4 rounded-2xl border border-border bg-elevated p-5 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-fg-muted">Birth date</span>
          <input
            type="date"
            className="w-full rounded-lg border border-border bg-sunken px-3 py-2 disabled:cursor-wait disabled:opacity-60"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={!formReady || busy}
            required
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-fg-muted">
            Birth time{tzBesideTime ? " (local)" : ""}
          </span>
          <input
            type="time"
            step={60}
            className="w-full rounded-lg border border-border bg-sunken px-3 py-2 disabled:cursor-wait disabled:opacity-60"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            disabled={!formReady || busy}
            required
          />
          {tzBesideTime && (
            <span className="mt-1 block text-[11px] text-fg-muted">{tzBesideTime}</span>
          )}
          <span className="mt-1 block text-[11px] text-fg-muted">
            Approximate is OK if exact time unknown — chart authority may be less precise.
          </span>
        </label>
        <CityPicker
          value={birthCity}
          lat={lat}
          lon={lon}
          timezone={timezone}
          birthDate={birthDate}
          birthTime={birthTime}
          onChange={onCityChange}
          disabled={!formReady || busy}
        />

        <div className="md:col-span-4 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-fg-muted">Save as name</span>
              <input
                className="w-48 rounded-lg border border-border bg-sunken px-3 py-2"
                placeholder={saveAs === "friend" ? "Friend’s name" : "Me"}
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                disabled={!formReady || busy}
              />
            </label>
            <div className="flex gap-1 rounded-xl border border-border bg-sunken/80 p-1">
              <button
                type="button"
                disabled={!formReady || busy}
                onClick={() => setSaveAs("self")}
                className={`min-h-10 rounded-lg px-3 py-2 text-sm ${
                  saveAs === "self" ? "bg-growth/25 text-growth-ink" : "text-fg-muted"
                }`}
              >
                Save as me
              </button>
              <button
                type="button"
                disabled={!formReady || busy}
                onClick={() => setSaveAs("friend")}
                className={`min-h-10 rounded-lg px-3 py-2 text-sm ${
                  saveAs === "friend" ? "bg-growth/25 text-growth-ink" : "text-fg-muted"
                }`}
              >
                Save for a friend
              </button>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="calculate-save"
              disabled={busy || !formReady || atCap}
              onClick={() => void submit(true, saveAs)}
              className="min-h-10 rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep disabled:cursor-wait disabled:opacity-60"
            >
              {busyMode === "save"
                ? "Saving…"
                : saveAs === "friend"
                  ? "Calculate & save friend"
                  : "Calculate & Save"}
            </button>
            <button
              type="button"
              data-testid="preview-only"
              disabled={busy || !formReady}
              onClick={() => void submit(false)}
              className="min-h-10 px-1 py-2.5 text-sm text-fg-muted underline-offset-2 hover:text-fg hover:underline disabled:cursor-wait disabled:opacity-60"
              title="Try without saving"
            >
              {busyMode === "preview" ? "Working…" : "Preview only (don't save)"}
            </button>
            {user && (
              <span className="self-center text-xs text-fg-muted">as {user.display_name}</span>
            )}
            {viewMode === "preview" && chart && (
              <span className="self-center rounded-full border border-energy/50 bg-energy/10 px-2.5 py-1 text-xs text-energy-ink">
                Preview (not saved)
                {natalChartId ? ` · prior saved #${natalChartId}` : ""}
              </span>
            )}
            {viewMode === "saved" && natalChartId && (
              <span className="self-center text-xs text-growth">Saved chart #{natalChartId}</span>
            )}
          </div>
        </div>

        {formDirtyVsSaved && viewMode === "saved" && (
          <p className="md:col-span-4 rounded-lg border border-energy/40 bg-energy/10 px-3 py-2 text-xs text-energy-ink">
            Form no longer matches the saved chart — Preview or Calculate &amp; Save to update
            results.
          </p>
        )}
        {error && (
          <p className="md:col-span-4 whitespace-pre-wrap rounded-lg border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </div>

      {chart && (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div className="rounded-2xl border border-border bg-elevated p-4">
              <h2 className="mb-2 text-sm font-semibold text-fg">Bodygraph</h2>
              <BodyGraph
                definedCenters={defined}
                channels={channels}
                activatedGates={activatedGates}
                hangingGates={hangingGates}
                personalityGates={personality
                  .map((a) => Number(a.gate))
                  .filter((g) => Number.isFinite(g) && g > 0)}
                designGates={design
                  .map((a) => Number(a.gate))
                  .filter((g) => Number.isFinite(g) && g > 0)}
              />
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-growth/30 bg-growth-soft px-5 py-4">
                <p className="text-lg font-semibold text-growth-ink">
                  You&apos;re a {typeKey}
                  {TYPE_COPY[typeKey] ? ` — ${TYPE_COPY[typeKey].summary}` : ""}
                </p>
                <p className="mt-2 text-sm text-fg">
                  {TYPE_BATTERY[typeKey] ||
                    "This is your energy map — how your battery fills and how you decide."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-elevated p-4">
                  <div className="text-xs uppercase tracking-wide text-fg-muted">Profile</div>
                  <div className="mt-1 font-semibold text-growth">{profileStr}</div>
                  <p className="mt-2 text-sm leading-relaxed text-fg-secondary whitespace-pre-line">{profilePlainLine(profileStr)}</p>
                </div>
                <div className="rounded-xl border border-border bg-elevated p-4">
                  <div className="text-xs uppercase tracking-wide text-fg-muted">How you decide</div>
                  <div className="mt-1 font-semibold text-growth">{strategyStr}</div>
                  <p className="mt-2 text-sm text-fg-secondary">
                    {STRATEGY_COPY[strategyStr] || strategyStr}
                  </p>
                  <div className="mt-3 text-xs uppercase tracking-wide text-fg-muted">
                    Your body&apos;s yes
                  </div>
                  <div className="mt-1 font-semibold text-growth">{authorityStr}</div>
                  <p className="mt-2 text-sm text-fg-secondary">
                    {AUTHORITY_PLAIN[authorityStr] ||
                      AUTHORITY_COPY[authorityStr] ||
                      authorityStr}
                  </p>
                </div>
              </div>

              {watch.length > 0 && (
                <div className="rounded-xl border border-border bg-elevated p-4">
                  <h3 className="text-sm font-semibold text-fg">Centers to watch</h3>
                  <p className="mb-2 text-xs text-fg-muted">
                    Open centers — where you can pick up other people’s energy (energy leaks to notice).
                  </p>
                  <ul className="space-y-2">
                    {watch.map((w) => (
                      <li key={w.center} className="text-sm text-fg-secondary">
                        <span className="font-medium text-fg">{displayCenter(w.center)}</span>
                        {" — "}
                        {w.tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Type", chart.type],
                  ["Profile", chart.profile],
                  ["Authority", chart.authority],
                  ["Strategy", chart.strategy],
                  ["Definition", chart.definition],
                ].map(([k, v]) => (
                  <div key={String(k)} className="rounded-xl border border-border bg-elevated p-4">
                    <div className="text-xs uppercase tracking-wide text-fg-muted">{String(k)}</div>
                    <div className="mt-1 font-semibold text-growth">{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ChartDeepDive chart={chart} />

          <div className="grid gap-4 md:grid-cols-2">
            <ActivationTable title="Personality (Black)" rows={personality} />
            <ActivationTable title="Design (Red)" rows={design} />
          </div>
        </>
      )}
    </div>
  );
}

function ActivationTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
}) {
  return (
    <div className="overflow-x-auto overflow-hidden rounded-2xl border border-border">
      <div className="border-b border-border bg-elevated px-4 py-2 text-sm font-semibold">{title}</div>
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-fg-muted">
          <tr>
            <th className="px-4 py-2">Planet</th>
            <th className="px-4 py-2">Gate.Line</th>
            <th className="px-4 py-2">Lon°</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.planet)} className="border-t border-border">
              <td className="px-4 py-1.5">{String(r.planet)}</td>
              <td className="px-4 py-1.5 text-growth">{String(r.label)}</td>
              <td className="px-4 py-1.5 text-fg-muted">{Number(r.longitude).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
