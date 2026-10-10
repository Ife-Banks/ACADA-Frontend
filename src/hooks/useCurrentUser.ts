"use client";

/**
 * useCurrentUser — fetches the full /auth/me/ profile via React Query.
 *
 * Richer than what's in the session cookie: includes phone, status,
 * date_joined, last_login, and the complete list of tenant memberships.
 *
 * Only fetches when the user is authenticated. The query is cached for
 * 5 minutes and shared across all components that call this hook.
 *
 * Usage:
 *   const { data: me, isLoading, error } = useCurrentUser()
 */

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import { qk } from "@/lib/query-keys";
import { useAuth } from "./useAuth";

export function useCurrentUser() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: qk.session.currentUser,
    queryFn: getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
