"use client";

/**
 * useMembers — React Query hooks for the members module.
 *
 * Query keys live in the shared factory (src/lib/query-keys.ts) so any
 * mutation can invalidate a domain root and refresh every member sub-query
 * (list, pending queue, detail, profile) with one call.
 */

import { useQuery } from "@tanstack/react-query";
import {
  getAllMembers,
  getGuarantorCandidates,
  getMembers,
  getMember,
  getMemberProfile,
  getPendingMembers,
} from "@/lib/api/members";
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

/**
 * Loads every member across pages so search/filter can run client-side.
 *
 * Use only on screens that need the full roster — the admin list. A member
 * is served the directory (names and email only), and the guarantor picker
 * uses `useGuarantorCandidates` instead.
 */
export function useAllMembers(enabled = true) {
  return useQuery({
    queryKey: qk.members.all,
    queryFn: () => getAllMembers(),
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

/**
 * The members who can be named as a guarantor.
 *
 * A narrow list — no employee numbers, no payroll numbers, no bank details.
 * This is what the member portal's loan application form uses, so a member
 * never has to download the whole roster to pick a guarantor.
 */
export function useGuarantorCandidates(enabled = true) {
  return useQuery({
    queryKey: qk.members.guarantorCandidates,
    queryFn: getGuarantorCandidates,
    enabled,
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