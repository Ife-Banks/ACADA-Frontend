"use client";

/**
 * useContributions — React Query hooks for the contributions module.
 *
 * Staleness notes (all in ms):
 *  - Config-like data (plans) stays fresh for 5 minutes.
 *  - Financial data (balance, cycles, entries, ledger) is short-lived and
 *    refetched on window focus so officers always see current figures.
 */

import { useQuery } from "@tanstack/react-query";
import {
  getPlans,
  getCycles,
  getCycle,
  getCycleEntries,
  getCyclePenalties,
  getMyContributions,
  getMyBalance,
  getLedger,
} from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";

const FIVE_MIN = 5 * 60_000;
const THIRTY_SEC = 30_000;
const SIXTY_SEC = 60_000;

// ─── Config: plans ────────────────────────────────────────────────────────────

export function useContributionPlans() {
  return useQuery({
    queryKey: qk.contributions.plans,
    queryFn: getPlans,
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