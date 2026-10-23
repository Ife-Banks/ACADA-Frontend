/**
 * Platform tenants API — SUPER_ADMIN only.
 */

import { api } from "./client";
import type {
  TenantSummary,
  TenantDetail,
  TenantBranding,
  TenantSettings,
  TenantRuleSet,
  CreateTenantPayload,
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types";

export async function getTenants(params?: PaginationParams) {
  return api.get<PaginatedResponse<TenantSummary>>("/platform/tenants/", params);
}

/**
 * Fetch every tenant. The list endpoint is ordered by name rather than
 * creation date, so screens that need "newest first" must sort client-side.
 */
export async function getAllTenants(pageSize = 100, maxPages = 20) {
  const all: TenantSummary[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const res = await getTenants({ page, page_size: pageSize });
    all.push(...res.results);
    if (!res.next) break;
  }

  return all;
}

export async function getTenant(id: string) {
  return api.get<TenantDetail>(`/platform/tenants/${id}/`);
}

export async function createTenant(payload: CreateTenantPayload) {
  return api.post<TenantDetail>("/platform/tenants/", payload);
}

export async function updateTenant(id: string, payload: Partial<TenantDetail>) {
  return api.patch<TenantDetail>(`/platform/tenants/${id}/`, payload);
}

export async function updateTenantBranding(id: string, payload: Partial<TenantBranding>) {
  return api.patch<TenantBranding>(`/platform/tenants/${id}/branding/`, payload);
}

export async function getTenantSettings(id: string) {
  return api.get<TenantSettings>(`/platform/tenants/${id}/settings/`);
}

export async function updateTenantSettings(id: string, payload: Partial<TenantSettings>) {
  return api.patch<TenantSettings>(`/platform/tenants/${id}/settings/`, payload);
}

export async function getTenantRules(id: string) {
  return api.get<TenantRuleSet[]>(`/platform/tenants/${id}/rules/`);
}

export async function createTenantRuleSet(id: string, payload: Partial<TenantRuleSet>) {
  return api.post<TenantRuleSet>(`/platform/tenants/${id}/rules/`, payload);
}

export async function activateTenant(id: string) {
  return api.post<{ detail: string }>(`/platform/tenants/${id}/activate/`);
}

export async function suspendTenant(id: string) {
  return api.post<{ detail: string }>(`/platform/tenants/${id}/suspend/`);
}

export async function deactivateTenant(id: string) {
  return api.post<{ detail: string }>(`/platform/tenants/${id}/deactivate/`);
}
