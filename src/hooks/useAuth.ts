"use client";

/**
 * useAuth — primary auth hook for components.
 *
 * Exposes the session, login/logout actions, and convenience
 * helpers so components don't need to import AuthContext directly.
 *
 * Usage:
 *   const { user, role, tenant, login, logout, isLoading } = useAuth()
 */

import { useAuthContext } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";

export function useAuth() {
  const { session, isLoading, login, logout } = useAuthContext();

  return {
    /** Full session object (null when logged out) */
    session,
    /** True while rehydrating from cookies on first render */
    isLoading,
    /** Shortcut: current user object */
    user: session?.user ?? null,
    /** Shortcut: current role code */
    role: session?.role ?? null,
    /** Shortcut: current tenant info */
    tenant: session?.tenant ?? null,
    /** True when a session exists */
    isAuthenticated: session !== null,
    /** True when the user is a platform super admin */
    isPlatformAdmin: session?.role === "SUPER_ADMIN",
    /** True when the user can access executive-level features */
    isExecutiveOrAbove: (
      session?.role === "SOCIETY_ADMIN" ||
      session?.role === "EXECUTIVE"
    ),
    /** True when the user is society admin (president) */
    isSocietyAdmin: session?.role === "SOCIETY_ADMIN",
    /** Role-check helper: hasRole("EXECUTIVE") or hasRole(["EXECUTIVE","SOCIETY_ADMIN"]) */
    hasRole: (roles: UserRole | UserRole[]) => {
      if (!session?.role) return false;
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(session.role);
    },
    login,
    logout,
  };
}
