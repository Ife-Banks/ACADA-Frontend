"use client";

/**
 * useMembers — React Query hooks for the members module.
 *
 * Query keys live in the shared factory (src/lib/query-keys.ts) so any
 * mutation can invalidate a domain root and refresh every member sub-query
 * (list, pending queue, detail, profile) with one call.
 */

import { useQuery } from "@tanstack/react-query";
import { getMembers, getMember, getMemberProfile, getPendingMembers } from "@/lib/api/members";
import { qk } from "@/lib/query-keys";

export type MembersListParams = {
  page?: number;
  page_size?: number;
};

export function useMembersList(params: MembersListParams = {}) {
  return useQuery({
    queryKey: qk.members.list(params.page ?? 1, params.page_size ?? 25),
    queryFn: () => getMembers(params),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function usePendingMembers() {
  return useQuery({
    queryKey: qk.members.pending,
    queryFn: getPendingMembers,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: qk.members.detail(id),
    queryFn: () => getMember(id),
    enabled: !!id,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useMemberProfile(id: string) {
  return useQuery({
    queryKey: qk.members.profile(id),
    queryFn: () => getMemberProfile(id),
    enabled: !!id,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}