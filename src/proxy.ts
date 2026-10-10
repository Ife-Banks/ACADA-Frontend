import { NextRequest, NextResponse } from "next/server";

/**
 * Route protection middleware.
 *
 * Reads the access_token and role cookies set at login.
 * Redirects unauthenticated users to /login.
 * Redirects users to the correct portal based on their role.
 *
 * Role → portal mapping:
 *   SUPER_ADMIN   → /platform/stats
 *   SOCIETY_ADMIN → /admin/members  (also has access to /executive/*)
 *   EXECUTIVE     → /executive/dashboard
 *   COMMITTEE_MEMBER → /executive/dashboard (read-only, enforced server-side)
 *   MEMBER        → /member/dashboard
 */

const PUBLIC_PATHS = ["/", "/login", "/register"];

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN:      "/platform/stats",
  SOCIETY_ADMIN:    "/admin/members",
  EXECUTIVE:        "/executive/dashboard",
  COMMITTEE_MEMBER: "/executive/dashboard",
  MEMBER:           "/member/dashboard",
};

// Which path prefixes each role is allowed into
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  SUPER_ADMIN:      ["/platform"],
  SOCIETY_ADMIN:    ["/admin", "/executive", "/member"],
  EXECUTIVE:        ["/executive", "/member"],
  COMMITTEE_MEMBER: ["/executive", "/member"],
  MEMBER:           ["/member"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("role")?.value;

  // Not authenticated → send to login
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
  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role] ?? [];
  const isAllowed = allowedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isAllowed) {
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
