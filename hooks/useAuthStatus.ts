// Trạng thái unlock dùng chung cho header + trang list.
// "use client";
"use client";

import { useCallback, useEffect, useState } from "react";

export function useAuthStatus() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const r = await fetch("/api/auth/status", { cache: "no-store" });
      const j = (await r.json()) as { unlocked?: boolean };
      setUnlocked(!!j.unlocked);
    } catch {
      setUnlocked(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUnlocked(false);
    }
  }, []);

  return { unlocked, checking, refresh, logout, setUnlocked };
}
