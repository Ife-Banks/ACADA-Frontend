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

  if (data.role) {
    Cookies.set("role", data.role, cookieOpts);
  }
  if (data.tenant?.code) {
    Cookies.set("tenant_code", data.tenant.code, cookieOpts);
  }

  return data;
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
 */
export async function logout() {
  const refresh = Cookies.get("refresh_token");
  try {
    if (refresh) {
      await api.post("/auth/logout/", { refresh });
    }
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
