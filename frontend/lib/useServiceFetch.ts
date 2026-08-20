"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ApiError, apiFetch, type ApiFetchOptions } from "./api";
import { useAuth } from "./auth";

/**
 * apiFetch, but for the authenticated /service area: attaches the stored
 * token automatically, and on a 401 (expired/invalid token) clears the
 * session and bounces to /login instead of leaving the page to fail silently.
 */
export function useServiceFetch() {
  const { token, logout } = useAuth();
  const router = useRouter();

  return useCallback(
    async function serviceFetch<T>(
      path: string,
      options: Omit<ApiFetchOptions, "token"> = {},
    ): Promise<T> {
      try {
        return await apiFetch<T>(path, { ...options, token: token ?? undefined });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.replace("/login");
        }
        throw err;
      }
    },
    [token, logout, router],
  );
}
