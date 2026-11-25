import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SIGNED_OUT_EVENT, callAdmin, readToken, writeToken } from "@/lib/db-client";

const AdminContext = createContext(null);

/**
 * Dashboard sign-in state, using this site's own access-code system:
 * "loading" → checking, "setup" → no owner code yet (claim with ADMIN_SETUP_KEY),
 * "locked" → enter the access code, "unlocked" → dashboard open.
 * The session token lives in sessionStorage and expires after 8 hours.
 */
export function AdminProvider({ children }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("loading");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [loadError, setLoadError] = useState("");

  const check = useCallback(async () => {
    setLoadError("");
    try {
      if (readToken()) {
        const session = await callAdmin("session");
        if (session?.ok) {
          setName(session.name || "Owner");
          setBusinessName(session.businessName || "");
          setExpiresAt(session.expiresAt || null);
          setStatus("unlocked");
          return;
        }
        writeToken(null);
      }
      const state = await callAdmin("status");
      if (!state?.ok) {
        setLoadError(state?.error || "The dashboard could not reach the database.");
        setStatus("error");
        return;
      }
      setBusinessName(state.businessName || "");
      setStatus(state.claimed ? "locked" : "setup");
    } catch {
      setLoadError("The dashboard could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    check();
    const onSignedOut = () => {
      queryClient.clear();
      setStatus("locked");
    };
    window.addEventListener(SIGNED_OUT_EVENT, onSignedOut);
    return () => window.removeEventListener(SIGNED_OUT_EVENT, onSignedOut);
  }, [check, queryClient]);

  const startSession = useCallback((res) => {
    writeToken(res.token);
    setName(res.name || "Owner");
    setExpiresAt(res.expiresAt || null);
    setStatus("unlocked");
  }, []);

  const login = useCallback(
    async (code) => {
      const res = await callAdmin("login", { code });
      if (res?.ok) startSession(res);
      else if (res?.code === "NEEDS_SETUP") setStatus("setup");
      return res;
    },
    [startSession],
  );

  const claim = useCallback(
    async (code, setupKey) => {
      const res = await callAdmin("claim", { code, setupKey });
      if (res?.ok) startSession(res);
      return res;
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    const hadToken = Boolean(readToken());
    if (hadToken) await callAdmin("logout").catch(() => null);
    writeToken(null);
    queryClient.clear();
    setStatus("locked");
  }, [queryClient]);

  const changeCode = useCallback((currentCode, newCode) => callAdmin("changeCode", { currentCode, newCode }), []);

  const value = useMemo(
    () => ({ status, name, businessName, expiresAt, loadError, login, claim, logout, changeCode, retry: check }),
    [status, name, businessName, expiresAt, loadError, login, claim, logout, changeCode, check],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within <AdminProvider>");
  return ctx;
}
