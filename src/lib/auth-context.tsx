"use client";

/**
 * AuthContext — single source of truth for the current session.
 *
 * Provides:
 *   - session   : tokens + user + tenant + role (null when logged out)
 *   - isLoading : true while we're rehydrating from cookies on first mount
 *   - login()   : calls the API, persists cookies, updates context
 *   - logout()  : clears cookies, resets context, redirects to /login
 *
 * Pattern: the context only stores what came back from the login response.
 * For richer user data (all memberships etc.) use the useCurrentUser hook
 * which calls GET /auth/me/ via React Query.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { login as apiLogin, logout as apiLogout, getMe } from "@/lib/api/auth";
import { clearTokens } from "@/lib/api/client";
import { ROLE_HOME, canRoleAccessPath } from "@/lib/roles";
import type { Session, UserRole } from "@/lib/types";
import type { LoginPayload } from "@/lib/api/auth";

// ─── Context shape ─────────────────────────────────────────────────────────

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Role → home route mapping ─────────────────────────────────────────────
// (imported from @/lib/roles so the proxy and the UI cannot disagree)

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * On mount, rehydrate session from cookies.
   * We store a minimal session snapshot in a "session" cookie at login
   * so we don't need an extra API call just to know who's logged in.
   */
  useEffect(() => {
    try {
      const raw = Cookies.get("session_snapshot");
      if (raw) {
        const parsed: Session = JSON.parse(raw);
        // Intentionally synchronous — cookie rehydration must match SSR render (logged-out) to avoid hydration mismatches, then flip once on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSession(parsed);
      }
    } catch {
      // Corrupt cookie — ignore and treat as logged out
      clearTokens();
      Cookies.remove("session_snapshot");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await apiLogin(payload);

      // Never reuse cached data from a previous user/tenant session.
      queryClient.clear();

      const newSession: Session = {
        access: data.access,
        refresh: data.refresh,
        user: data.user,
        tenant: data.tenant ?? null,
        role: (data.role as UserRole) ?? null,
      };

      // Persist a snapshot so we can rehydrate on page refresh
      Cookies.set("session_snapshot", JSON.stringify(newSession), {
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        expires: 7,
      });

      setSession(newSession);

      // Redirect to the correct portal for this role. A session with no
      // role is not usable — landing on "/" would look like the login
      // silently did nothing, so it is reported as an error instead.
      if (!newSession.role) {
        Cookies.remove("session_snapshot");
        setSession(null);
        clearTokens();
        throw new Error(
          "Your account is not linked to a cooperative society yet. Enter your society code, or ask your society administrator to add your membership.",
        );
      }

      /*
       * Deep link. The proxy sends an unauthenticated visitor to the login
       * page with `?next=` so they come back where they were going. Honour
       * it, but only when the role may actually open that path — and only
       * for a same-site path, so `?next=` cannot be used to bounce somebody
       * off to another site.
       */
      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      const home =
        next &&
        next.startsWith("/") &&
        !next.startsWith("//") &&
        canRoleAccessPath(newSession.role, next)
          ? next
          : ROLE_HOME[newSession.role];

      router.push(home);
    },
    [queryClient, router]
  );

  /**
   * Keep the session's role in step with the server.
   *
   * The `role` cookie is written at login, so an administrator who promotes
   * somebody would otherwise leave them running as their old role — including
   * the route gating — until they signed out and back in. `/auth/me/` is the
   * authoritative answer, so the role is reconciled from it on load.
   */
  useEffect(() => {
    if (!session?.access) return;
    let cancelled = false;

    const reconcile = async () => {
      try {
        const me = await getMe();
        if (cancelled) return;

        // Find the membership for the society this session is signed into.
        const tenantId = session.tenant?.id;
        const membership = me.memberships?.find(
          (m) => !tenantId || m.tenant_id === tenantId,
        );
        const serverRole = membership?.role as UserRole | undefined;
        if (!serverRole || serverRole === session.role) return;

        const updated: Session = { ...session, role: serverRole };
        Cookies.set("session_snapshot", JSON.stringify(updated), {
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          expires: 7,
        });
        Cookies.set("role", serverRole, {
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          expires: 7,
        });
        setSession(updated);
      } catch {
        /* The session stays as it is — the API is the real boundary. */
      }
    };

    void reconcile();
    return () => {
      cancelled = true;
    };
  }, [session?.access, session?.role, session?.tenant?.id]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      Cookies.remove("session_snapshot");
      queryClient.clear();
      setSession(null);
      router.push("/login");
    }
  }, [queryClient, router]);

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── useAuthContext (internal) ─────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
}
