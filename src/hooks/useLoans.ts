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
  getAllLoanProducts,
  getLoanApplications,
  getMyLoanApplications,
  getLoanApplication,
  getGuarantorRequests,
  getGuaranteeRequest,
  getActiveLoans,
  getActiveLoan,
  getLoanQuote,
} from "@/lib/api/loans";
import { qk } from "@/lib/query-keys";

const FIVE_MIN = 5 * 60_000;
const THIRTY_SEC = 30_000;

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * The full loan-product catalogue, across every page.
 *
 * Product pickers must show every product the society offers, so they use
 * this instead of the first page of the paginated list.
 */
export function useAllLoanProducts() {
  return useQuery({
    queryKey: qk.loans.allProducts,
    queryFn: () => getAllLoanProducts(),
    staleTime: FIVE_MIN,
  });
}

// ─── Quote ────────────────────────────────────────────────────────────────────

/**
 * Price a loan: what it will cost in interest and what the monthly
 * instalment will be.
 *
 * The backend prices the loan with the same calculator that writes the
 * contract, so this is the real figure, not an estimate. The request only
 * goes out once a product, an amount and a term are all present.
 */
export function useLoanQuote(
  productId: string,
  amount: string,
  term: string,
  enabled = true
) {
  const amountValue = Number(amount);
  const termValue = Number(term);
  const ready =
    enabled &&
    !!productId &&
    amountValue > 0 &&
    Number.isFinite(amountValue) &&
    Number.isInteger(termValue) &&
    termValue > 0;

  return useQuery({
    queryKey: qk.loans.quote(productId, amount, term),
    queryFn: () =>
      getLoanQuote({
        loan_product_id: productId,
        amount,
        term_months: termValue,
      }),
    enabled: ready,
    staleTime: 60_000,
    retry: false,
  });
}

// ─── Applications ─────────────────────────────────────────────────────────────

export function useLoanApplications(page = 1, pageSize = 25, search = "") {
  return useQuery({
    queryKey: qk.loans.applications(page, pageSize, search),
    queryFn: () =>
      getLoanApplications({
        page,
        page_size: pageSize,
        ...(search ? { search } : {}),
      }),
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

/**
 * Applications the signed-in member submitted themselves.
 */
export function useMyLoanApplications(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: qk.loans.myApplications(page, pageSize),
    queryFn: () => getMyLoanApplications({ page, page_size: pageSize }),
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

/**
 * Guarantee requests addressed to the signed-in member.
 */
export function useGuarantorRequests() {
  return useQuery({
    queryKey: qk.loans.guarantorRequests,
    queryFn: getGuarantorRequests,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

/**
 * The restricted view of a single application for a guarantor.
 */
export function useGuaranteeRequest(id: string, enabled = true) {
  return useQuery({
    queryKey: qk.loans.guaranteeRequest(id),
    queryFn: () => getGuaranteeRequest(id),
    enabled: enabled && !!id,
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