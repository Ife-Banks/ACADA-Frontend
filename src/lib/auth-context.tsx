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
import Cookies from "js-cookie";
import { login as apiLogin, logout as apiLogout } from "@/lib/api/auth";
import { clearTokens } from "@/lib/api/client";
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

const ROLE_HOME: Record<UserRole, string> = {
  SUPER_ADMIN:      "/platform/stats",
  SOCIETY_ADMIN:    "/admin/members",
  EXECUTIVE:        "/executive/dashboard",
  COMMITTEE_MEMBER: "/executive/dashboard",
  MEMBER:           "/member/dashboard",
};

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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

      // Redirect to the correct portal for this role
      const home =
        newSession.role ? ROLE_HOME[newSession.role] : "/";
      router.push(home);
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      Cookies.remove("session_snapshot");
      setSession(null);
      router.push("/login");
    }
  }, [router]);

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
