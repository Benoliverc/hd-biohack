"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, SavedChartRow } from "@/lib/api";
import { useApp } from "@/lib/store";
import { CityPicker } from "@/components/CityPicker";
import { ChartDeepDive, type DeepDiveDomain } from "@/components/ChartDeepDive";
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

const SECTION_NAV: {
  id: string;
  label: string;
  shortLabel?: string;
}[] = [
  { id: "people-form", label: "People & form", shortLabel: "People" },
  { id: "bodygraph", label: "Bodygraph", shortLabel: "Body" },
  { id: "snapshot", label: "Snapshot", shortLabel: "Snap" },
  { id: "deep-dive", label: "Deep dive", shortLabel: "Deep" },
];

const DEEP_SECTION_IDS = new Set([
  "deep-dive",
  "core",
  "centers",
  "channels",
  "activations",
  "planets",
]);

function domainFromHash(hash: string): DeepDiveDomain | null {
  const h = hash.replace(/^#/, "");
  if (h === "core") return "core";
  if (h === "centers") return "centers";
  if (h === "channels") return "channels";
  if (h === "activations" || h === "planets") return "planets";
  return null;
}

/** True once Header + ChartSectionNav have published measured heights via inline CSS vars. */
function chartScrollMtMeasured(): boolean {
  const root = document.documentElement.style;
  return Boolean(root.getPropertyValue("--app-header-h").trim() && root.getPropertyValue("--chart-section-nav-h").trim());
}

function waitTwoFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/** Wait until sticky stack heights are published and stable (avoids hash scroll race). */
async function waitForChartScrollMt(timeoutMs = 2500): Promise<void> {
  const start = performance.now();
  let lastNav = "";
  let stable = 0;
  while (performance.now() - start < timeoutMs) {
    const nav = document.documentElement.style.getPropertyValue("--chart-section-nav-h").trim();
    if (chartScrollMtMeasured()) {
      if (nav === lastNav && nav) stable += 1;
      else {
        lastNav = nav;
        stable = 0;
      }
      if (stable >= 2) {
        await waitTwoFrames();
        return;
      }
    }
    await waitTwoFrames();
  }
}

async function scrollChartSectionIntoView(
  targetId: string,
  behavior: ScrollBehavior = "smooth",
  opts?: { correctAfterSettle?: boolean; signal?: { cancelled: boolean } }
): Promise<void> {
  const alive = () => !opts?.signal?.cancelled;
  try {
    if (document.fonts?.ready) await document.fonts.ready;
  } catch {
    /* ignore */
  }
  if (!alive()) return;
  await waitForChartScrollMt();
  if (!alive()) return;
  await waitTwoFrames();
  if (!alive()) return;
  const go = (b: ScrollBehavior) => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: b, block: "start" });
  };
  // Hash path: auto-only. Smooth + later auto-correct races (smooth finishes last, undershoots).
  if (opts?.correctAfterSettle) {
    go("auto");
    await new Promise((r) => window.setTimeout(r, 100));
    if (!alive()) return;
    await waitForChartScrollMt(800);
    if (!alive()) return;
    await waitTwoFrames();
    if (!alive()) return;
    go("auto");
    await new Promise((r) => window.setTimeout(r, 200));
    if (!alive()) return;
    go("auto");
    return;
  }
  go(behavior);
}

function ChartSectionNav({
  onJump,
}: {
  onJump: (id: string, domain?: DeepDiveDomain) => void;
}) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const publish = () => {
      document.documentElement.style.setProperty(
        "--chart-section-nav-h",
        `${el.getBoundingClientRect().height}px`
      );
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener("resize", publish);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", publish);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Chart sections"
      className="sticky z-30 -mx-1 overflow-x-clip rounded-xl border border-border bg-canvas/95 px-1.5 py-1.5 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-canvas/80 sm:px-2 sm:py-2"
      style={{ top: "var(--app-header-h)" }}
    >
      <ul className="flex w-full min-w-0 flex-nowrap gap-0.5 sm:w-max sm:gap-1">
        {SECTION_NAV.map((item) => (
          <li key={item.id} className="min-w-0 flex-1 sm:flex-none sm:shrink-0">
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                onJump(item.id);
              }}
              className="inline-flex h-9 w-full min-w-0 items-center justify-center rounded-full border border-transparent px-2 py-1.5 text-xs text-fg-muted transition hover:border-border hover:bg-sunken hover:text-fg focus-visible:relative sm:w-auto sm:px-3 sm:text-sm"
            >
              {item.shortLabel ? (
                <>
                  <span className="truncate sm:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </>
              ) : (
                item.label
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function ProfilePage() {
  const {
    user,
    usersLoading,
    usersError,
    ensureUser,
    refreshUsers,
    setNatalChart,
    natalChartId,
    natalBindingLoading,
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
  /** Local selection used for upsert — independent of store race/clear. */
  const [editingChartId, setEditingChartId] = useState<number | null>(null);
  const [friendName, setFriendName] = useState("");
  const [saveAs, setSaveAs] = useState<SaveAs>("self");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [personEditorOpen, setPersonEditorOpen] = useState(true);
  const [deepDiveDomain, setDeepDiveDomain] = useState<DeepDiveDomain>("core");
  const hadChartRef = useRef(false);
  const peopleFetchGen = useRef(0);

  const formReady = Boolean(user && hydratedUserId === user.id && !natalBindingLoading);

  const refreshPeople = useCallback(async (userId: number) => {
    const rows = await api.charts(userId);
    setSavedPeople(rows);
    return rows;
  }, []);

  const applyDemoBirth = useCallback(() => {
    setBirthDate(DEMO_BIRTH.birthDate);
    setBirthTime(DEMO_BIRTH.birthTime);
    setBirthCity(DEMO_BIRTH.birthCity);
    setLat(DEMO_BIRTH.lat);
    setLon(DEMO_BIRTH.lon);
    setTimezone(DEMO_BIRTH.timezone);
    setChart(null);
    setViewMode(null);
    setSavedForm(null);
    setEditingChartId(null);
  }, []);

  const applyRow = useCallback(
    (latest: SavedChartRow, opts?: { bindStore?: boolean }) => {
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
      const kind: SaveAs = latest.slot_kind === "friend" ? "friend" : "self";
      const bindStore = opts?.bindStore ?? true;

      setBirthDate(nextDate);
      setBirthTime(nextTime);
      setBirthCity(nextCity);
      setLat(nextLat);
      setLon(nextLon);
      setTimezone(nextTz);
      setChart(c);
      setEditingChartId(latest.id);
      if (bindStore) {
        setNatalChart({
          id: latest.id,
          label: latest.label || "Me",
          birth_city: nextCity,
          birth_date: nextDate,
          birth_time: latest.birth_time,
          timezone: nextTz,
        });
      }
      setViewMode("saved");
      setSavedForm({
        birthDate: nextDate,
        birthTime: nextTime,
        birthCity: nextCity,
        lat: nextLat,
        lon: nextLon,
      });
      setSaveAs(kind);
      setFriendName(latest.label || (kind === "friend" ? "" : "Me"));
    },
    [setNatalChart]
  );

  const pickPreferredRow = useCallback(
    (rows: SavedChartRow[], preferId: number | null) => {
      if (preferId != null) {
        const match = rows.find((r) => r.id === preferId);
        if (match) return match;
      }
      return rows[0] ?? null;
    },
    []
  );

  // Hydrate form + people list once store natal bind has settled for this user.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setHydratedUserId(null);
        setEditingChartId(null);
        return;
      }
      // Wait so we do not lock in DEMO/empty while /charts is still in flight in the store.
      if (natalBindingLoading) return;
      if (hydratedUserId === user.id) return;

      const gen = ++peopleFetchGen.current;
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
      setEditingChartId(null);

      try {
        const rows = await refreshPeople(user.id);
        if (cancelled || peopleFetchGen.current !== gen) return;
        if (!rows.length) {
          applyDemoBirth();
          setHydratedUserId(user.id);
          return;
        }
        const preferred = pickPreferredRow(rows, natalChartId);
        if (preferred) applyRow(preferred);
        setHydratedUserId(user.id);
      } catch {
        if (!cancelled && peopleFetchGen.current === gen) {
          setHydratedUserId(user.id);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per user after natal bind
  }, [
    user,
    hydratedUserId,
    natalBindingLoading,
    refreshPeople,
    applyRow,
    applyDemoBirth,
    pickPreferredRow,
  ]);

  const hasNatalInList =
    natalChartId != null && savedPeople.some((r) => r.id === natalChartId);
  const resyncAttemptRef = useRef<string | null>(null);

  // If store bound a natal the people list missed (stale empty hydrate), pull once.
  useEffect(() => {
    if (!user) {
      resyncAttemptRef.current = null;
      return;
    }
    if (!formReady || natalBindingLoading || natalChartId == null) return;
    if (hasNatalInList) {
      resyncAttemptRef.current = null;
      return;
    }
    const token = `${user.id}:${natalChartId}`;
    if (resyncAttemptRef.current === token) return;
    resyncAttemptRef.current = token;

    let cancelled = false;
    const gen = ++peopleFetchGen.current;
    (async () => {
      try {
        const rows = await refreshPeople(user.id);
        if (cancelled || peopleFetchGen.current !== gen) return;
        if (!rows.length) return;
        const preferred = pickPreferredRow(rows, natalChartId);
        // Only auto-apply when we had no saved selection yet (DEMO / empty).
        if (preferred && editingChartId == null) applyRow(preferred);
      } catch {
        /* keep current UI */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    user,
    formReady,
    natalBindingLoading,
    natalChartId,
    hasNatalInList,
    editingChartId,
    refreshPeople,
    applyRow,
    pickPreferredRow,
  ]);

  const refreshPeopleOnOpen = useCallback(async () => {
    if (!user) return;
    try {
      const rows = await refreshPeople(user.id);
      if (!rows.length) return;
      // Recover from a stale empty/DEMO hydrate without clobbering an in-progress edit.
      if (editingChartId == null || !rows.some((r) => r.id === editingChartId)) {
        const preferred = pickPreferredRow(rows, natalChartId ?? editingChartId);
        if (preferred && (editingChartId == null || viewMode !== "saved")) {
          applyRow(preferred);
        }
      }
    } catch {
      /* keep current UI */
    }
  }, [
    user,
    refreshPeople,
    editingChartId,
    natalChartId,
    viewMode,
    pickPreferredRow,
    applyRow,
  ]);

  // Reading mode: collapse birth tooling once a chart first appears; reopen if cleared.
  useEffect(() => {
    if (chart && !hadChartRef.current) {
      setPersonEditorOpen(false);
    }
    if (!chart) {
      setPersonEditorOpen(true);
    }
    hadChartRef.current = Boolean(chart);
  }, [chart]);

  const formNow: FormSnapshot = {
    birthDate,
    birthTime,
    birthCity,
    lat,
    lon,
  };

  const formDirtyVsSaved = Boolean(savedForm && !snapshotsEqual(formNow, savedForm));

  // Surface the editor when something needs attention.
  useEffect(() => {
    if (error || formDirtyVsSaved) setPersonEditorOpen(true);
  }, [error, formDirtyVsSaved]);

  useEffect(() => {
    const apply = () => {
      const fromHash = domainFromHash(window.location.hash);
      if (fromHash) setDeepDiveDomain(fromHash);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  // Avoid bfcache restoring a mid-page scroll before sticky heights exist.
  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in history)) return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  // After chart hydrates, honor deep-link hash once sticky stack heights are measured.
  // Always scroll to #deep-dive for domain hashes (legacy #centers stubs can native-scroll early).
  useEffect(() => {
    if (!chart) return;
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;
    const fromHash = domainFromHash(raw);
    if (fromHash) setDeepDiveDomain(fromHash);
    const targetId = DEEP_SECTION_IDS.has(raw) ? "deep-dive" : raw;
    let cancelled = false;
    void (async () => {
      await waitTwoFrames();
      if (cancelled) return;
      await scrollChartSectionIntoView(targetId, "auto", {
        correctAfterSettle: true,
        signal: { get cancelled() { return cancelled; } },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [chart]);

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

  const selectedSavedRow =
    editingChartId != null
      ? savedPeople.find((r) => r.id === editingChartId) ?? null
      : null;
  const isNewPersonUi = editingChartId == null || viewMode !== "saved";
  const frozenSlot: SaveAs =
    selectedSavedRow?.slot_kind === "friend" ? "friend" : "self";
  const hasSelfSaved = savedPeople.some((r) => r.slot_kind === "self");

  const startNewPerson = () => {
    setEditingChartId(null);
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
    setFriendName("");
    setSaveAs(hasSelfSaved ? "friend" : "self");
    setPersonEditorOpen(true);
  };

  const mapSaveError = (raw: string): string => {
    const lower = raw.toLowerCase();
    if (lower.includes("chart not found") || lower.includes("was deleted")) {
      return "That person was deleted — pick someone else or add new.";
    }
    return raw;
  };

  /** saveIntent: update = overwrite selected; create = always insert; preview = calc only. */
  const submit = async (
    saveIntent: "update" | "create" | "preview",
    kindOverride?: SaveAs
  ) => {
    const save = saveIntent !== "preview";
    setBusyMode(save ? "save" : "preview");
    setError(null);
    try {
      if (!birthDate) throw new Error("Enter a birth date.");
      if (!birthTime) throw new Error("Enter a birth time.");
      let city = birthCity.trim();
      if (!city) throw new Error("Enter a birth city or lat/lon.");

      const activeUser = user ?? (await ensureUser());
      if (!activeUser?.id) throw new Error("No user account loaded — tap Retry user, then try again.");

      if (saveIntent === "update") {
        if (editingChartId == null || !selectedSavedRow) {
          throw new Error("Pick a saved person to update, or add a new person.");
        }
      }

      // Cap only blocks *new* people. Updating a selected saved chart is always allowed.
      if (saveIntent === "create" && savedPeople.length >= MAX_PEOPLE) {
        throw new Error(
          `At the ${MAX_PEOPLE}-person limit — delete someone to add a new person. You can still update the selected person.`
        );
      }

      const kind: SaveAs =
        saveIntent === "update"
          ? frozenSlot
          : saveIntent === "create"
            ? (kindOverride ?? saveAs)
            : (kindOverride ?? saveAs);

      if (save && kind === "friend" && !friendName.trim()) {
        throw new Error("Enter a name for this friend.");
      }

      if (saveIntent === "update" && selectedSavedRow) {
        const name = selectedSavedRow.label || (frozenSlot === "self" ? "Me" : "Friend");
        const ok = window.confirm(
          `Replace the saved chart for “${name}” with these birth details?`
        );
        if (!ok) return;
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
          ? friendName.trim()
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
        // create never sends natal_chart_id even if a stale id exists
        natal_chart_id:
          saveIntent === "update" ? editingChartId ?? undefined : undefined,
      });
      setChart(res.chart);
      const chartTz =
        typeof res.chart?.timezone === "string" ? (res.chart.timezone as string) : null;
      if (chartTz) setTimezone(chartTz);

      if (save) {
        if (!res.natal_chart_id) {
          setError("Chart calculated but save did not return an id. Try again.");
          return;
        }
        const birthTimeFull = birthTime.length === 5 ? `${birthTime}:00` : birthTime;
        const rows = await refreshPeople(activeUser.id);
        const createdOrUpdated = rows.find((r) => r.id === res.natal_chart_id) ?? null;

        if (saveIntent === "update") {
          setEditingChartId(res.natal_chart_id);
          setViewMode("saved");
          setSavedForm({
            birthDate,
            birthTime: toTimeInputValue(birthTime),
            birthCity: city,
            lat: useLat,
            lon: useLon,
          });
          setSaveAs(kind);
          setFriendName(label);
          if (natalChartId != null && res.natal_chart_id === natalChartId) {
            setNatalChart({
              id: res.natal_chart_id,
              label,
              birth_city: city,
              birth_date: birthDate,
              birth_time: birthTimeFull,
              timezone: chartTz || timezone,
            });
          }
        } else {
          // create: select new row; bind store Me only when saving self with no prior self / unbound
          const bindStore =
            kind === "self" && (!hasSelfSaved || natalChartId == null);
          if (createdOrUpdated) {
            applyRow(createdOrUpdated, { bindStore });
          } else {
            setEditingChartId(res.natal_chart_id);
            setViewMode("saved");
            setSavedForm({
              birthDate,
              birthTime: toTimeInputValue(birthTime),
              birthCity: city,
              lat: useLat,
              lon: useLon,
            });
            setSaveAs(kind);
            setFriendName(label);
            if (bindStore) {
              setNatalChart({
                id: res.natal_chart_id,
                label,
                birth_city: city,
                birth_date: birthDate,
                birth_time: birthTimeFull,
                timezone: chartTz || timezone,
              });
            }
          }
        }
      } else {
        setViewMode("preview");
      }
    } catch (e) {
      setError(mapSaveError(e instanceof Error ? e.message : String(e)));
    } finally {
      setBusyMode(null);
    }
  };

  const selectPerson = (row: SavedChartRow) => {
    // Chart edit target is local; keep Today’s Me unless selecting self or nothing bound yet.
    const bindStore = row.slot_kind !== "friend" || natalChartId == null;
    applyRow(row, { bindStore });
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
      if (editingChartId === row.id || natalChartId === row.id) {
        if (rows[0]) applyRow(rows[0]);
        else {
          setChart(null);
          setNatalChart(null);
          setViewMode(null);
          setSavedForm(null);
          setEditingChartId(null);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeletingId(null);
    }
  };

  const jumpToSection = (id: string, domain?: DeepDiveDomain) => {
    if (domain) setDeepDiveDomain(domain);
    const url = `${window.location.pathname}${window.location.search}#${id}`;
    window.history.replaceState(null, "", url);
    const targetId = DEEP_SECTION_IDS.has(id) ? "deep-dive" : id;
    void scrollChartSectionIntoView(targetId, "smooth");
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

  const activePersonLabel =
    selectedSavedRow?.label ||
    friendName.trim() ||
    (viewMode === "preview" ? "Preview" : isNewPersonUi ? "New person" : "Me");

  const updatingExistingUi = !isNewPersonUi && selectedSavedRow != null;

  const editingBanner = (() => {
    if (updatingExistingUi && selectedSavedRow) {
      const name = selectedSavedRow.label || (frozenSlot === "self" ? "Me" : "Friend");
      if (frozenSlot === "self") {
        return <>Editing <span className="font-medium text-fg">“{name}”</span> (chart #{selectedSavedRow.id})</>;
      }
      return <>Editing <span className="font-medium text-fg">“{name}”</span> (friend · chart #{selectedSavedRow.id})</>;
    }
    return <>New person (not saved yet)</>;
  })();

  const peopleAndForm = (
    <>
      {user && formReady && (
        <div className="rounded-2xl border border-border bg-elevated p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-fg">Saved people</h2>
            <span className="text-xs text-fg-muted">
              {savedPeople.length}/{MAX_PEOPLE}
            </span>
          </div>
          {savedPeople.length === 0 ? (
            <p className="text-sm text-fg-muted">None yet — add your chart or a friend’s below.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {savedPeople.map((row) => {
                const active = editingChartId === row.id && viewMode === "saved";
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
                      <span className="mt-0.5 block text-[10px] leading-snug text-fg-muted">
                        {[row.birth_city, row.birth_date].filter(Boolean).join(" · ") || "—"}
                        {row.slot_kind === "friend" ? " · friend" : ""}
                      </span>
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="add-new-person"
              disabled={busy}
              onClick={startNewPerson}
              className="min-h-10 rounded-full border border-border bg-sunken px-3 py-2 text-xs font-medium text-fg hover:border-growth/50 disabled:opacity-60"
            >
              Add new person
            </button>
            <p className="text-xs text-fg-secondary" data-testid="editing-banner">
              {editingBanner}
            </p>
          </div>
          {atCap && (
            <p className="mt-2 text-xs text-energy-ink">
              At the {MAX_PEOPLE}-person limit — delete someone to add a new person. You can still
              update the selected person.
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
              <span className="mb-1 block text-fg-muted">
                {updatingExistingUi
                  ? frozenSlot === "friend"
                    ? "Name"
                    : "Display name"
                  : saveAs === "friend"
                    ? "Friend’s name"
                    : "Display name"}
              </span>
              <input
                className="w-48 rounded-lg border border-border bg-sunken px-3 py-2"
                placeholder={
                  updatingExistingUi
                    ? frozenSlot === "friend"
                      ? "Friend’s name"
                      : "Me"
                    : saveAs === "friend"
                      ? "Friend’s name"
                      : "Me"
                }
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                disabled={!formReady || busy}
              />
            </label>
            {updatingExistingUi ? (
              <span className="mb-2 inline-flex min-h-10 items-center rounded-lg border border-border bg-sunken/80 px-3 py-2 text-sm text-fg-muted">
                Role: {frozenSlot === "self" ? "Me" : "Friend"} (fixed)
              </span>
            ) : (
              <div className="flex gap-1 rounded-xl border border-border bg-sunken/80 p-1">
                <button
                  type="button"
                  disabled={!formReady || busy}
                  onClick={() => setSaveAs("self")}
                  className={`min-h-10 rounded-lg px-3 py-2 text-sm ${
                    saveAs === "self" ? "bg-growth/25 text-growth-ink" : "text-fg-muted"
                  }`}
                >
                  Me
                </button>
                <button
                  type="button"
                  disabled={!formReady || busy}
                  onClick={() => setSaveAs("friend")}
                  className={`min-h-10 rounded-lg px-3 py-2 text-sm ${
                    saveAs === "friend" ? "bg-growth/25 text-growth-ink" : "text-fg-muted"
                  }`}
                >
                  Friend
                </button>
              </div>
            )}
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            {updatingExistingUi ? (
              <>
                <button
                  type="button"
                  data-testid="calculate-save"
                  disabled={busy || !formReady}
                  onClick={() => void submit("update")}
                  className="min-h-10 rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep disabled:cursor-wait disabled:opacity-60"
                >
                  {busyMode === "save"
                    ? "Saving…"
                    : `Update “${selectedSavedRow?.label || (frozenSlot === "self" ? "Me" : "Friend")}”`}
                </button>
                <button
                  type="button"
                  data-testid="save-as-new-friend"
                  disabled={busy || !formReady || atCap}
                  onClick={() => void submit("create", "friend")}
                  className="min-h-10 rounded-xl border border-border bg-sunken px-4 py-2.5 text-sm font-medium text-fg hover:border-growth/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save as new friend
                </button>
              </>
            ) : (
              <button
                type="button"
                data-testid="calculate-save"
                disabled={busy || !formReady || atCap}
                onClick={() => void submit("create", saveAs)}
                className="min-h-10 rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep disabled:cursor-wait disabled:opacity-60"
              >
                {busyMode === "save" ? "Saving…" : "Calculate & save"}
              </button>
            )}
            <button
              type="button"
              data-testid="preview-only"
              disabled={busy || !formReady}
              onClick={() => void submit("preview")}
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
            {viewMode === "saved" && editingChartId && (
              <span className="self-center text-xs text-growth">Saved chart #{editingChartId}</span>
            )}
          </div>
        </div>

        {formDirtyVsSaved && viewMode === "saved" && (
          <p className="md:col-span-4 rounded-lg border border-energy/40 bg-energy/10 px-3 py-2 text-xs text-energy-ink">
            Form no longer matches the saved chart — Preview or Update to refresh results. Use Save
            as new friend to add someone else without overwriting.
          </p>
        )}
        {error && (
          <p className="md:col-span-4 whitespace-pre-wrap rounded-lg border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </>
  );

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

      <div id="people-form" className="space-y-4">
        {chart ? (
          <details
            className="group rounded-2xl border border-border bg-elevated open:bg-elevated"
            open={personEditorOpen}
            onToggle={(e) => {
              const open = (e.target as HTMLDetailsElement).open;
              setPersonEditorOpen(open);
              if (open) void refreshPeopleOnOpen();
            }}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-fg">Edit / switch person</div>
                <div className="mt-0.5 truncate text-xs text-fg-muted">
                  {activePersonLabel}
                  {typeKey ? ` · ${typeKey}` : ""}
                  {profileStr ? ` · ${profileStr}` : ""}
                  {viewMode === "preview" ? " · preview" : ""}
                </div>
              </div>
              <span className="shrink-0 text-xs text-fg-muted group-open:hidden">Show</span>
              <span className="hidden shrink-0 text-xs text-fg-muted group-open:inline">Hide</span>
            </summary>
            <div className="space-y-4 border-t border-border px-4 py-4">{peopleAndForm}</div>
          </details>
        ) : (
          peopleAndForm
        )}
      </div>

      {chart && (
        <>
          <ChartSectionNav onJump={jumpToSection} />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div
              id="bodygraph"
              className="rounded-2xl border border-border bg-elevated p-4"
            >
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

            <div id="snapshot" className="space-y-4">
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

          <ChartDeepDive
            chart={chart}
            personality={personality}
            design={design}
            domain={deepDiveDomain}
            onDomainChange={setDeepDiveDomain}
          />
        </>
      )}
    </div>
  );
}
