/**
 * Base API client.
 *
 * All requests go through `apiRequest`. It:
 *  - Reads the access token from cookies (client-side) or a passed header (server-side)
 *  - Attaches Authorization + Content-Type headers
 *  - Handles 401 by attempting a silent token refresh, then retrying once
 *  - Throws a typed ApiError on non-2xx responses so callers can handle codes
 *
 * Usage:
 *   import { apiRequest } from "@/lib/api/client"
 *   const data = await apiRequest<MyType>("GET", "/members/")
 */

import Cookies from "js-cookie";
import { ApiErrorBody } from "@/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ─── Error class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody
  ) {
    super(
      body?.detail ??
        body?.error ??
        `Request failed with status ${status}`
    );
    this.name = "ApiError";
  }

  /** True when the server returned a field-level validation error map */
  get isValidationError() {
    return this.status === 400;
  }

  /** Flat list of all error messages for display in a toast */
  get messages(): string[] {
    const msgs: string[] = [];
    for (const [key, val] of Object.entries(this.body)) {
      if (Array.isArray(val)) msgs.push(...val.map(String));
      else if (typeof val === "string") msgs.push(val);
    }
    return msgs.length ? msgs : [this.message];
  }
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | undefined {
  return Cookies.get("access_token");
}

export function getRefreshToken(): string | undefined {
  return Cookies.get("refresh_token");
}

export function setTokens(access: string, refresh: string) {
  // httpOnly would be ideal but requires a server route.
  // For this SPA, we use js-cookie with SameSite=Strict + Secure in prod.
  const opts: Cookies.CookieAttributes = {
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  };
  Cookies.set("access_token", access, { ...opts, expires: 1 / 48 }); // 30 min
  Cookies.set("refresh_token", refresh, { ...opts, expires: 7 });    // 7 days
}

export function clearTokens() {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  Cookies.remove("role");
  Cookies.remove("tenant_code");
}

// ─── Silent refresh ───────────────────────────────────────────────────────────

let refreshPromise: Promise<string> | null = null;

async function silentRefresh(): Promise<string> {
  // Deduplicate — only one refresh at a time across concurrent requests
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new ApiError(401, { detail: "No refresh token." });

    const res = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      clearTokens();
      throw new ApiError(401, { detail: "Session expired. Please log in again." });
    }

    const data = await res.json();
    setTokens(data.access, data.refresh ?? refresh);
    return data.access as string;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ─── Core request function ────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  /** Pass for server-side calls where cookies aren't available */
  accessToken?: string;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Query params appended to the URL */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Disable the automatic 401 refresh+retry */
  skipRefresh?: boolean;
}

export async function apiRequest<T = unknown>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const token = options.accessToken ?? getAccessToken();

  const url = new URL(`${BASE_URL}${path}`);
  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 401 → try silent refresh once, then retry
  if (res.status === 401 && !options.skipRefresh) {
    try {
      const newToken = await silentRefresh();
      return apiRequest<T>(method, path, body, {
        ...options,
        accessToken: newToken,
        skipRefresh: true,
      });
    } catch {
      // Refresh failed — let the 401 propagate so the auth context can redirect
      throw new ApiError(401, await res.json().catch(() => ({})));
    }
  }

  // No content
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data as ApiErrorBody);
  }

  return data as T;
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, params?: RequestOptions["params"], opts?: RequestOptions) =>
    apiRequest<T>("GET", path, undefined, { ...opts, params }),

  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>("POST", path, body, opts),

  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>("PUT", path, body, opts),

  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>("PATCH", path, body, opts),

  delete: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>("DELETE", path, undefined, opts),
};
