"use client";

/**
 * useLoans — React Query hooks for the loans module.
 *
 * Products are config-like (5 min). Applications and active loans are
 * operational and refetch on window focus (30 s). Mutations (SubmitLoan /
 * decide / guarantor / create product) invalidate the loans domain root.
 */

import { useQuery } from "@tanstack/react-query";
import {
  getLoanProducts,
  getLoanProduct,
  getLoanApplications,
  getLoanApplication,
  getActiveLoans,
  getActiveLoan,
} from "@/lib/api/loans";
import { qk } from "@/lib/query-keys";

const FIVE_MIN = 5 * 60_000;
const THIRTY_SEC = 30_000;

// ─── Products ─────────────────────────────────────────────────────────────────

export function useLoanProducts() {
  return useQuery({
    queryKey: qk.loans.products,
    queryFn: getLoanProducts,
    staleTime: FIVE_MIN,
  });
}

export function useLoanProduct(id: string) {
  return useQuery({
    queryKey: qk.loans.product(id),
    queryFn: () => getLoanProduct(id),
    enabled: !!id,
    staleTime: FIVE_MIN,
  });
}

// ─── Applications ─────────────────────────────────────────────────────────────

export function useLoanApplications(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: qk.loans.applications(page, pageSize),
    queryFn: () => getLoanApplications({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useLoanApplication(id: string) {
  return useQuery({
    queryKey: qk.loans.application(id),
    queryFn: () => getLoanApplication(id),
    enabled: !!id,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

// ─── Active loans ─────────────────────────────────────────────────────────────

export function useActiveLoans(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: qk.loans.active(page, pageSize),
    queryFn: () => getActiveLoans({ page, page_size: pageSize }),
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useActiveLoan(id: string) {
  return useQuery({
    queryKey: qk.loans.activeDetail(id),
    queryFn: () => getActiveLoan(id),
    enabled: !!id,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}