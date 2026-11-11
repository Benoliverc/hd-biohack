"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CityPicker } from "@/components/CityPicker";
import { useI18n } from "@/lib/i18n";

export type FirstRunBirth = {
  birthDate: string;
  birthTime: string;
  birthCity: string;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  timeUnknown: boolean;
};

type FieldErrors = {
  date?: string;
  time?: string;
  city?: string;
};

type Props = {
  firstName: string | null;
  birth: FirstRunBirth;
  onChange: (patch: Partial<FirstRunBirth>) => void;
  busy: boolean;
  ready: boolean;
  saveError: string | null;
  onSave: () => void;
};

export function FirstRunChartForm({
  firstName,
  birth,
  onChange,
  busy,
  ready,
  saveError,
  onSave,
}: Props) {
  const { t } = useI18n();
  const dateRef = useRef<HTMLInputElement>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const name = (firstName || "").trim();
  const cityPinned = birth.lat != null && birth.lon != null;

  useEffect(() => {
    if (!ready) return;
    const mq = window.matchMedia("(min-width: 640px)");
    if (mq.matches) dateRef.current?.focus();
  }, [ready]);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!birth.birthDate) next.date = t("chart.firstRun.errorDate");
    if (!birth.timeUnknown && !birth.birthTime) next.time = t("chart.firstRun.errorTime");
    if (!cityPinned) next.city = t("chart.firstRun.errorCity");
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (busy || !ready) return;
    if (!validate()) return;
    onSave();
  };

  return (
    <form
      className="mx-auto max-w-xl"
      data-testid="first-run-chart-form"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="rounded-2xl border border-border bg-elevated p-5 shadow-soft sm:p-6">
        <h1 className="type-title text-fg">{t("chart.firstRun.title")}</h1>
        <p className="mt-2 type-body text-fg">
          {name
            ? t("chart.firstRun.leadNamed", { name })
            : t("chart.firstRun.lead")}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-fg">{t("chart.firstRun.dateLabel")}</span>
            <input
              ref={dateRef}
              type="date"
              data-testid="first-run-birth-date"
              className="min-h-11 w-full rounded-lg border border-border bg-sunken px-3 py-2 disabled:cursor-wait disabled:opacity-60"
              value={birth.birthDate}
              onChange={(e) => {
                onChange({ birthDate: e.target.value });
                if (fieldErrors.date) setFieldErrors((prev) => ({ ...prev, date: undefined }));
              }}
              disabled={!ready || busy}
              autoComplete="bday"
            />
            {fieldErrors.date && (
              <p className="mt-1 type-caption text-danger" data-testid="first-run-date-error">
                {fieldErrors.date}
              </p>
            )}
          </label>
          <div className="text-sm">
            <label className="block">
              <span className="mb-1 block text-fg">{t("chart.firstRun.timeLabel")}</span>
              <input
                type="time"
                step={60}
                data-testid="first-run-birth-time"
                className="min-h-11 w-full rounded-lg border border-border bg-sunken px-3 py-2 disabled:cursor-wait disabled:opacity-60"
                value={birth.birthTime}
                onChange={(e) => {
                  onChange({ birthTime: e.target.value });
                  if (fieldErrors.time) setFieldErrors((prev) => ({ ...prev, time: undefined }));
                }}
                disabled={!ready || busy || birth.timeUnknown}
              />
            </label>
            {fieldErrors.time && (
              <p className="mt-1 type-caption text-danger" data-testid="first-run-time-error">
                {fieldErrors.time}
              </p>
            )}
            <label className="mt-2 flex min-h-11 items-start gap-2 text-fg">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 rounded border-border"
                data-testid="first-run-time-unknown"
                checked={birth.timeUnknown}
                onChange={(e) => {
                  const on = e.target.checked;
                  onChange({ timeUnknown: on });
                  if (on && fieldErrors.time) {
                    setFieldErrors((prev) => ({ ...prev, time: undefined }));
                  }
                }}
                disabled={!ready || busy}
              />
              <span className="type-body">{t("chart.timeUnknown")}</span>
            </label>
            {birth.timeUnknown ? (
              <p className="mt-1 type-caption text-fg-secondary" data-testid="first-run-time-unknown-disclosure">
                {t("chart.timeUnknownDisclosure")}
              </p>
            ) : null}
            <span className="mt-1 block type-caption text-fg">
              {t("chart.firstRun.timeCaption")}
            </span>
          </div>
          <div className="sm:col-span-2">
            <CityPicker
              variant="first-run"
              value={birth.birthCity}
              lat={birth.lat}
              lon={birth.lon}
              timezone={birth.timezone}
              birthDate={birth.birthDate}
              birthTime={birth.birthTime}
              fieldError={fieldErrors.city ?? null}
              onChange={(city, lat, lon, timezone) => {
                onChange({
                  birthCity: city,
                  lat,
                  lon,
                  timezone: timezone === undefined ? birth.timezone : timezone,
                });
                if (lat != null && lon != null && fieldErrors.city) {
                  setFieldErrors((prev) => ({ ...prev, city: undefined }));
                }
              }}
              disabled={!ready || busy}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            data-testid="first-run-save"
            disabled={busy || !ready}
            className="min-h-11 w-full rounded-xl bg-growth px-4 py-2.5 text-sm font-medium text-fg-inverse hover:bg-growth-deep disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {busy ? t("chart.firstRun.saving") : t("chart.firstRun.save")}
          </button>
        </div>

        {saveError && (
          <div
            className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-danger/50 bg-danger/10 px-3 py-2"
            data-testid="first-run-save-error"
          >
            <p className="type-body text-danger">{saveError}</p>
            <button
              type="submit"
              className="min-h-10 rounded-lg border border-danger/40 px-3 py-2 type-caption font-medium text-danger hover:bg-danger/10"
              disabled={busy || !ready}
            >
              {t("chart.firstRun.retry")}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
