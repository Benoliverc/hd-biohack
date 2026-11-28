"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, SavedChartRow } from "@/lib/api";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { CityPicker } from "@/components/CityPicker";
import { FirstRunChartForm, type FirstRunBirth } from "@/components/FirstRunChartForm";
import { SnapshotProfileBody } from "@/components/SnapshotProfileBody";
import { profilePresentation } from "@/lib/profilePresentation";
import { ChartDeepDive, type DeepDiveDomain } from "@/components/ChartDeepDive";
import { ChartBodygraph } from "@/components/ChartBodygraph";
import "./chart-field-notes.css";
import { ChartTypeBox } from "@/components/ChartTypeBox";
import { ChartDisclosure, SnapshotExclusiveGroup } from "@/components/ChartDisclosure";
import { ReadMoreInDeepDive, type DeepDiveRowId } from "@/components/ReadMoreInDeepDive";
import {
  SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR,
  SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR_OTHER,
  needsEmotionalRespondConnector,
  snapshotDefinitionCopy,
  snapshotDefinitionOtherCopy,
  snapshotStrategyCopy,
  snapshotStrategyOtherCopy,
} from "@/lib/essays/snapshotShortCopy";
import {
  snapshotAuthorityOtherPlain,
  snapshotCenterOtherTip,
  snapshotCentersOtherHelp,
} from "@/lib/essays/snapshotOtherPersonCopy";
import { snapshotProfileLine } from "@/lib/essays/snapshotProfileVoice";
import {
  SNAPSHOT_ENVIRONMENT_APPROX_CAVEAT,
  isEnvironmentName,
  snapshotEnvironmentCopy,
  snapshotEnvironmentValue,
} from "@/lib/essays/snapshotEnvironmentCopy";
import { ShareBaselineButton } from "@/components/share/ShareBaselineButton";
import { graphFromChart } from "@/lib/share/graphFromChart";
import LiteracyCoach from "@/components/LiteracyCoach";
import {
  ChartAccountSkeleton,
  ChartFormSkeleton,
  ChartSkeleton,
} from "@/components/PageSkeleton";
import { formatTimezoneLabel, toTimeInputValue } from "@/lib/timezone";
import { displayCenter, type CenterKey } from "@/lib/hdCopy";
import { useHdCopy } from "@/lib/essays/resolveHdCopy";
import { youChipLabel } from "@/lib/youChipLabel";
import { chartVoiceName } from "@/lib/chartVoice";
import { writeChartTypeOpenIfNull } from "@/lib/chartTypeOpen";

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
  timeUnknown: boolean;
};

const UNKNOWN_BIRTH_TIME = "12:00:00";

function effectiveBirthTime(birthTime: string, timeUnknown: boolean): string {
  if (timeUnknown) return UNKNOWN_BIRTH_TIME;
  return birthTime.length === 5 ? `${birthTime}:00` : birthTime;
}

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
    near(a.lon, b.lon) &&
    a.timeUnknown === b.timeUnknown
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

function isSelfRow(row: SavedChartRow): boolean {
  return row.slot_kind !== "friend";
}

/** People never fall back to "Me" — empty labels become the localized Person word. */
function friendChipLabel(row: SavedChartRow, personFallback: string): string {
  const label = (row.label || "").trim();
  if (!label || label.toLowerCase() === "me") return personFallback;
  return label;
}

const SECTION_NAV: {
  id: string;
  labelKey: MessageKey;
  shortLabelKey?: MessageKey;
}[] = [
  { id: "people-form", labelKey: "chart.people.sectionsPeopleForm", shortLabelKey: "chart.people.peopleLabel" },
  { id: "bodygraph", labelKey: "chart.people.bodygraph", shortLabelKey: "chart.people.bodyShort" },
  { id: "snapshot", labelKey: "chart.people.snapshot", shortLabelKey: "chart.people.snapShort" },
  { id: "deep-dive", labelKey: "chart.people.deepDive", shortLabelKey: "chart.people.deepShort" },
];

const DEEP_SECTION_IDS = new Set([
  "deep-dive",
  "core",
  "centers",
  "channels",
  "activations",
  "planets",
]);

/** Core row hashes. Not domain aliases: each opens that row, not just the section. */
const DEEP_DIVE_ROW_IDS = new Set<DeepDiveRowId>([
  "deep-dive-type",
  "deep-dive-profile",
  "deep-dive-strategy",
  "deep-dive-definition",
]);

function isDeepDiveRowId(id: string): id is DeepDiveRowId {
  return DEEP_DIVE_ROW_IDS.has(id as DeepDiveRowId);
}

function motionScrollBehavior(): ScrollBehavior {
  if (typeof window.matchMedia !== "function") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

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
  const { t } = useI18n();
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
      aria-label={t("chart.people.chartSections")}
      className="sticky z-30 -mx-1 overflow-x-clip rounded-xl border border-border bg-canvas/95 px-1.5 py-1 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-canvas/80 sm:px-2"
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
              className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-full border border-transparent px-2 py-1.5 text-xs text-fg-secondary transition hover:border-border hover:bg-sunken hover:text-fg focus-visible:relative sm:w-auto sm:px-3 sm:text-sm"
            >
              {item.shortLabelKey ? (
                <>
                  <span className="truncate sm:hidden">{t(item.shortLabelKey)}</span>
                  <span className="hidden sm:inline">{t(item.labelKey)}</span>
                </>
              ) : (
                t(item.labelKey)
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const CENTER_BY_SLUG = {
  head: "Head",
  ajna: "Ajna",
  throat: "Throat",
  g: "G",
  heart: "Heart",
  solar_plexus: "Solar_Plexus",
  sacral: "Sacral",
  spleen: "Spleen",
  root: "Root",
} as const satisfies Record<string, CenterKey>;

function centerKeyFromSlug(slug: string | null): CenterKey | null {
  if (!slug || !Object.prototype.hasOwnProperty.call(CENTER_BY_SLUG, slug)) return null;
  return CENTER_BY_SLUG[slug as keyof typeof CENTER_BY_SLUG];
}

function isCenterKey(value: string | null): value is CenterKey {
  return value != null && (Object.values(CENTER_BY_SLUG) as string[]).includes(value);
}

function slugFromCenterKey(key: CenterKey): string {
  const pair = (Object.entries(CENTER_BY_SLUG) as [string, CenterKey][]).find(([, center]) => center === key);
  return pair?.[0] ?? "head";
}

function replaceCenterParam(slug: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set("center", slug);
  else url.searchParams.delete("center");
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) window.history.replaceState(null, "", next);
}

function ProfilePage() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const personQueryRaw = Number(searchParams.get("person") || "");
  const requestedPersonId =
    Number.isFinite(personQueryRaw) && personQueryRaw > 0 ? personQueryRaw : null;
  // Open Chart (?person=) wins if both are present.
  const wantsNewPerson =
    requestedPersonId == null && searchParams.get("new") === "person";
  const wantsEditYou =
    requestedPersonId == null && searchParams.get("edit") === "me";
  const {
    AUTHORITY_PLAIN,
    AUTHORITY_COPY,
    centersToWatch,
  } = useHdCopy();
  const {
    user,
    usersLoading,
    usersError,
    ensureUser,
    refreshUsers,
    setNatalChart,
    natalChartId,
    natalBindingLoading,
    biohackingUnlocked,
  } = useApp();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [savedTimeUnknown, setSavedTimeUnknown] = useState(false);
  /** time_unknown of the last unsaved preview calculation (drives the Environment approximate mark). */
  const [previewTimeUnknown, setPreviewTimeUnknown] = useState(false);
  const [birthCity, setBirthCity] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyMode, setBusyMode] = useState<BusyMode>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(null);
  /** The preview on screen was just calculated, so its Type box starts open. */
  const [previewJustGenerated, setPreviewJustGenerated] = useState(false);
  useEffect(() => {
    if (viewMode !== "preview") setPreviewJustGenerated(false);
  }, [viewMode]);
  const [savedForm, setSavedForm] = useState<FormSnapshot | null>(null);
  const [hydratedUserId, setHydratedUserId] = useState<number | null>(null);
  const [savedPeople, setSavedPeople] = useState<SavedChartRow[]>([]);
  /** Local selection used for upsert — independent of store race/clear. */
  const [editingChartId, setEditingChartId] = useState<number | null>(null);
  const [friendName, setFriendName] = useState("");
  const [saveAs, setSaveAs] = useState<SaveAs>("self");
  /** People charts only: person | partner relationship label. */
  const [personRole, setPersonRole] = useState<"person" | "partner">("person");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [personEditorOpen, setPersonEditorOpen] = useState(true);
  /** True after a You natal is first saved in this session — drives the first-run reveal. */
  const [firstRunYouReveal, setFirstRunYouReveal] = useState(false);
  /** True while DEMO_BIRTH is loaded into the form (never implied as "your" chart). */
  const [demoBirthActive, setDemoBirthActive] = useState(false);
  const [deepDiveDomain, setDeepDiveDomain] = useState<DeepDiveDomain>("core");
  /** Open Core row. Null means every Core row is closed. Not persisted. */
  const [deepDiveRow, setDeepDiveRow] = useState<string | null>(null);
  /** Center inspector on the v9 figure. Synced to ?center= while the chart is on screen. */
  const [selectedCenter, setSelectedCenter] = useState<CenterKey | null>(() =>
    centerKeyFromSlug(searchParams.get("center")),
  );
  /** Centers matrix row opened from the inspector. Filter stays "all" while this is set. */
  const [openCenter, setOpenCenter] = useState<CenterKey | null>(null);
  const centerQuery = searchParams.get("center");
  const centerSearchKey = searchParams.toString();
  const appliedCenterSearch = useRef<string | null>(null);
  const hadChartRef = useRef(false);
  const peopleFetchGen = useRef(0);
  /** Imperative selection for async refreshPeopleOnOpen (avoid stale Me overwrite after create). */
  const editingChartIdRef = useRef<number | null>(null);
  const viewModeRef = useRef<ViewMode>(null);
  /** Latched new-person intent: wins the race with Me hydration and collapse. */
  const newPersonIntentRef = useRef(false);
  const appliedNewPersonQueryRef = useRef(false);
  const personNameInputRef = useRef<HTMLInputElement>(null);
  /** Latched edit-You intent: wins the same collapse/hydration race. Not new-person. */
  const editYouIntentRef = useRef(false);
  const appliedEditYouQueryRef = useRef(false);
  const timeUnknownInputRef = useRef<HTMLInputElement>(null);

  const formReady = Boolean(user && hydratedUserId === user.id && !natalBindingLoading);

  // Latch URL intent before the hydrate effect (same commit, earlier in declaration order).
  useEffect(() => {
    if (requestedPersonId != null) {
      appliedNewPersonQueryRef.current = false;
      appliedEditYouQueryRef.current = false;
      editYouIntentRef.current = false;
      return;
    }
    if (searchParams.get("new") === "person") {
      newPersonIntentRef.current = true;
    }
    if (searchParams.get("edit") === "me") {
      editYouIntentRef.current = true;
    } else {
      editYouIntentRef.current = false;
      appliedEditYouQueryRef.current = false;
    }
  }, [requestedPersonId, searchParams]);

  useEffect(() => {
    if (!chart) return;
    if (appliedCenterSearch.current === centerSearchKey) return;
    appliedCenterSearch.current = centerSearchKey;
    setSelectedCenter(centerKeyFromSlug(centerQuery));
  }, [chart, centerSearchKey, centerQuery]);

  const refreshPeople = useCallback(async (userId: number) => {
    const rows = await api.charts(userId);
    setSavedPeople(rows);
    return rows;
  }, []);

  const applyDemoBirth = useCallback(() => {
    setBirthDate(DEMO_BIRTH.birthDate);
    setBirthTime(DEMO_BIRTH.birthTime);
    setTimeUnknown(false);
    setSavedTimeUnknown(false);
    setBirthCity(DEMO_BIRTH.birthCity);
    setLat(DEMO_BIRTH.lat);
    setLon(DEMO_BIRTH.lon);
    setTimezone(DEMO_BIRTH.timezone);
    setChart(null);
    setViewMode(null);
    setSavedForm(null);
    setEditingChartId(null);
    editingChartIdRef.current = null;
    viewModeRef.current = null;
    setDemoBirthActive(true);
    setPersonEditorOpen(true);
  }, []);

  const clearDemoBirth = useCallback(() => {
    setBirthDate("");
    setBirthTime("");
    setTimeUnknown(false);
    setSavedTimeUnknown(false);
    setBirthCity("");
    setLat(null);
    setLon(null);
    setTimezone(null);
    setChart(null);
    setViewMode(null);
    setSavedForm(null);
    setEditingChartId(null);
    editingChartIdRef.current = null;
    viewModeRef.current = null;
    setDemoBirthActive(false);
    setPersonEditorOpen(true);
  }, []);

  const applyRow = useCallback(
    (latest: SavedChartRow, opts?: { bindStore?: boolean }) => {
      newPersonIntentRef.current = false;
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
      setDemoBirthActive(false);

      const nextUnknown = latest.time_unknown === true;
      setBirthDate(nextDate);
      setBirthTime(nextTime);
      setTimeUnknown(nextUnknown);
      setSavedTimeUnknown(nextUnknown);
      setBirthCity(nextCity);
      setLat(nextLat);
      setLon(nextLon);
      setTimezone(nextTz);
      setChart(c);
      setEditingChartId(latest.id);
      editingChartIdRef.current = latest.id;
      viewModeRef.current = "saved";
      if (bindStore) {
        setNatalChart({
          id: latest.id,
          label: latest.label || "Me",
          birth_city: nextCity,
          birth_date: nextDate,
          birth_time: latest.birth_time,
          time_unknown: nextUnknown,
          timezone: nextTz,
          slot_kind: latest.slot_kind,
        });
      }
      setViewMode("saved");
      setSavedForm({
        birthDate: nextDate,
        birthTime: nextTime,
        birthCity: nextCity,
        lat: nextLat,
        lon: nextLon,
        timeUnknown: nextUnknown,
      });
      setSaveAs(kind);
      // You: leave name empty so "Save as new friend" cannot reuse "Me".
      // Friend: use label (never fall back to "Me").
      setFriendName(kind === "friend" ? (latest.label || "").trim() : "");
      setPersonRole(
        kind === "friend" && latest.role === "partner" ? "partner" : "person"
      );
    },
    [setNatalChart]
  );

  const pickPreferredRow = useCallback(
    (rows: SavedChartRow[], preferId: number | null) => {
      if (preferId != null) {
        const match = rows.find((r) => r.id === preferId);
        if (match) return match;
      }
      const self = rows.find((r) => isSelfRow(r));
      return self ?? rows[0] ?? null;
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
        editingChartIdRef.current = null;
        viewModeRef.current = null;
        return;
      }
      // Wait so we do not lock empty form while /charts is still in flight in the store.
      if (natalBindingLoading) return;
      if (hydratedUserId === user.id) return;

      const gen = ++peopleFetchGen.current;
      setBirthDate("");
      setBirthTime("");
      setTimeUnknown(false);
      setSavedTimeUnknown(false);
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
      editingChartIdRef.current = null;
      viewModeRef.current = null;

      try {
        const rows = await refreshPeople(user.id);
        if (cancelled || peopleFetchGen.current !== gen) return;
        if (!rows.length) {
          // Leave birth fields empty — demo only via labeled "Try demo chart" control.
          setDemoBirthActive(false);
          setHydratedUserId(user.id);
          return;
        }
        // New-person intent wins: keep the saved list, do not apply You / last person.
        if (newPersonIntentRef.current) {
          setDemoBirthActive(false);
          setPersonEditorOpen(true);
          setHydratedUserId(user.id);
          return;
        }
        const preferred = pickPreferredRow(rows, requestedPersonId ?? natalChartId);
        if (preferred && requestedPersonId != null && preferred.id === requestedPersonId) {
          applyRow(preferred, { bindStore: preferred.slot_kind !== "friend" });
        }
        // Edit-You intent: apply You (not a last-bound person) and keep the editor open.
        if (editYouIntentRef.current) {
          const youRow = rows.find((r) => isSelfRow(r));
          if (youRow) applyRow(youRow);
          setPersonEditorOpen(true);
          setHydratedUserId(user.id);
          return;
        }
        // No You yet: leave fields empty for first-run. Do not auto-apply a person chart.
        if (preferred && isSelfRow(preferred)) applyRow(preferred);
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
    pickPreferredRow,
  ]);

  useEffect(() => {
    if (requestedPersonId == null) return;
    const row = savedPeople.find((r) => r.id === requestedPersonId);
    if (!row) return;
    if (editingChartId === row.id && viewMode === "saved") return;
    const bindStore = row.slot_kind !== "friend" || natalChartId == null;
    applyRow(row, { bindStore });
  }, [requestedPersonId, savedPeople, editingChartId, viewMode, natalChartId, applyRow]);

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
        // Use ref so a mid-flight create pin is respected across await.
        if (preferred && editingChartIdRef.current == null && !newPersonIntentRef.current) {
          if (editYouIntentRef.current) {
            const youRow = rows.find((r) => isSelfRow(r));
            if (youRow) applyRow(youRow);
          } else {
            applyRow(preferred);
          }
        }
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
      // Use refs so a mid-flight create applyRow is not clobbered by stale Me preferred.
      const currentId = editingChartIdRef.current;
      const currentView = viewModeRef.current;
      if (editYouIntentRef.current) {
        const youRow = rows.find((r) => isSelfRow(r));
        if (
          youRow &&
          (currentId == null ||
            currentView !== "saved" ||
            Number(currentId) !== Number(youRow.id))
        ) {
          applyRow(youRow);
        }
        return;
      }
      if (currentId == null || !rows.some((r) => Number(r.id) === Number(currentId))) {
        const preferred = pickPreferredRow(rows, natalChartId ?? currentId);
        if (
          preferred &&
          (currentId == null || currentView !== "saved") &&
          !newPersonIntentRef.current
        ) {
          applyRow(preferred);
        }
      }
    } catch {
      /* keep current UI */
    }
  }, [user, refreshPeople, natalChartId, pickPreferredRow, applyRow]);

  // Reading mode: collapse birth tooling once a chart first appears; reopen if cleared.
  // New-person intent must not be collapsed behind Edit / switch person.
  // Edit-You intent (Today "Edit on Chart") must also win this shared collapse root.
  useEffect(() => {
    if (chart && !hadChartRef.current) {
      if (!newPersonIntentRef.current) setPersonEditorOpen(false);
      // Edit-You must win this shared collapse root (Today "Edit on Chart").
      if (editYouIntentRef.current) setPersonEditorOpen(true);
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
    timeUnknown,
  };

  const formDirtyVsSaved = Boolean(savedForm && !snapshotsEqual(formNow, savedForm));

  // Surface the editor when something needs attention.
  useEffect(() => {
    if (error || formDirtyVsSaved) setPersonEditorOpen(true);
  }, [error, formDirtyVsSaved]);

  useEffect(() => {
    const apply = (scroll: boolean) => {
      const raw = window.location.hash.replace(/^#/, "");
      if (isDeepDiveRowId(raw)) {
        setDeepDiveDomain("core");
        setDeepDiveRow(raw);
        if (scroll) {
          void (async () => {
            await waitTwoFrames();
            await scrollChartSectionIntoView(raw, motionScrollBehavior());
          })();
        }
        return;
      }
      const fromHash = domainFromHash(raw);
      if (fromHash) {
        setDeepDiveDomain(fromHash);
        // Domain hashes switch tabs. They do not open a Core row.
        if (fromHash !== "core") setDeepDiveRow(null);
      }
    };
    apply(false);
    const onHash = () => apply(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
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

  const chartNavKey = `${viewMode ?? "none"}:${editingChartId ?? "unsaved"}`;
  const [seenNavKey, setSeenNavKey] = useState(chartNavKey);
  if (seenNavKey !== chartNavKey) {
    setSeenNavKey(chartNavKey);
    const raw = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (!isDeepDiveRowId(raw)) setDeepDiveRow(null);
  }

  // After chart hydrates, honor deep-link hash once sticky stack heights are measured.
  // Domain hashes scroll to #deep-dive. Row hashes scroll to that row and open it.
  // A person switch or view-mode change starts rows closed unless a row hash is present.
  useEffect(() => {
    if (!chart) return;
    const raw = window.location.hash.replace(/^#/, "");
    if (isDeepDiveRowId(raw)) {
      setDeepDiveDomain("core");
      setDeepDiveRow(raw);
    } else {
      setDeepDiveRow(null);
      const fromHash = domainFromHash(raw);
      if (fromHash) setDeepDiveDomain(fromHash);
    }
    if (!raw) return;
    const targetId = isDeepDiveRowId(raw) ? raw : DEEP_SECTION_IDS.has(raw) ? "deep-dive" : raw;
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
  }, [chart, chartNavKey]);

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
  const hasSelfSaved = savedPeople.some((r) => isSelfRow(r));

  const revealNewPersonForm = useCallback(() => {
    void (async () => {
      await waitTwoFrames();
      await scrollChartSectionIntoView("people-form", "auto", {
        correctAfterSettle: true,
      });
      personNameInputRef.current?.focus();
    })();
  }, []);

  const startNewPerson = useCallback(() => {
    newPersonIntentRef.current = true;
    setEditingChartId(null);
    editingChartIdRef.current = null;
    viewModeRef.current = null;
    setBirthDate("");
    setBirthTime("");
    setTimeUnknown(false);
    setSavedTimeUnknown(false);
    setBirthCity("");
    setLat(null);
    setLon(null);
    setTimezone(null);
    setChart(null);
    setViewMode(null);
    setSavedForm(null);
    setError(null);
    setFriendName("");
    setPersonRole("person");
    setSaveAs(biohackingUnlocked && hasSelfSaved ? "friend" : "self");
    setDemoBirthActive(false);
    setPersonEditorOpen(true);
    revealNewPersonForm();
  }, [biohackingUnlocked, hasSelfSaved, revealNewPersonForm]);

  // Deep link /profile?new=person#people-form: run the single new-person path once form is ready.
  useEffect(() => {
    if (!wantsNewPerson || !formReady) return;
    if (appliedNewPersonQueryRef.current) return;
    appliedNewPersonQueryRef.current = true;
    startNewPerson();
  }, [wantsNewPerson, formReady, startNewPerson]);

  const revealEditYouForm = useCallback(() => {
    void (async () => {
      await waitTwoFrames();
      await scrollChartSectionIntoView("people-form", "auto", {
        correctAfterSettle: true,
      });
      timeUnknownInputRef.current?.focus();
    })();
  }, []);

  // Deep link /profile?edit=me#people-form: open the existing You editor once form is ready.
  // Do not reuse the new-person path — this is an update of You, not a create.
  useEffect(() => {
    if (!wantsEditYou || !formReady) return;
    if (appliedEditYouQueryRef.current) return;
    const youRow = savedPeople.find((r) => isSelfRow(r));
    if (!youRow) return;
    appliedEditYouQueryRef.current = true;
    if (editingChartId !== youRow.id || viewMode !== "saved") {
      applyRow(youRow);
    }
    setPersonEditorOpen(true);
    revealEditYouForm();
  }, [
    wantsEditYou,
    formReady,
    savedPeople,
    editingChartId,
    viewMode,
    applyRow,
    revealEditYouForm,
  ]);

  const mapSaveError = (raw: string): string => {
    const lower = raw.toLowerCase();
    if (lower.includes("chart not found") || lower.includes("was deleted")) {
      return t("chart.people.deletedNotice");
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
      if (!birthDate) throw new Error(t("chart.firstRun.errorDate"));
      if (!timeUnknown && !birthTime) throw new Error(t("chart.firstRun.errorTime"));
      let city = birthCity.trim();
      if (!city) throw new Error(t("chart.people.errorCityOrCoords"));

      const activeUser = user ?? (await ensureUser());
      if (!activeUser?.id) throw new Error(t("chart.people.noUserRetry"));

      if (saveIntent === "update") {
        if (editingChartId == null || !selectedSavedRow) {
          throw new Error(t("chart.people.pickOrAdd"));
        }
      }

      // Cap only blocks *new* people. Updating a selected saved chart is always allowed.
      if (saveIntent === "create" && savedPeople.length >= MAX_PEOPLE) {
        throw new Error(
          t("chart.people.atPersonLimit", { max: MAX_PEOPLE })
        );
      }

      const kind: SaveAs =
        saveIntent === "update"
          ? frozenSlot
          : saveIntent === "create"
            ? (kindOverride ?? saveAs)
            : (kindOverride ?? saveAs);

      // Free (and Preview as Free): Me create/update only — no new People charts.
      if (saveIntent === "create" && !biohackingUnlocked) {
        if (kind === "friend") {
          throw new Error(t("chart.people.savingPeopleRequiresPro"));
        }
        if (hasSelfSaved) {
          throw new Error(
            t("chart.people.freeOneMe")
          );
        }
      }

      if (save && kind === "friend" && !friendName.trim()) {
        throw new Error(t("chart.people.enterName"));
      }
      if (
        save &&
        kind === "friend" &&
        friendName.trim().toLowerCase() === "me"
      ) {
        throw new Error(t("chart.people.enterNameNotMe"));
      }

      if (saveIntent === "update" && selectedSavedRow) {
        const ok =
          frozenSlot === "self"
            ? window.confirm(
                t("chart.people.confirmReplaceYou")
              )
            : window.confirm(
                t("chart.people.confirmReplacePerson", { name: friendChipLabel(selectedSavedRow, t("chart.people.personFallback")) })
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

      const birthTimeFull = effectiveBirthTime(birthTime, timeUnknown);
      const res = await api.calculateChart({
        birth_date: birthDate,
        birth_time: birthTimeFull,
        birth_city: city,
        user_id: activeUser.id,
        save,
        lat: useLat,
        lon: useLon,
        label: save ? label : undefined,
        slot_kind: save ? kind : undefined,
        role:
          save && kind === "friend"
            ? personRole
            : save && kind === "self"
              ? "self"
              : undefined,
        // create never sends natal_chart_id even if a stale id exists
        natal_chart_id:
          saveIntent === "update" ? editingChartId ?? undefined : undefined,
        time_unknown: timeUnknown,
      });
      const chartTz =
        typeof res.chart?.timezone === "string" ? (res.chart.timezone as string) : null;
      if (chartTz) setTimezone(chartTz);
      if (timeUnknown) setBirthTime("12:00");

      if (save) {
        if (!res.natal_chart_id) {
          setError(t("chart.people.saveNoId"));
          return;
        }
        setDemoBirthActive(false);
        const newId = Number(res.natal_chart_id);
        // Pin selection refs before any await flush so refreshPeopleOnOpen cannot re-apply Me.
        if (saveIntent === "create") {
          editingChartIdRef.current = newId;
          viewModeRef.current = "saved";
        }
        const rows = await refreshPeople(activeUser.id);
        let createdOrUpdated =
          rows.find((r) => Number(r.id) === newId) ?? null;
        if (!createdOrUpdated) {
          createdOrUpdated = {
            id: newId,
            label,
            slot_kind: kind,
            birth_date: birthDate,
            birth_time: birthTimeFull,
            time_unknown: timeUnknown,
            birth_city: city,
            lat: useLat ?? undefined,
            lon: useLon ?? undefined,
            timezone: chartTz || timezone,
            type: String((res.chart as Chart)?.type ?? ""),
            profile: String((res.chart as Chart)?.profile ?? ""),
            chart: res.chart as Record<string, unknown>,
          };
        }

        if (saveIntent === "update") {
          setChart(res.chart);
          setEditingChartId(newId);
          editingChartIdRef.current = newId;
          viewModeRef.current = "saved";
          setViewMode("saved");
          setSavedForm({
            birthDate,
            birthTime: toTimeInputValue(birthTimeFull),
            birthCity: city,
            lat: useLat,
            lon: useLon,
            timeUnknown,
          });
          setSavedTimeUnknown(timeUnknown);
          setSaveAs(kind);
          setFriendName(label);
          if (natalChartId != null && newId === natalChartId) {
            setNatalChart({
              id: newId,
              label,
              birth_city: city,
              birth_date: birthDate,
              birth_time: birthTimeFull,
              time_unknown: timeUnknown,
              timezone: chartTz || timezone,
            });
          }
        } else {
          // create-friend / create-self: always applyRow the new id (never fall back to store Me)
          writeChartTypeOpenIfNull(activeUser.id, newId);
          const bindStore =
            kind === "self" && (!hasSelfSaved || natalChartId == null);
          applyRow(createdOrUpdated, { bindStore });
        }
      } else {
        setChart(res.chart);
        setPreviewTimeUnknown(timeUnknown);
        setViewMode("preview");
        setPreviewJustGenerated(true);
      }
    } catch (e) {
      setError(mapSaveError(e instanceof Error ? e.message : String(e)));
    } finally {
      setBusyMode(null);
    }
  };

  const submitFirstRun = async () => {
    setBusyMode("save");
    setError(null);
    try {
      if (!birthDate || (!timeUnknown && !birthTime) || lat == null || lon == null) {
        return;
      }
      const activeUser = user ?? (await ensureUser());
      if (!activeUser?.id) {
        setError(t("chart.firstRun.saveFailed"));
        return;
      }
      const city = birthCity.trim();
      const birthTimeFull = effectiveBirthTime(birthTime, timeUnknown);
      const res = await api.calculateChart({
        birth_date: birthDate,
        birth_time: birthTimeFull,
        birth_city: city,
        user_id: activeUser.id,
        save: true,
        lat,
        lon,
        label: "Me",
        slot_kind: "self",
        role: "self",
        time_unknown: timeUnknown,
      });
      if (!res.natal_chart_id) {
        setError(t("chart.firstRun.saveFailed"));
        return;
      }
      setDemoBirthActive(false);
      const newId = Number(res.natal_chart_id);
      editingChartIdRef.current = newId;
      viewModeRef.current = "saved";
      const rows = await refreshPeople(activeUser.id);
      const chartTz =
        typeof res.chart?.timezone === "string" ? (res.chart.timezone as string) : null;
      if (chartTz) setTimezone(chartTz);
      if (timeUnknown) setBirthTime("12:00");
      const created =
        rows.find((r) => Number(r.id) === newId) ??
        ({
          id: newId,
          label: "Me",
          slot_kind: "self",
          role: "self",
          birth_date: birthDate,
          birth_time: birthTimeFull,
          time_unknown: timeUnknown,
          birth_city: city,
          lat: lat ?? undefined,
          lon: lon ?? undefined,
          timezone: chartTz || timezone,
          type: String((res.chart as Chart)?.type ?? ""),
          profile: String((res.chart as Chart)?.profile ?? ""),
          chart: res.chart as Record<string, unknown>,
        } satisfies SavedChartRow);
      writeChartTypeOpenIfNull(activeUser.id, newId);
      applyRow(created, { bindStore: true });
      setFirstRunYouReveal(true);
    } catch {
      setError(t("chart.firstRun.saveFailed"));
    } finally {
      setBusyMode(null);
    }
  };

  const patchFirstRunBirth = (patch: Partial<FirstRunBirth>) => {
    if (patch.birthDate !== undefined) setBirthDate(patch.birthDate);
    if (patch.birthTime !== undefined) setBirthTime(patch.birthTime);
    if (patch.birthCity !== undefined) setBirthCity(patch.birthCity);
    if (patch.lat !== undefined) setLat(patch.lat);
    if (patch.lon !== undefined) setLon(patch.lon);
    if (patch.timezone !== undefined) setTimezone(patch.timezone);
    if (patch.timeUnknown !== undefined) setTimeUnknown(patch.timeUnknown);
  };

  const selectPerson = (row: SavedChartRow) => {
    // Chart edit target is local; keep Today’s Me unless selecting self or nothing bound yet.
    const bindStore = row.slot_kind !== "friend" || natalChartId == null;
    applyRow(row, { bindStore });
    setError(null);
  };

  const deletePerson = async (row: SavedChartRow) => {
    if (!user) return;
    const ok = window.confirm(
      isSelfRow(row)
        ? t("chart.people.confirmRemoveYou")
        : t("chart.people.confirmRemovePerson", { name: friendChipLabel(row, t("chart.people.personFallback")) })
    );
    if (!ok) return;
    setDeletingId(row.id);
    setError(null);
    try {
      await api.deleteChart(row.id, user.id);
      const rows = await refreshPeople(user.id);
      if (editingChartId === row.id || natalChartId === row.id) {
        const self = rows.find((r) => isSelfRow(r));
        if (self) {
          // Rebound to You; friends never become the Today/Protocols sticky.
          applyRow(self, { bindStore: true });
        } else if (rows[0]) {
          // No self left — Chart can edit a friend, but clear natal sticky.
          applyRow(rows[0], { bindStore: false });
          setNatalChart(null);
        } else {
          setChart(null);
          setNatalChart(null);
          setViewMode(null);
          setSavedForm(null);
          setEditingChartId(null);
          editingChartIdRef.current = null;
          viewModeRef.current = null;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeletingId(null);
    }
  };

  const jumpToSection = (id: string, domain?: DeepDiveDomain) => {
    const rowJump = isDeepDiveRowId(id);
    if (rowJump) {
      setDeepDiveDomain("core");
      setDeepDiveRow(id);
    } else if (domain) {
      setDeepDiveDomain(domain);
      if (domain !== "core") setDeepDiveRow(null);
    }
    const url = `${window.location.pathname}${window.location.search}#${id}`;
    window.history.replaceState(null, "", url);
    // Row ids are not domain aliases: scroll to the row, not only the section heading.
    const targetId = rowJump ? id : DEEP_SECTION_IDS.has(id) ? "deep-dive" : id;
    if (rowJump) {
      void (async () => {
        await waitTwoFrames();
        await scrollChartSectionIntoView(targetId, motionScrollBehavior());
      })();
      return;
    }
    void scrollChartSectionIntoView(targetId, "smooth");
  };

  const onSelectCenter = (next: string | null) => {
    const center = isCenterKey(next) ? next : null;
    setSelectedCenter(center);
    replaceCenterParam(center ? slugFromCenterKey(center) : null);
  };

  const onInspectCenter = (center: string) => {
    if (!isCenterKey(center)) return;
    setOpenCenter(center);
    setSelectedCenter(null);
    replaceCenterParam(null);
    jumpToSection("deep-dive", "centers");
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
  // Brief 17353706…: "you" only on your own chart. Everyone else, including an unsaved preview, gets their name.
  const chartPersonName = chartVoiceName({
    selectedRow: selectedSavedRow,
    viewMode,
    isNewPersonUi,
    saveAs,
    hasSelfSaved,
    friendName,
    personFallback: t("chart.people.personFallback"),
  });
  const snapshotPersonName = chartPersonName;
  const typeKey = String(chart?.type || "");
  const profileStr = String(chart?.profile || "");
  const authorityStr = String(chart?.authority || "");
  const strategyStr = String(chart?.strategy || "");
  const definitionStr = String(chart?.definition || "");
  // Environment (Color of the Design Nodes) from the API; omitted when the backend could not derive it.
  const environmentName = isEnvironmentName(chart?.environment) ? chart.environment : null;
  const environmentApprox =
    viewMode === "saved" ? savedTimeUnknown : viewMode === "preview" ? previewTimeUnknown : false;

  const busy = busyMode !== null;
  const tzBesideTime = formatTimezoneLabel(timezone, birthDate, birthTime);
  const atCap = savedPeople.length >= MAX_PEOPLE;

  const activePersonLabel =
    selectedSavedRow?.label ||
    friendName.trim() ||
    (viewMode === "preview"
      ? t("chart.people.previewChip")
      : isNewPersonUi
        ? t("chart.people.newPerson")
        : t("chart.people.meLabel"));

  const updatingExistingUi = !isNewPersonUi && selectedSavedRow != null;
  const editingYou =
    updatingExistingUi && selectedSavedRow != null && frozenSlot === "self";
  const editingFriend =
    updatingExistingUi && selectedSavedRow != null && frozenSlot === "friend";

  const youRow = (() => {
    if (!savedPeople.length) return null;
    if (natalChartId != null) {
      const bound = savedPeople.find((r) => r.id === natalChartId && isSelfRow(r));
      if (bound) return bound;
    }
    return savedPeople.find((r) => isSelfRow(r)) ?? null;
  })();
  const friendRows = savedPeople.filter((r) => r.slot_kind === "friend");
  const storeHasYou = natalChartId != null;
  const isFirstRun = !storeHasYou && formReady && !hasSelfSaved && Boolean(user);
  const showFirstRunWait = !storeHasYou && (natalBindingLoading || !formReady || !user) && !usersError;
  const showFirstRunAccountError = !storeHasYou && !user && Boolean(usersError) && !natalBindingLoading;
  const extraSelfRows =
    youRow != null
      ? savedPeople.filter((r) => isSelfRow(r) && r.id !== youRow.id)
      : savedPeople.filter((r) => isSelfRow(r));
  const duplicateSelfCount = savedPeople.filter((r) => isSelfRow(r)).length;
  const canCreatePeople = biohackingUnlocked;
  const showMeFriendSegment = isNewPersonUi && !hasSelfSaved && canCreatePeople;
  const createFriendDisabled =
    busy || !formReady || atCap || !friendName.trim() || !canCreatePeople;

  const stateBar = (() => {
    if (editingYou) {
      return {
        testId: "editing-banner" as const,
        className:
          "rounded-xl border border-energy/50 bg-energy-soft px-4 py-3 text-sm text-energy-ink",
        body: (
          <>
            <span className="font-semibold">{t("chart.people.editingYourChart")}</span> {t("chart.people.peopleUnchanged")}
          </>
        ),
      };
    }
    if (editingFriend && selectedSavedRow) {
      return {
        testId: "editing-banner" as const,
        className:
          "rounded-xl border border-growth/40 bg-growth-soft px-4 py-3 text-sm text-growth-ink",
        body: (
          <>
            <span className="font-semibold">
              {t("chart.people.editingNamed", { name: friendChipLabel(selectedSavedRow, t("chart.people.personFallback")) })}
            </span>{" "}
            Your chart stays as-is.
          </>
        ),
      };
    }
    return {
      testId: "editing-banner" as const,
      className:
        "rounded-xl border border-border bg-sunken px-4 py-3 text-sm text-fg-secondary",
      body: hasSelfSaved ? (
        canCreatePeople ? (
          <>
            <span className="font-semibold text-fg">{t("chart.people.newPersonNothingOverwritten")}</span>
          </>
        ) : (
          <>
            <span className="font-semibold text-fg">{t("chart.people.peopleUnlockPro")}</span>{" "}
            {t("chart.people.updateMeOrView")}
          </>
        )
      ) : (
        <>
          <span className="font-semibold text-fg">
            {canCreatePeople
              ? t("chart.people.newChartYouOrPerson")
              : t("chart.people.newChartYou")}
          </span>
        </>
      ),
    };
  })();

  const peopleAndForm = (
    <>
      {user && formReady && (
        <div className="rounded-2xl border border-border bg-elevated p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-fg">{t("chart.people.savedPeople")}</h2>
            <span className="text-xs text-fg-muted">
              {savedPeople.length}/{MAX_PEOPLE}
            </span>
          </div>
          {savedPeople.length === 0 ? (
            <p className="text-sm text-fg-muted">{t("chart.people.noneYetAdd")}</p>
          ) : (
            <div className="space-y-4">
              {youRow && (
                <div>
                  <p className="mb-1.5 type-chip uppercase tracking-wide text-growth">
                    {t("chart.people.youLabel")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      data-testid="you-row"
                      onClick={() => selectPerson(youRow)}
                      className={`min-h-11 flex-1 rounded-xl border px-4 py-2.5 text-left text-sm transition sm:flex-none ${
                        editingChartId === youRow.id && viewMode === "saved"
                          ? "border-growth bg-growth-soft font-semibold text-growth-ink ring-2 ring-growth/30"
                          : "border-growth/40 bg-growth-soft/60 text-growth-ink hover:border-growth"
                      }`}
                    >
                      <span className="font-semibold">{t("chart.people.youBadge")}</span>
                      <span className="text-fg-muted">
                        {(() => {
                          const name = youChipLabel(youRow, t("chart.people.youLabel"));
                          const meta =
                            youRow.type || youRow.profile
                              ? ` · ${youRow.type || "—"} · ${youRow.profile || "—"}`
                              : "";
                          // Badge already says YOU — if label is You, don't repeat it.
                          return name === t("chart.people.youLabel") ? meta : ` · ${name}${meta}`;
                        })()}
                      </span>
                      <span className="mt-0.5 block type-caption leading-snug text-fg-secondary">
                        {[youRow.birth_city, youRow.birth_date].filter(Boolean).join(" · ") ||
                          "—"}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={t("chart.people.removeYourChart")}
                      disabled={deletingId === youRow.id}
                      onClick={() => void deletePerson(youRow)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-sunken hover:text-danger disabled:opacity-50"
                      title={t("chart.people.removeYourChart")}
                    >
                      {deletingId === youRow.id ? "…" : "×"}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <p className="mb-1.5 type-chip uppercase tracking-wide text-energy-ink">
                  {t("chart.people.peopleLabel")}
                </p>
                {friendRows.length === 0 ? (
                  <p className="text-sm text-fg-muted">
                    {canCreatePeople
                      ? t("chart.people.noPeopleSaveAs")
                      : t("chart.people.noPeoplePro")}
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {friendRows.map((row) => {
                      const active = editingChartId === row.id && viewMode === "saved";
                      const name = friendChipLabel(row, t("chart.people.personFallback"));
                      return (
                        <li key={row.id} className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            data-testid={`friend-chip-${row.id}`}
                            onClick={() => selectPerson(row)}
                            className={`min-h-10 rounded-full border px-3 py-2 text-left text-xs transition ${
                              active
                                ? "border-energy bg-energy-soft font-semibold text-energy-ink ring-2 ring-energy/30"
                                : "border-border bg-sunken text-fg hover:border-energy/50"
                            }`}
                          >
                            <span className="font-medium">{name}</span>
                            <span className="text-fg-muted">
                              {" "}
                              · {row.type || "—"} · {row.profile || "—"}
                              {row.role === "partner" ? ` ${t("chart.people.partnerSuffix")}` : ""}
                            </span>
                            <span className="mt-0.5 block type-caption leading-snug text-fg-secondary">
                              {[row.birth_city, row.birth_date].filter(Boolean).join(" · ") ||
                                "—"}
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label={t("chart.people.deleteName", { name })}
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
              </div>

              {extraSelfRows.length > 0 && (
                <div>
                  <p className="mb-1.5 type-chip uppercase tracking-wide text-fg-secondary">
                    {t("chart.people.otherChartsYou")}
                  </p>
                  <p className="mb-2 text-xs text-energy-ink">
                    {t("chart.people.extraMeHelp")}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {extraSelfRows.map((row) => {
                      const active = editingChartId === row.id && viewMode === "saved";
                      return (
                        <li key={row.id} className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => selectPerson(row)}
                            className={`min-h-10 rounded-full border px-3 py-2 text-left text-xs transition ${
                              active
                                ? "border-growth bg-growth-soft text-growth-ink ring-2 ring-growth/30"
                                : "border-border bg-sunken text-fg-muted hover:border-growth/40"
                            }`}
                          >
                            <span className="font-medium">
                              {youChipLabel(row, t("chart.people.youLabel"))} #{row.id}
                            </span>
                            <span className="mt-0.5 block type-caption leading-snug">
                              {[row.birth_city, row.birth_date].filter(Boolean).join(" · ") ||
                                "—"}
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label={t("chart.people.deleteDuplicate", { id: row.id })}
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
                </div>
              )}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {canCreatePeople ? (
              !chart ? (
                <button
                  type="button"
                  data-testid="add-new-person"
                  disabled={busy}
                  onClick={startNewPerson}
                  className="min-h-10 rounded-full border border-border bg-sunken px-3 py-2 text-xs font-medium text-fg hover:border-growth/50 disabled:opacity-60"
                >
                  {t("chart.people.addNewPerson")}
                </button>
              ) : null
            ) : (
              <p className="text-xs text-fg-muted" data-testid="free-people-pro-hint">
                {t("chart.people.addPeopleWithPro")}
              </p>
            )}
          </div>
          {atCap && (
            <p className="mt-2 text-xs text-energy-ink">
              {t("chart.people.atPersonLimit", { max: MAX_PEOPLE })}
              {duplicateSelfCount > 1 ? ` ${t("chart.people.cleanupDupes")}` : ""}
            </p>
          )}
          {!atCap && duplicateSelfCount > 1 && (
            <p className="mt-2 text-xs text-energy-ink">
              {t("chart.people.severalMeCleanup")}
            </p>
          )}
        </div>
      )}

      {user && !formReady && <ChartFormSkeleton />}

      {user && formReady && (
        <div data-testid={stateBar.testId} className={stateBar.className}>
          {stateBar.body}
        </div>
      )}

      {user && formReady && demoBirthActive && (
        <div
          role="status"
          data-testid="demo-chart-banner"
          className="flex flex-col gap-2 rounded-xl border border-energy/40 bg-energy/10 px-4 py-3 text-sm text-energy-ink sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            <span className="font-semibold">{t("chart.people.demoChart")}</span> {t("chart.people.demoCaption")}
          </p>
          <button
            type="button"
            data-testid="clear-demo-chart"
            disabled={busy}
            onClick={clearDemoBirth}
            className="min-h-10 shrink-0 rounded-lg border border-energy-ink/40 px-3 py-2 text-xs font-medium hover:bg-energy/15 disabled:opacity-60"
          >
            {t("chart.people.clearDemo")}
          </button>
        </div>
      )}

      {user && formReady && !demoBirthActive && !editingChartId && !birthDate && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="try-demo-chart"
            disabled={busy}
            onClick={() => applyDemoBirth()}
            className="min-h-10 rounded-full border border-border bg-sunken px-3 py-2 text-xs font-medium text-fg hover:border-growth/50 disabled:opacity-60"
          >
            {t("chart.people.tryDemo")} (Ra Uru Hu)
          </button>
          <span className="text-xs text-fg-muted">{t("chart.people.referenceOnly")}</span>
        </div>
      )}

      <div className="relative z-0 grid gap-4 rounded-2xl border border-border bg-elevated p-5 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-fg-muted">{t("chart.firstRun.dateLabel")}</span>
          <input
            type="date"
            className="w-full rounded-lg border border-border bg-sunken px-3 py-2 disabled:cursor-wait disabled:opacity-60"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={!formReady || busy}
            required
          />
        </label>
        <div className="text-sm">
          <label className="block">
            <span className="mb-1 block text-fg-muted">
              {t("chart.people.birthTimeLocal", {
                suffix: tzBesideTime ? ` ${t("chart.people.local")}` : "",
              })}
            </span>
            <input
              type="time"
              step={60}
              className="w-full rounded-lg border border-border bg-sunken px-3 py-2 disabled:cursor-wait disabled:opacity-60"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              disabled={!formReady || busy || timeUnknown}
              required={!timeUnknown}
            />
          </label>
          {tzBesideTime && (
            <span className="mt-1 block type-caption text-fg-secondary">{tzBesideTime}</span>
          )}
          <label className="mt-2 flex min-h-10 items-start gap-2 text-fg">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded border-border"
              data-testid="chart-time-unknown"
              ref={timeUnknownInputRef}
              checked={timeUnknown}
              onChange={(e) => setTimeUnknown(e.target.checked)}
              disabled={!formReady || busy}
            />
            <span className="type-body">{t("chart.timeUnknown")}</span>
          </label>
          {timeUnknown ? (
            <p className="mt-1 type-caption text-fg-secondary" data-testid="chart-time-unknown-disclosure">
              {t("chart.timeUnknownDisclosure")}
            </p>
          ) : null}
          <span className="mt-1 block type-caption text-fg-secondary">
            {t("chart.people.timeApprox")}
          </span>
        </div>
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
                {editingYou
                  ? t("chart.people.personNameForSave")
                  : editingFriend
                    ? t("chart.people.nameLabel")
                    : saveAs === "friend" || hasSelfSaved
                      ? t("chart.people.personName")
                      : t("chart.people.displayName")}
              </span>
              <input
                ref={personNameInputRef}
                data-testid="person-name-input"
                className="w-48 rounded-lg border border-border bg-sunken px-3 py-2"
                placeholder={
                  editingYou || saveAs === "friend" || (isNewPersonUi && hasSelfSaved)
                    ? t("chart.people.personName")
                    : t("chart.people.optional")
                }
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                disabled={!formReady || busy}
              />
            </label>
            {updatingExistingUi ? (
              <span className="mb-2 inline-flex min-h-10 items-center rounded-lg border border-border bg-sunken/80 px-3 py-2 text-sm text-fg-muted">
                {t("chart.people.roleFixed", {
                  role: frozenSlot === "self" ? t("chart.people.youLabel") : t("chart.people.personFallback"),
                })}
              </span>
            ) : showMeFriendSegment ? (
              <div className="flex gap-1 rounded-xl border border-border bg-sunken/80 p-1">
                <button
                  type="button"
                  disabled={!formReady || busy}
                  onClick={() => setSaveAs("self")}
                  className={`min-h-10 rounded-lg px-3 py-2 text-sm ${
                    saveAs === "self" ? "bg-growth/25 text-growth-ink" : "text-fg-muted"
                  }`}
                >
                  {t("chart.people.meLabel")}
                </button>
                <button
                  type="button"
                  disabled={!formReady || busy}
                  onClick={() => setSaveAs("friend")}
                  className={`min-h-10 rounded-lg px-3 py-2 text-sm ${
                    saveAs === "friend" ? "bg-growth/25 text-growth-ink" : "text-fg-muted"
                  }`}
                >
                  {t("chart.people.personFallback")}
                </button>
              </div>
            ) : isNewPersonUi && !hasSelfSaved ? (
              <span className="mb-2 inline-flex min-h-10 items-center rounded-lg border border-growth/40 bg-growth-soft px-3 py-2 text-sm text-growth-ink">
                {t("chart.people.savingAsYou")}
              </span>
            ) : isNewPersonUi && !canCreatePeople ? (
              <span className="mb-2 inline-flex min-h-10 items-center rounded-lg border border-border bg-sunken/80 px-3 py-2 text-sm text-fg-muted">
                {t("chart.people.peopleUnlockWithPro")}
              </span>
            ) : (
              <span className="mb-2 inline-flex min-h-10 items-center rounded-lg border border-energy/40 bg-energy-soft px-3 py-2 text-sm text-energy-ink">
                {t("chart.people.savingAsPerson")}
              </span>
            )}
            {(editingFriend ||
              (isNewPersonUi &&
                canCreatePeople &&
                (saveAs === "friend" || hasSelfSaved))) && (
              <div
                className="flex gap-1 rounded-xl border border-border bg-sunken/80 p-1"
                data-testid="person-role-control"
                title={t("chart.people.relationshipLabel")}
              >
                <button
                  type="button"
                  disabled={!formReady || busy}
                  onClick={() => setPersonRole("person")}
                  className={`min-h-10 rounded-lg px-3 py-2 text-sm ${
                    personRole === "person"
                      ? "bg-elevated text-fg"
                      : "text-fg-muted"
                  }`}
                  data-testid="person-role-person"
                >
                  {t("chart.people.personFallback")}
                </button>
                <button
                  type="button"
                  disabled={!formReady || busy}
                  onClick={() => setPersonRole("partner")}
                  className={`min-h-10 rounded-lg px-3 py-2 text-sm ${
                    personRole === "partner"
                      ? "bg-elevated text-fg"
                      : "text-fg-muted"
                  }`}
                  data-testid="person-role-partner"
                >
                  {t("chart.people.partnerRole")}
                </button>
              </div>
            )}
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            {editingYou ? (
              <>
                {canCreatePeople && (
                  <button
                    type="button"
                    data-testid="save-as-new-friend"
                    disabled={createFriendDisabled}
                    onClick={() => void submit("create", "friend")}
                    className="min-h-10 rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busyMode === "save" ? t("common.saving") : t("chart.people.saveAsNewPerson")}
                  </button>
                )}
                <button
                  type="button"
                  data-testid="calculate-save"
                  disabled={busy || !formReady}
                  onClick={() => void submit("update")}
                  className="min-h-10 rounded-xl border border-border bg-sunken px-4 py-2.5 text-sm font-medium text-fg hover:border-energy/50 disabled:cursor-wait disabled:opacity-60"
                >
                  {busyMode === "save" ? t("common.saving") : t("chart.people.updateYourChart")}
                </button>
              </>
            ) : editingFriend ? (
              <>
                <button
                  type="button"
                  data-testid="calculate-save"
                  disabled={busy || !formReady}
                  onClick={() => void submit("update")}
                  className="min-h-10 rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep disabled:cursor-wait disabled:opacity-60"
                >
                  {busyMode === "save"
                    ? t("common.saving")
                    : t("chart.people.updateNamed", { name: friendChipLabel(selectedSavedRow!, t("chart.people.personFallback")) })}
                </button>
                {canCreatePeople && (
                  <button
                    type="button"
                    data-testid="save-as-new-friend"
                    disabled={createFriendDisabled}
                    onClick={() => void submit("create", "friend")}
                    className="min-h-10 rounded-xl border border-border bg-sunken px-4 py-2.5 text-sm font-medium text-fg hover:border-growth/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t("chart.people.saveAsAnotherPerson")}
                  </button>
                )}
              </>
            ) : canCreatePeople || !hasSelfSaved ? (
              <button
                type="button"
                data-testid="calculate-save"
                disabled={
                  busy ||
                  !formReady ||
                  atCap ||
                  ((canCreatePeople && (saveAs === "friend" || hasSelfSaved)) &&
                    !friendName.trim()) ||
                  (!canCreatePeople && hasSelfSaved)
                }
                onClick={() =>
                  void submit(
                    "create",
                    !canCreatePeople ? "self" : hasSelfSaved ? "friend" : saveAs
                  )
                }
                className="min-h-10 rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep disabled:cursor-wait disabled:opacity-60"
              >
                {busyMode === "save"
                  ? t("common.saving")
                  : !canCreatePeople
                    ? t("chart.people.calculateAndSave")
                    : hasSelfSaved || saveAs === "friend"
                      ? t("chart.people.savePerson")
                      : t("chart.people.calculateAndSave")}
              </button>
            ) : null}
            <button
              type="button"
              data-testid="preview-only"
              disabled={busy || !formReady}
              onClick={() => void submit("preview")}
              className="min-h-10 px-1 py-2.5 text-sm text-fg-muted underline-offset-2 hover:text-fg hover:underline disabled:cursor-wait disabled:opacity-60"
              title={t("chart.people.tryWithoutSaving")}
            >
              {busyMode === "preview" ? t("chart.people.working") : t("chart.people.previewOnly")}
            </button>
            {user && (
              <span className="self-center text-xs text-fg-muted">{t("chart.people.asUser", { name: user.display_name })}</span>
            )}
            {viewMode === "preview" && chart && (
              <span className="self-center rounded-full border border-energy/50 bg-energy/10 px-2.5 py-1 text-xs text-energy-ink">
                {t("chart.people.previewNotSaved", {
                  suffix: natalChartId ? t("chart.people.priorSaved", { id: natalChartId }) : "",
                })}
              </span>
            )}
            {viewMode === "saved" && editingChartId && (
              <span className="self-center text-xs text-growth">{t("chart.people.savedChartId", { id: editingChartId })}</span>
            )}
          </div>
        </div>

        {formDirtyVsSaved && viewMode === "saved" && (
          <p className="md:col-span-4 rounded-lg border border-energy/40 bg-energy/10 px-3 py-2 text-xs text-energy-ink">
            {t("chart.people.formMismatch")}
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

  const shareGraph = chart ? graphFromChart(chart as Record<string, unknown>) : null;
  const shareFirstName = (user?.first_name || "").trim() || null;
  // Natal poster is for You only — never present a friend's chart as "my Baseline".
  const canShareNatal = Boolean(chart) && Boolean(shareGraph) && frozenSlot === "self";

  if (showFirstRunWait) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        data-testid="first-run-wait"
      >
        <p className="type-body text-fg-muted">{t("chart.firstRun.waiting")}</p>
      </div>
    );
  }

  if (showFirstRunAccountError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4">
        <p className="type-body text-fg">{t("chart.firstRun.accountFailed")}</p>
        <button
          type="button"
          className="min-h-10 rounded-lg border border-border bg-elevated px-3 py-2.5 type-body text-fg hover:border-growth"
          onClick={() => void refreshUsers()}
        >
          {t("chart.firstRun.retry")}
        </button>
      </div>
    );
  }

  if (isFirstRun) {
    return (
      <div className="space-y-6">
        {friendRows.length > 0 && (
          <div
            className="mx-auto max-w-xl rounded-2xl border border-border bg-elevated p-4"
            data-testid="first-run-saved-people"
          >
            <h2 className="text-sm font-semibold text-fg">{t("chart.people.savedPeople")}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {friendRows.map((row) => {
                const name = friendChipLabel(row, t("chart.people.personFallback"));
                return (
                  <li
                    key={row.id}
                    className="rounded-full border border-border bg-sunken px-3 py-2 text-xs text-fg"
                  >
                    <span className="font-medium">{name}</span>
                    <span className="text-fg-muted">
                      {" "}
                      · {row.type || "—"} · {row.profile || "—"}
                      {row.role === "partner" ? ` ${t("chart.people.partnerSuffix")}` : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <FirstRunChartForm
          firstName={(user?.first_name || "").trim() || null}
          birth={{
            birthDate,
            birthTime,
            birthCity,
            lat,
            lon,
            timezone,
            timeUnknown,
          }}
          onChange={patchFirstRunBirth}
          busy={busyMode === "save"}
          ready={formReady}
          saveError={error}
          onSave={() => void submitFirstRun()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="type-title">
            {chartPersonName
              ? t("page.chart.h1.other", { name: chartPersonName })
              : t("page.chart.h1")}
          </h1>
          <p className="mt-1 type-meta">
            {t("chart.people.pageLead", { max: MAX_PEOPLE })}
          </p>
        </div>
        {canShareNatal && shareGraph ? (
          <ShareBaselineButton
            variant="natal"
            typeLabel={typeKey}
            profileLabel={profileStr}
            strategyLabel={strategyStr}
            firstName={shareFirstName}
            graph={shareGraph}
            className="shrink-0"
          />
        ) : null}
      </div>

      {usersLoading && !usersError ? <ChartAccountSkeleton /> : null}
      {(usersError || (!usersLoading && !user)) && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-energy/50 bg-energy/10 px-4 py-3 text-sm text-energy-ink">
          {usersError && <span>{t("chart.people.accountLoadIssue", { error: usersError })}</span>}
          {!usersLoading && !user && <span>{t("chart.people.noDevUser")}</span>}
          {(usersError || (!usersLoading && !user)) && (
            <button
              type="button"
              className="min-h-10 rounded-lg border border-energy-ink px-3 py-2.5 text-sm hover:bg-energy/15"
              onClick={() => refreshUsers()}
            >
              {t("chart.people.retryUser")}
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
                <div className="text-sm font-semibold text-fg">
                  {firstRunYouReveal
                    ? t("chart.firstRun.editDetails")
                    : t("chart.people.editSwitchPerson")}
                </div>
                <div className="mt-0.5 truncate text-xs text-fg-muted">
                  {activePersonLabel}
                  {typeKey ? ` · ${typeKey}` : ""}
                  {profileStr ? ` · ${profileStr}` : ""}
                  {viewMode === "preview" ? ` · ${t("chart.people.preview")}` : ""}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {canCreatePeople ? (
                  <button
                    type="button"
                    data-testid="add-new-person"
                    disabled={busy}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startNewPerson();
                    }}
                    className="min-h-10 rounded-full border border-border bg-sunken px-3 py-2 text-xs font-medium text-fg hover:border-growth/50 disabled:opacity-60"
                  >
                    {t("chart.people.addNewPerson")}
                  </button>
                ) : null}
                <span className="shrink-0 text-xs text-fg-muted group-open:hidden">{t("chart.people.show")}</span>
                <span className="hidden shrink-0 text-xs text-fg-muted group-open:inline">{t("chart.people.hide")}</span>
              </div>
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

          {/* Narrow: Bodygraph above coach so map enters first viewport @~375.
              sm+: coach teaches first (desktop Ship Gate already green). */}
          <div className="flex flex-col gap-4">
          <div className="order-2 sm:order-1">
          <LiteracyCoach
            variant="chart"
            personName={chartPersonName}
            onJump={(targetId, meta) =>
              jumpToSection(targetId, meta?.deepDiveTab)
            }
          />
          </div>

          <div className="order-1 sm:order-2 grid gap-6 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
            <div
              id="bodygraph"
              className="scroll-mt-[calc(var(--app-header-h,4.5rem)+0.75rem)]"
            >
              <ChartBodygraph
                afterSvg={
                  <ChartTypeBox
                    key={`${viewMode}:${selectedSavedRow?.id ?? "unsaved"}:${searchParams.toString()}`}
                    actualType={typeKey}
                    personName={chartPersonName}
                    openStorageKey={
                      user && viewMode === "saved" && selectedSavedRow
                        ? { userId: user.id, chartId: selectedSavedRow.id }
                        : undefined
                    }
                    initialOpen={viewMode === "preview" && previewJustGenerated}
                    onReadMoreInDeepDive={() => jumpToSection("deep-dive-type")}
                  />
                }
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
                personality={personality}
                design={design}
                typeName={typeKey}
                profile={profileStr}
                authority={authorityStr}
                definition={definitionStr}
                ownerName={chartPersonName}
                selectedCenter={selectedCenter}
                onSelectCenter={onSelectCenter}
                onInspectDeepDive={onInspectCenter}
              />
            </div>

            <div id="snapshot" className="space-y-4">
              {firstRunYouReveal && (
                <div className="space-y-2" data-testid="first-run-natal-reveal">
                  <p className="type-body text-fg" data-testid="first-run-natal-line">
                    {t("chart.firstRun.natalLine")}
                  </p>
                </div>
              )}
              <SnapshotExclusiveGroup key={chartNavKey}>
              <div className="grid items-start gap-3 sm:grid-cols-2">
                <ChartDisclosure
                  testId="snapshot-profile"
                  value={<span className="min-w-0 break-words">{profilePresentation(profileStr).value}</span>}
                  label={t("chart.people.profile")}
                >
                  <SnapshotProfileBody
                    profile={profileStr}
                    copy={snapshotProfileLine(profileStr, locale, snapshotPersonName)}
                  />
                  <ReadMoreInDeepDive
                    label={t("chart.people.readMoreInDeepDive")}
                    ariaLabel={t("chart.people.readMoreAboutProfileInDeepDive")}
                    testId="snapshot-profile-deep-dive-pointer"
                    rowId="deep-dive-profile"
                    onJump={() => jumpToSection("deep-dive-profile")}
                  />
                </ChartDisclosure>
                <ChartDisclosure
                  testId="snapshot-how-you-decide"
                  value={`${authorityStr} · ${strategyStr}`}
                  label={t("chart.people.howYouDecide")}
                >
                  <div className="type-caption uppercase tracking-wide text-fg-secondary">
                    {t("chart.people.strategy")}
                  </div>
                  <p className="mt-1 type-body text-fg-secondary" data-testid="snapshot-strategy-copy">
                    {(snapshotPersonName
                      ? snapshotStrategyOtherCopy(strategyStr, locale, snapshotPersonName)
                      : snapshotStrategyCopy(strategyStr, locale)) ?? strategyStr}
                  </p>
                  <div className="mt-3 type-caption uppercase tracking-wide text-fg-secondary">
                    {t("chart.people.authority")}
                  </div>
                  <p className="mt-1 type-body text-fg-secondary" data-testid="snapshot-authority-copy">
                    {(snapshotPersonName && snapshotAuthorityOtherPlain(authorityStr, locale, snapshotPersonName)) ||
                      AUTHORITY_PLAIN[authorityStr] ||
                      AUTHORITY_COPY[authorityStr]?.summary ||
                      authorityStr}
                  </p>
                  {needsEmotionalRespondConnector(strategyStr, authorityStr) ? (
                    <p className="mt-2 type-body text-fg-secondary" data-testid="snapshot-emotional-respond-connector">
                      {snapshotPersonName
                        ? SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR_OTHER[locale]
                        : SNAPSHOT_EMOTIONAL_RESPOND_CONNECTOR[locale]}
                    </p>
                  ) : null}
                  {viewMode === "saved" && savedTimeUnknown ? (
                    <p
                      className="mt-3 type-body text-fg-secondary"
                      data-testid="chart-time-unknown-caveat"
                    >
                      {t("chart.timeUnknownCaveat")}
                    </p>
                  ) : null}
                  <ReadMoreInDeepDive
                    label={t("chart.people.readMoreInDeepDive")}
                    ariaLabel={t("chart.people.readMoreAboutStrategyInDeepDive")}
                    testId="snapshot-how-you-decide-deep-dive-pointer"
                    rowId="deep-dive-strategy"
                    onJump={() => jumpToSection("deep-dive-strategy")}
                  />
                </ChartDisclosure>
              </div>

              {firstRunYouReveal && (
                <p>
                  <Link
                    href="/transits"
                    data-testid="first-run-see-todays-move"
                    className="type-body text-growth underline-offset-2 hover:underline"
                  >
                    {t("chart.firstRun.seeTodaysMove")}
                  </Link>
                </p>
              )}

              {watch.length > 0 && (
                <ChartDisclosure
                  id="snapshot-centers"
                  testId="snapshot-centers"
                  openOnHash
                  value={watch.map((w) => displayCenter(w.center)).join(" · ")}
                  label={t("chart.people.centersToWatch")}
                >
                  <p className="mb-2 type-caption text-fg-secondary">
                    {snapshotPersonName
                      ? snapshotCentersOtherHelp(locale, snapshotPersonName)
                      : t("chart.people.openCentersHelp")}
                  </p>
                  <ul className="space-y-2">
                    {watch.map((w) => (
                      <li key={w.center} className="type-body text-fg-secondary">
                        <span className="font-medium text-fg">{displayCenter(w.center)}</span>
                        {" — "}
                        {(snapshotPersonName && snapshotCenterOtherTip(w.center, locale, snapshotPersonName)) || w.tip}
                      </li>
                    ))}
                  </ul>
                </ChartDisclosure>
              )}

              <ChartDisclosure
                testId="snapshot-definition"
                value={definitionStr}
                label={t("chart.people.definition")}
              >
                <p className="type-body text-fg-secondary" data-testid="snapshot-definition-copy">
                  {(snapshotPersonName
                    ? snapshotDefinitionOtherCopy(definitionStr, locale, snapshotPersonName)
                    : snapshotDefinitionCopy(definitionStr, locale)) ?? definitionStr}
                </p>
                <ReadMoreInDeepDive
                  label={t("chart.people.readMoreInDeepDive")}
                  ariaLabel={t("chart.people.readMoreAboutDefinitionInDeepDive")}
                  testId="snapshot-definition-deep-dive-pointer"
                  rowId="deep-dive-definition"
                  onJump={() => jumpToSection("deep-dive-definition")}
                />
              </ChartDisclosure>

              {environmentName && (
                <ChartDisclosure
                  testId="snapshot-environment"
                  value={snapshotEnvironmentValue(environmentName, locale, environmentApprox)}
                  label={t("chart.people.environment")}
                >
                  {environmentApprox ? (
                    <p
                      className="mb-2 type-body text-fg-secondary"
                      data-testid="snapshot-environment-approx-caveat"
                    >
                      {SNAPSHOT_ENVIRONMENT_APPROX_CAVEAT[locale]}
                    </p>
                  ) : null}
                  <p className="type-body text-fg-secondary" data-testid="snapshot-environment-copy">
                    {snapshotEnvironmentCopy(environmentName, locale, snapshotPersonName)}
                  </p>
                </ChartDisclosure>
              )}
              </SnapshotExclusiveGroup>
            </div>
          </div>
          </div>

          <ChartDeepDive
            personName={snapshotPersonName}
            key={chartNavKey}
            chart={chart}
            personality={personality}
            design={design}
            domain={deepDiveDomain}
            onDomainChange={(next) => {
              setDeepDiveDomain(next);
              if (next !== "core") setDeepDiveRow(null);
            }}
            openCoreRow={deepDiveRow}
            onOpenCoreRow={setDeepDiveRow}
            openCenter={openCenter}
            onOpenCenter={setOpenCenter}
          />
        </>
      )}
    </div>
  );
}

export default function ProfilePageRoute() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ProfilePage />
    </Suspense>
  );
}
