/**
 * Auth API — login, register, logout, refresh, me, password change.
 */

import { api, setTokens, clearTokens } from "./client";
import Cookies from "js-cookie";
import type {
  LoginResponse,
  MeResponse,
  UserRole,
} from "@/lib/types";

export interface LoginPayload {
  email: string;
  password: string;
  tenant_code?: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  password_confirm: string;
  tenant_code?: string;
}

export interface PasswordChangePayload {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

/**
 * Log in and persist tokens + role to cookies.
 * Returns the full login response so the auth context can hydrate.
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>("/auth/login/", payload, {
    skipRefresh: true,
  });

  setTokens(data.access, data.refresh);

  const cookieOpts: Cookies.CookieAttributes = {
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: 7,
  };

  /**
   * Platform users authenticate without a tenant, so the backend omits
   * `role` from the response. Infer SUPER_ADMIN from `is_platform_user`
   * so the middleware can let them into /platform.
   */
  const role: UserRole | undefined =
    data.role ?? (data.user.is_platform_user ? "SUPER_ADMIN" : undefined);

  if (role) {
    Cookies.set("role", role, cookieOpts);
  } else {
    // Clear a stale role from a previous session.
    Cookies.remove("role");
  }
  if (data.tenant?.code) {
    Cookies.set("tenant_code", data.tenant.code, cookieOpts);
  } else {
    // Platform users have no tenant; don't leave a previous society behind.
    Cookies.remove("tenant_code");
  }

  return { ...data, role };
}

/**
 * Register a new user. Optionally pass tenant_code for a pending membership.
 */
export async function register(payload: RegisterPayload) {
  return api.post<{ detail: string; user: { id: string; email: string; full_name: string } }>(
    "/auth/register/",
    payload,
    { skipRefresh: true }
  );
}

/**
 * Blacklist the refresh token and clear all local cookies.
 *
 * Signing out must always succeed locally, so a failed server call (an
 * already-expired token, a platform account with no tenant) is swallowed —
 * the cookies are cleared either way.
 */
export async function logout() {
  const refresh = Cookies.get("refresh_token");
  try {
    if (refresh) {
      await api.post("/auth/logout/", { refresh });
    }
  } catch {
    /* The local session is cleared below regardless. */
  } finally {
    clearTokens();
  }
}

/**
 * Get the current authenticated user with their membership list.
 */
export async function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>("/auth/me/");
}

/**
 * Change the authenticated user's password.
 */
export async function changePassword(payload: PasswordChangePayload) {
  return api.post<{ detail: string }>("/auth/password/change/", payload);
}
