"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type LiteracyHowToReadOpenOpts = {
  /** Open the reader at this step id (pulse). Omit to start at the top. */
  stepId?: string;
  /** Control that opened the reader; X / Escape / Back return focus here. */
  returnFocus?: HTMLElement | null;
};

export type LiteracyHowToReadController = {
  open: (opts?: LiteracyHowToReadOpenOpts) => void;
};

type LiteracyHowToReadContextValue = {
  /** True only while that page's LiteracyCoach is mounted and can open. */
  available: boolean;
  open: (opts?: LiteracyHowToReadOpenOpts) => void;
  register: (controller: LiteracyHowToReadController | null) => void;
};

const LiteracyHowToReadContext = createContext<LiteracyHowToReadContextValue | null>(
  null
);

export function LiteracyHowToReadProvider({ children }: { children: ReactNode }) {
  const [available, setAvailable] = useState(false);
  const controllerRef = useRef<LiteracyHowToReadController | null>(null);

  const register = useCallback((controller: LiteracyHowToReadController | null) => {
    controllerRef.current = controller;
    setAvailable(Boolean(controller));
  }, []);

  const open = useCallback((opts?: LiteracyHowToReadOpenOpts) => {
    controllerRef.current?.open(opts);
  }, []);

  const value = useMemo(
    () => ({ available, open, register }),
    [available, open, register]
  );

  return (
    <LiteracyHowToReadContext.Provider value={value}>
      {children}
    </LiteracyHowToReadContext.Provider>
  );
}

export function useLiteracyHowToRead(): LiteracyHowToReadContextValue {
  const ctx = useContext(LiteracyHowToReadContext);
  if (!ctx) {
    throw new Error("useLiteracyHowToRead must be used within LiteracyHowToReadProvider");
  }
  return ctx;
}

/** Header / pages that may render outside the provider in tests. */
export function useLiteracyHowToReadOptional(): LiteracyHowToReadContextValue | null {
  return useContext(LiteracyHowToReadContext);
}
