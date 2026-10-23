/**
 * roles.ts — the single source of truth for what each role may do.
 *
 * The access model, matching the backend:
 *
 *   MEMBER            own contributions, own notifications, and the loan
 *                     applications they submitted or guarantee
 *   COMMITTEE_MEMBER read-only financials and loans
 *   EXECUTIVE         financials, contribution confirmation, schedules, loan
 *                     approvals
 *   SOCIETY_ADMIN     everything above, plus members, roles and society settings
 *   SUPER_ADMIN       cross-tenant platform endpoints
 *
 * The backend enforces the same model. These sets exist so the UI can hide
 * what the API would refuse, instead of rendering a button that 403s.
 *
 * Note the two axes:
 *   - *capability* — may the role perform the act at all (read vs write)
 *   - *visibility* — is the screen in the role's navigation
 *
 * A committee member may READ the ledger, so the ledger is visible to them;
 * but they may not generate a schedule, so schedules are not.
 */

/** Roles that may read the society's financials. */
export const FINANCIAL_READ_ROLES = [
  "COMMITTEE_MEMBER",
  "EXECUTIVE",
  "SOCIETY_ADMIN",
] as const;

/** Roles that may read the society's loans. */
export const LOAN_READ_ROLES = [
  "COMMITTEE_MEMBER",
  "EXECUTIVE",
  "SOCIETY_ADMIN",
] as const;

/** Roles that may confirm contributions — an officer task, not a member one. */
export const CONTRIBUTION_WRITE_ROLES = ["EXECUTIVE", "SOCIETY_ADMIN"] as const;

/** Roles that may decide a loan application. */
export const LOAN_APPROVAL_ROLES = ["EXECUTIVE", "SOCIETY_ADMIN"] as const;

/** Roles that may generate and export deduction schedules. */
export const SCHEDULE_ROLES = ["EXECUTIVE", "SOCIETY_ADMIN"] as const;

/** Roles that may manage members and their roles. */
export const MEMBER_MANAGEMENT_ROLES = ["SOCIETY_ADMIN"] as const;

/** Roles that may configure society settings, plans and loan products. */
export const SOCIETY_CONFIG_ROLES = ["SOCIETY_ADMIN"] as const;

/** Every route group a role may open. */
export const ROLE_ROUTE_PREFIXES: Record<string, string[]> = {
  SUPER_ADMIN: ["/platform"],
  SOCIETY_ADMIN: ["/admin", "/executive", "/member"],
  EXECUTIVE: ["/executive", "/member"],
  COMMITTEE_MEMBER: ["/executive", "/member"],
  MEMBER: ["/member"],
};

/** Where each role lands after signing in. */
export const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: "/platform/stats",
  SOCIETY_ADMIN: "/admin/members",
  EXECUTIVE: "/executive/dashboard",
  COMMITTEE_MEMBER: "/executive/dashboard",
  MEMBER: "/member/dashboard",
};

/**
 * Whether a role may open a path.
 *
 * The proxy uses it to decide where to bounce somebody, and the login flow
 * uses it to honour a `?next=` deep link — so a member sent to the login
 * page from `/member/loans` lands back on `/member/loans` rather than on
 * their home page, but only if their role may go there.
 */
export function canRoleAccessPath(role: string, pathname: string): boolean {
  const prefixes = ROLE_ROUTE_PREFIXES[role] ?? [];
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}
