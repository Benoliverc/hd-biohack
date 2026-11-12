"use client";

import { useEffect, useRef } from "react";
import { api, type User } from "./api";
import {
  DEVICE_TZ_SYNC_DEBOUNCE_MS,
  detectDeviceTimezone,
  deviceTimezoneSignalChanged,
  readDeviceTimezoneSignal,
  syncDeviceTimezoneForUser,
} from "./deviceTimezone";

type Args = {
  sessionReady: boolean;
  user: User | null;
  mergeUser: (incoming: User) => void;
};

/**
 * After session ready, keep the signed-in account timezone in sync with the device.
 * Re-checks on visibility (foreground) and window focus, debounced, and PATCHes
 * only when the detected IANA name is valid and different from what is stored.
 */
export function useDeviceTimezoneSync({ sessionReady, user, mergeUser }: Args) {
  const userRef = useRef(user);
  userRef.current = user;
  const mergeRef = useRef(mergeUser);
  mergeRef.current = mergeUser;
  const signalRef = useRef<ReturnType<typeof readDeviceTimezoneSignal> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRunForUser = useRef<number | null>(null);

  useEffect(() => {
    if (!sessionReady || !user) {
      firstRunForUser.current = null;
      signalRef.current = null;
      return;
    }

    const run = async () => {
      const current = userRef.current;
      if (!current) return;
      const result = await syncDeviceTimezoneForUser(current, {
        detect: detectDeviceTimezone,
        patch: api.patchUserSettings,
      });
      if (result.status === "patched") {
        mergeRef.current(result.user);
      }
      // Leave the signal dirty after a failed PATCH so the next foreground re-check retries.
      if (result.status !== "failed") {
        signalRef.current = readDeviceTimezoneSignal();
      }
    };

    const schedule = (immediate: boolean) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const kick = () => {
        const next = readDeviceTimezoneSignal();
        if (!deviceTimezoneSignalChanged(signalRef.current, next) && firstRunForUser.current === user.id) {
          return;
        }
        void run();
      };
      if (immediate) {
        kick();
        return;
      }
      timerRef.current = setTimeout(kick, DEVICE_TZ_SYNC_DEBOUNCE_MS);
    };

    const immediate = firstRunForUser.current !== user.id;
    firstRunForUser.current = user.id;
    schedule(immediate);

    const onVisibility = () => {
      if (document.visibilityState === "visible") schedule(false);
    };
    const onFocus = () => schedule(false);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
    // Re-bind when the signed-in user changes, not on every mergeUser patch.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- user.id is the identity; body reads userRef
  }, [sessionReady, user?.id]);
}
