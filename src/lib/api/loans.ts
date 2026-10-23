/**
 * Loans API — products, applications, eligibility, active loans.
 */

import { api } from "./client";
import type {
  LoanProduct,
  LoanApplicationSummary,
  LoanApplicationDetail,
  GuaranteeRequest,
  ActiveLoan,
  RuleEvaluation,
  RepaymentQuote,
  EligibilityCheckPayload,
  LoanQuotePayload,
  LoanApplicationPayload,
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types";

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getLoanProducts(params?: PaginationParams) {
  return api.get<PaginatedResponse<LoanProduct>>("/loans/products/", params);
}

/**
 * Fetch every loan product across all pages.
 *
 * Product pickers (eligibility, application form) must offer the full
 * catalogue, so they cannot rely on the first page of a paginated list.
 */
export async function getAllLoanProducts(pageSize = 100, maxPages = 20) {
  const all: LoanProduct[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const res = await getLoanProducts({ page, page_size: pageSize });
    all.push(...res.results);
    if (!res.next) break;
  }

  return all;
}

export async function createLoanProduct(payload: Partial<LoanProduct>) {
  return api.post<LoanProduct>("/loans/products/", payload);
}

export async function updateLoanProduct(
  id: string,
  payload: Partial<LoanProduct>
) {
  return api.patch<LoanProduct>(`/loans/products/${id}/`, payload);
}

// ─── Eligibility ──────────────────────────────────────────────────────────────

export async function checkEligibility(payload: EligibilityCheckPayload) {
  return api.post<RuleEvaluation>("/loans/eligibility/", payload);
}

/**
 * Price a loan before applying.
 *
 * The backend runs the same calculator it uses to write the contract, so
 * the total interest and monthly instalment shown here are what the member
 * will actually be charged.
 */
export async function getLoanQuote(payload: LoanQuotePayload) {
  return api.post<RepaymentQuote>("/loans/quote/", payload);
}

// ─── Applications ─────────────────────────────────────────────────────────────

export async function getLoanApplications(params?: PaginationParams) {
  return api.get<PaginatedResponse<LoanApplicationSummary>>(
    "/loans/applications/",
    params
  );
}

/**
 * Applications the signed-in member submitted themselves.
 *
 * The backend also returns applications where the member is a guarantor;
 * `scope=mine` narrows the list back to the member's own applications.
 */
export async function getMyLoanApplications(params?: PaginationParams) {
  return api.get<PaginatedResponse<LoanApplicationSummary>>(
    "/loans/applications/",
    { ...params, scope: "mine" }
  );
}

export async function getLoanApplication(id: string) {
  return api.get<LoanApplicationDetail>(`/loans/applications/${id}/`);
}

/**
 * Applications where the signed-in member is named as a guarantor.
 */
export async function getGuarantorRequests() {
  return api.get<GuaranteeRequest[]>("/loans/applications/guarantor-requests/");
}

/**
 * The restricted view of a single application, from the point of view of the
 * signed-in member as a guarantor.
 */
export async function getGuaranteeRequest(id: string) {
  return api.get<GuaranteeRequest>(
    `/loans/applications/${id}/guarantee-request/`
  );
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
