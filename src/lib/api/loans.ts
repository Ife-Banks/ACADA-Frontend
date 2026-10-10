/**
 * Loans API — products, applications, eligibility, active loans.
 */

import { api } from "./client";
import type {
  LoanProduct,
  LoanApplicationSummary,
  LoanApplicationDetail,
  ActiveLoan,
  RuleEvaluation,
  EligibilityCheckPayload,
  LoanApplicationPayload,
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types";

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getLoanProducts() {
  return api.get<PaginatedResponse<LoanProduct>>("/loans/products/");
}

export async function getLoanProduct(id: string) {
  return api.get<LoanProduct>(`/loans/products/${id}/`);
}

export async function createLoanProduct(payload: Partial<LoanProduct>) {
  return api.post<LoanProduct>("/loans/products/", payload);
}

// ─── Eligibility ──────────────────────────────────────────────────────────────

export async function checkEligibility(payload: EligibilityCheckPayload) {
  return api.post<RuleEvaluation>("/loans/eligibility/", payload);
}

// ─── Applications ─────────────────────────────────────────────────────────────

export async function getLoanApplications(params?: PaginationParams) {
  return api.get<PaginatedResponse<LoanApplicationSummary>>(
    "/loans/applications/",
    params
  );
}

export async function getLoanApplication(id: string) {
  return api.get<LoanApplicationDetail>(`/loans/applications/${id}/`);
}

export async function submitLoanApplication(payload: LoanApplicationPayload) {
  return api.post<LoanApplicationDetail>("/loans/applications/", payload);
}

/**
 * Executive approves or rejects an escalated application.
 */
export async function decideLoanApplication(
  id: string,
  payload: {
    decision: "approve" | "reject";
    reason?: string;
    comments?: string;
  }
) {
  return api.post<{ detail: string; loan_id?: string }>(
    `/loans/applications/${id}/approve/`,
    payload
  );
}

/**
 * A guarantor confirms or declines their commitment.
 */
export async function respondAsGuarantor(
  applicationId: string,
  payload: { decision: "confirm" | "decline"; reason?: string }
) {
  return api.post<{ detail: string }>(
    `/loans/applications/${applicationId}/confirm-guarantor/`,
    payload
  );
}

// ─── Active loans ─────────────────────────────────────────────────────────────

export async function getActiveLoans(params?: PaginationParams) {
  return api.get<PaginatedResponse<ActiveLoan>>("/loans/active/", params);
}

export async function getActiveLoan(id: string) {
  return api.get<ActiveLoan>(`/loans/active/${id}/`);
}
