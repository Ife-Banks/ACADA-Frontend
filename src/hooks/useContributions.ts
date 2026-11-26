"use client";

/**
 * useContributions — React Query hooks for the contributions module.
 *
 * Staleness notes (all in ms):
 *  - Config-like data (plans, share products) stays fresh for 5 minutes.
 *  - Financial data (balance, cycles, entries, ledger) is short-lived and
 *    refetched on window focus so officers always see current figures.
 *  - Shareholdings, dividends, agreements, and exit requests are operational
 *    data with 30-second staleness.
 */

import { useQuery } from "@tanstack/react-query";
import {
  getPlans,
  getAllPlans,
  getCycles,
  getCycle,
  getCycleEntries,
  getCyclePenalties,
  getMyContributions,
  getMyBalance,
  getMyContributionSummary,
  getLedger,
  getShareProducts,
  getAllShareProducts,
  getShareholdings,
  getMyShareholdings,
  getDividendDeclarations,
  getDividendEntitlements,
  getContributionAgreements,
  getExitRequests,
  getMyExitRequests,
  getExitEstimate,
} from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";

const FIVE_MIN = 5 * 60_000;
const THIRTY_SEC = 30_000;
const SIXTY_SEC = 60_000;

// ─── Config: plans ────────────────────────────────────────────────────────────

export function useContributionPlans() {
  return useQuery({
    queryKey: qk.contributions.plans,
    queryFn: () => getPlans(),
    staleTime: FIVE_MIN,
  });
}

/** Full plan list (every page) for default-plan checks and the plans screen. */
export function useAllPlans() {
  return useQuery({
    queryKey: qk.contributions.allPlans,
    queryFn: () => getAllPlans(),
    staleTime: FIVE_MIN,
  });
}

// ─── Cycles ───────────────────────────────────────────────────────────────────

export function useCycles(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: qk.contributions.cycles(page, pageSize),
    queryFn: () => getCycles({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useCycle(id: string) {
  return useQuery({
    queryKey: qk.contributions.cycle(id),
    queryFn: () => getCycle(id),
    enabled: !!id,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useCycleEntries(
  cycleId: string,
  page = 1,
  pageSize = 25,
  status?: string
) {
  return useQuery({
    queryKey: qk.contributions.cycleEntries(cycleId, page, pageSize, status),
    queryFn: () =>
      getCycleEntries(cycleId, {
        page,
        page_size: pageSize,
        status: status ?? undefined,
      }),
    enabled: !!cycleId,
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useCyclePenalties(cycleId: string) {
  return useQuery({
    queryKey: qk.contributions.cyclePenalties(cycleId),
    queryFn: () => getCyclePenalties(cycleId),
    enabled: !!cycleId,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

// ─── Member self-service ──────────────────────────────────────────────────────

export function useMyContributions(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: qk.contributions.list(page, pageSize),
    queryFn: () => getMyContributions({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: SIXTY_SEC,
  });
}

export function useMyBalance() {
  return useQuery({
    queryKey: qk.contributions.balance,
    queryFn: getMyBalance,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useMyContributionSummary() {
  return useQuery({
    queryKey: qk.contributions.summary,
    queryFn: getMyContributionSummary,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

// ─── Ledger (officers) ────────────────────────────────────────────────────────

export function useLedger(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: qk.contributions.ledger(page, pageSize),
    queryFn: () => getLedger({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

// ─── Share Products ───────────────────────────────────────────────────────────

export function useShareProducts(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: [...qk.contributions.shareProducts, { page, pageSize }] as const,
    queryFn: () => getShareProducts({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: FIVE_MIN,
  });
}

export function useAllShareProducts() {
  return useQuery({
    queryKey: qk.contributions.allShareProducts,
    queryFn: () => getAllShareProducts(),
    staleTime: FIVE_MIN,
  });
}

// ─── Shareholdings ────────────────────────────────────────────────────────────

export function useShareholdings(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: [...qk.contributions.shareholdings, { page, pageSize }] as const,
    queryFn: () => getShareholdings({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useMyShareholdings() {
  return useQuery({
    queryKey: qk.contributions.myShareholdings,
    queryFn: getMyShareholdings,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

// ─── Dividend Declarations ────────────────────────────────────────────────────

export function useDividendDeclarations(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: [...qk.contributions.dividendDeclarations, { page, pageSize }] as const,
    queryFn: () => getDividendDeclarations({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useDividendEntitlements(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: [...qk.contributions.dividendEntitlements, { page, pageSize }] as const,
    queryFn: () => getDividendEntitlements({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

// ─── Contribution Agreements ──────────────────────────────────────────────────

export function useContributionAgreements(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: [...qk.contributions.contributionAgreements, { page, pageSize }] as const,
    queryFn: () => getContributionAgreements({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: FIVE_MIN,
  });
}

// ─── Exit Requests ────────────────────────────────────────────────────────────

export function useExitRequests(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: [...qk.contributions.exitRequests, { page, pageSize }] as const,
    queryFn: () => getExitRequests({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useMyExitRequests() {
  return useQuery({
    queryKey: qk.contributions.myExitRequests,
    queryFn: getMyExitRequests,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useExitEstimate() {
  return useQuery({
    queryKey: qk.contributions.exitEstimate,
    queryFn: getExitEstimate,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}
