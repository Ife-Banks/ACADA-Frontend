/**
 * Auth-related types — mirrors the backend login response and JWT claims.
 */

export type UserRole =
  | "SUPER_ADMIN"
  | "SOCIETY_ADMIN"
  | "EXECUTIVE"
  | "COMMITTEE_MEMBER"
  | "MEMBER";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  is_platform_user: boolean;
}

export interface TenantInfo {
  id: string;
  code: string;
  name: string;
}

/** Shape returned by POST /api/v1/auth/login/ */
export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
  tenant?: TenantInfo;
  role?: UserRole;
}

/** Shape returned by GET /api/v1/auth/me/ */
export interface MeResponse extends AuthUser {
  phone: string;
  status: string;
  date_joined: string;
  last_login: string | null;
  memberships: Array<{
    tenant_id: string;
    tenant_code: string;
    tenant_name: string;
    role: UserRole;
    role_name: string;
  }>;
}

/** Stored session — what we keep in cookies/context */
export interface Session {
  access: string;
  refresh: string;
  user: AuthUser;
  tenant: TenantInfo | null;
  role: UserRole | null;
}
