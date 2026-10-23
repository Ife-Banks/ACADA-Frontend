import { NextRequest, NextResponse } from "next/server";
import { ROLE_HOME, canRoleAccessPath } from "@/lib/roles";

/**
 * Route protection middleware.
 *
 * Reads the access_token and role cookies set at login.
 * Redirects unauthenticated users to /login.
 * Redirects users to the correct portal based on their role.
 *
 * Role → portal mapping:
 *   SUPER_ADMIN      → /platform/stats
 *   SOCIETY_ADMIN    → /admin/members  (also has access to /executive/* and /member/*)
 *   EXECUTIVE        → /executive/dashboard
 *   COMMITTEE_MEMBER → /executive/dashboard (read-only, enforced server-side)
 *   MEMBER           → /member/dashboard
 *
 * The route sets live in `src/lib/roles.ts`, shared with the UI, so the
 * navigation and the middleware can never disagree.
 *
 * This is a navigation aid, not a security boundary. The `role` cookie is
 * readable by JavaScript, so the real boundary is the API — every endpoint
 * re-checks the caller's role and permission server-side.
 */

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths (with or without a trailing slash).
  const normalised = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (PUBLIC_PATHS.includes(normalised)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("role")?.value;

  // Not authenticated → send to login, remembering where they were going.
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated but no role (shouldn't happen, but guard it)
  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check the user is allowed into the requested path prefix
  if (!canRoleAccessPath(role, pathname)) {
    // Redirect to their home instead of a 403
    const home = ROLE_HOME[role] ?? "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public files
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
