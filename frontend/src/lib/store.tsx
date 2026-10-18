"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, User } from "./api";

type AppState = {
  users: User[];
  user: User | null;
  setUserId: (id: number) => void;
  enforcePaywall: boolean;
  setEnforcePaywall: (v: boolean) => void;
  previewAsFree: boolean;
  setPreviewAsFree: (v: boolean) => void;
  natalChartId: number | null;
  setNatalChartId: (id: number | null) => void;
  refreshUsers: () => Promise<void>;
  biohackingUnlocked: boolean;
};

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [enforcePaywall, setEnforcePaywall] = useState(
    process.env.NEXT_PUBLIC_ENFORCE_PAYWALL === "true"
  );
  const [previewAsFree, setPreviewAsFree] = useState(false);
  const [natalChartId, setNatalChartId] = useState<number | null>(null);

  const refreshUsers = async () => {
    const list = await api.users();
    setUsers(list);
    if (!userId && list.length) setUserId(list[0].id);
  };

  useEffect(() => {
    refreshUsers().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user = useMemo(() => users.find((u) => u.id === userId) || null, [users, userId]);

  const biohackingUnlocked = useMemo(() => {
    if (!enforcePaywall) return true;
    if (previewAsFree) return false;
    return Boolean(user?.biohacking_enabled || user?.subscription_tier === "biohacker_pro");
  }, [enforcePaywall, previewAsFree, user]);

  return (
    <Ctx.Provider
      value={{
        users,
        user,
        setUserId: (id) => setUserId(id),
        enforcePaywall,
        setEnforcePaywall,
        previewAsFree,
        setPreviewAsFree,
        natalChartId,
        setNatalChartId,
        refreshUsers,
        biohackingUnlocked,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}
