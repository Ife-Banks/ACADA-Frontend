"use client";

/**
 * useAuth — primary auth hook for components.
 *
 * Exposes the session, login/logout actions, and convenience
 * helpers so components don't need to import AuthContext directly.
 *
 * The helpers are derived from `src/lib/roles.ts`, which is the single
 * source of truth for the access model shared with the backend.
 *
 * Usage:
 *   const { user, role, tenant, login, logout, isLoading } = useAuth()
 */

import { useAuthContext } from "@/lib/auth-context";
import {
  CONTRIBUTION_WRITE_ROLES,
  FINANCIAL_READ_ROLES,
  LOAN_APPROVAL_ROLES,
  LOAN_READ_ROLES,
  MEMBER_MANAGEMENT_ROLES,
  SCHEDULE_ROLES,
  SOCIETY_CONFIG_ROLES,
} from "@/lib/roles";
import type { UserRole } from "@/lib/types";

export function useAuth() {
  const { session, isLoading, login, logout } = useAuthContext();
  const role = session?.role ?? null;

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!role) return false;
    const allowed = Array.isArray(roles) ? roles : [roles];
    return (allowed as string[]).includes(role);
  };

  return {
    /** Full session object (null when logged out) */
    session,
    /** True while rehydrating from cookies on first render */
    isLoading,
    /** Shortcut: current user object */
    user: session?.user ?? null,
    /** Shortcut: current role code */
    role,
    /** Shortcut: current tenant info */
    tenant: session?.tenant ?? null,
    /** True when a session exists */
    isAuthenticated: session !== null,
    /** True when the user is a platform super admin */
    isPlatformAdmin: role === "SUPER_ADMIN",
    /**
     * True when the user may *act* as an officer — i.e. may confirm
     * contributions, decide loans, generate schedules. A read-only
     * COMMITTEE_MEMBER is deliberately excluded.
     */
    isExecutiveOrAbove: hasRole(["EXECUTIVE", "SOCIETY_ADMIN"]),
    /** True when the user is society admin (president) */
    isSocietyAdmin: role === "SOCIETY_ADMIN",
    /** True when the user may read the society's financials */
    canReadFinancials: hasRole([...FINANCIAL_READ_ROLES]),
    /** True when the user may read the society's loans */
    canReadLoans: hasRole([...LOAN_READ_ROLES]),
    /** True when the user may confirm contributions */
    canConfirmContributions: hasRole([...CONTRIBUTION_WRITE_ROLES]),
    /** True when the user may decide a loan application */
    canApproveLoans: hasRole([...LOAN_APPROVAL_ROLES]),
    /** True when the user may generate and export deduction schedules */
    canManageSchedules: hasRole([...SCHEDULE_ROLES]),
    /** True when the user may manage members and their roles */
    canManageMembers: hasRole([...MEMBER_MANAGEMENT_ROLES]),
    /** True when the user may configure society settings, plans and products */
    canConfigureSociety: hasRole([...SOCIETY_CONFIG_ROLES]),
    /** Role-check helper: hasRole("EXECUTIVE") or hasRole(["EXECUTIVE","SOCIETY_ADMIN"]) */
    hasRole,
    login,
    logout,
  };
}
