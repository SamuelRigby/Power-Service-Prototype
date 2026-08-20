"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";

const TOKEN_STORAGE_KEY = "psp_token";
// Fired whenever login()/logout() change the token, so useSyncExternalStore
// re-reads localStorage in this same tab (the native "storage" event only
// fires in *other* tabs/windows).
const AUTH_CHANGE_EVENT = "psp-auth-change";

function subscribe(callback: () => void) {
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

// A value that's always false on the server and true on the client - the
// standard useSyncExternalStore trick for an "isHydrated" flag. This never
// changes after the initial client read, so the subscription is a no-op;
// the point is only to get a value that's guaranteed to differ between the
// server-rendered/pre-hydration pass and the real client pass, resolved the
// same way (and on the same timeline) as the token snapshot below.
function subscribeNever() {
  return () => {};
}

function getHydratedSnapshot(): boolean {
  return true;
}

function getHydratedServerSnapshot(): boolean {
  return false;
}

interface AuthContextValue {
  /** The JWT from a prior login, or null if not logged in. */
  token: string | null;
  /**
   * False until the first client render has committed. `token` is only
   * meaningful once this is true - before then it's the SSR placeholder
   * (always null), not a real "logged out" signal. Route guards must wait
   * for this before redirecting on a null token, or a real hard-reload of a
   * logged-in user bounces them to /login before the real value resolves.
   */
  isHydrated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribeNever,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  const login = useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }, []);

  return (
    <AuthContext.Provider value={{ token, isHydrated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
