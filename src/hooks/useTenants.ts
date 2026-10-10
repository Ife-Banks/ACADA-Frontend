"use client";

/**
 * useTenants — React Query hooks for the platform tenants module.
 *
 * SUPER_ADMIN only. Tenant lists/details are operational (60 s); settings and
 * rule sets refresh with the domain. Mutations (create/update/branding/
 * settings/activate/suspend) invalidate the tenants domain root.
 */

import { useQuery } from "@tanstack/react-query";
import {
  getTenants,
  getTenant,
  getTenantSettings,
  getTenantRules,
} from "@/lib/api/tenants";
import { qk } from "@/lib/query-keys";

const SIXTY_SEC = 60_000;

export function useTenants(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: qk.tenants.all(page, pageSize),
    queryFn: () => getTenants(),
    placeholderData: (prev) => prev,
    staleTime: SIXTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: qk.tenants.detail(id),
    queryFn: () => getTenant(id),
    enabled: !!id,
    staleTime: SIXTY_SEC,
  });
}

export function useTenantSettings(id: string) {
  return useQuery({
    queryKey: qk.tenants.settings(id),
    queryFn: () => getTenantSettings(id),
    enabled: !!id,
    staleTime: SIXTY_SEC,
  });
}

export function useTenantRules(id: string) {
  return useQuery({
    queryKey: qk.tenants.rules(id),
    queryFn: () => getTenantRules(id),
    enabled: !!id,
    staleTime: SIXTY_SEC,
  });
}