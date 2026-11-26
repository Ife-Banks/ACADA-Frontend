/**
 * Contributions API — plans, cycles, entries, penalties, ledger, shares,
 * dividends, agreements, exit requests, and member self-service.
 */

import { api } from "./client";
import type {
  ContributionPlan,
  ContributionCycle,
  ContributionEntry,
  PenaltyEntry,
  FinancialLedgerEntry,
  MemberBalance,
  MemberContributionSummary,
  ShareProduct,
  Shareholding,
  DividendDeclaration,
  DividendEntitlement,
  DividendEligibilityPreview,
  MemberContributionAgreement,
  ExitRequest,
  ExitEstimate,
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types";

// ─── Plans ────────────────────────────────────────────────────────────────────

export async function getPlans(params?: PaginationParams) {
  return api.get<PaginatedResponse<ContributionPlan>>(
    "/contributions/plans/",
    params
  );
}

/**
 * Fetch every contribution plan across pages. Needed when clearing competing
 * defaults, otherwise a default on page 2 would survive.
 */
export async function getAllPlans(pageSize = 100, maxPages = 20) {
  const all: ContributionPlan[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const res = await getPlans({ page, page_size: pageSize });
    all.push(...res.results);
    if (!res.next) break;
  }

  return all;
}

export async function createPlan(payload: Partial<ContributionPlan>) {
  return api.post<ContributionPlan>("/contributions/plans/", payload);
}

export async function getPlan(id: string) {
  return api.get<ContributionPlan>(`/contributions/plans/${id}/`);
}

export async function updatePlan(
  id: string,
  payload: Partial<ContributionPlan>
) {
  return api.patch<ContributionPlan>(`/contributions/plans/${id}/`, payload);
}

// ─── Cycles ───────────────────────────────────────────────────────────────────

export async function getCycles(params?: PaginationParams) {
  return api.get<PaginatedResponse<ContributionCycle>>("/contributions/cycles/", params);
}

export async function getCycle(id: string) {
  return api.get<ContributionCycle>(`/contributions/cycles/${id}/`);
}

export async function createCycle(payload: {
  cycle_month: number;
  cycle_year: number;
  notes?: string;
}) {
  return api.post<ContributionCycle>("/contributions/cycles/", payload);
}

// ─── Cycle entries ────────────────────────────────────────────────────────────

export async function getCycleEntries(
  cycleId: string,
  params?: PaginationParams & { status?: string }
) {
  return api.get<PaginatedResponse<ContributionEntry>>(
    `/contributions/cycles/${cycleId}/entries/`,
    params
  );
}

/** Bulk-confirm all pending entries in a cycle */
export async function confirmCycle(
  cycleId: string,
  entries?: Array<{ member_profile_id: string; amount_received: string }>
) {
  return api.post<{ detail: string; confirmed_count: number }>(
    `/contributions/cycles/${cycleId}/confirm/`,
    { entries: entries ?? [] }
  );
}

export async function getCyclePenalties(cycleId: string) {
  return api.get<PenaltyEntry[]>(`/contributions/cycles/${cycleId}/penalties/`);
}

// ─── Individual entries ───────────────────────────────────────────────────────

export async function confirmEntry(
  entryId: string,
  payload: { amount_received: string; source_reference?: string }
) {
  return api.post<ContributionEntry>(
    `/contributions/entries/${entryId}/confirm/`,
    payload
  );
}

// ─── My contributions (member self-service) ───────────────────────────────────

export async function getMyContributions(params?: PaginationParams) {
  return api.get<PaginatedResponse<ContributionEntry>>("/contributions/my/", params);
}

export async function getMyBalance() {
  return api.get<MemberBalance>("/contributions/my/balance/");
}

export async function getMyContributionSummary() {
  return api.get<MemberContributionSummary>("/contributions/my/summary/");
}

// ─── Ledger ───────────────────────────────────────────────────────────────────

export async function getLedger(
  params?: PaginationParams & { member_profile_id?: string }
) {
  return api.get<PaginatedResponse<FinancialLedgerEntry>>(
    "/contributions/ledger/",
    params
  );
}

// ─── Share Products ───────────────────────────────────────────────────────────

export async function getShareProducts(params?: PaginationParams) {
  return api.get<PaginatedResponse<ShareProduct>>(
    "/contributions/shares/products/",
    params
  );
}

export async function getAllShareProducts(pageSize = 100, maxPages = 20) {
  const all: ShareProduct[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const res = await getShareProducts({ page, page_size: pageSize });
    all.push(...res.results);
    if (!res.next) break;
  }

  return all;
}

export async function createShareProduct(payload: Partial<ShareProduct>) {
  return api.post<ShareProduct>("/contributions/shares/products/", payload);
}

export async function updateShareProduct(
  id: string,
  payload: Partial<ShareProduct>
) {
  return api.patch<ShareProduct>(`/contributions/shares/products/${id}/`, payload);
}

// ─── Shareholdings ────────────────────────────────────────────────────────────

export async function getShareholdings(params?: PaginationParams) {
  return api.get<PaginatedResponse<Shareholding>>(
    "/contributions/shares/holdings/",
    params
  );
}

export async function getMyShareholdings() {
  return api.get<Shareholding[]>("/contributions/shares/holdings/mine/");
}

export async function createShareholding(payload: {
  product: string;
  units: number;
  member_profile?: string;
}) {
  return api.post<Shareholding>("/contributions/shares/holdings/", payload);
}

export async function recordSharePayment(
  holdingId: string,
  payload: { amount: string; reference?: string }
) {
  return api.post<Shareholding>(
    `/contributions/shares/holdings/${holdingId}/record-payment/`,
    payload
  );
}

// ─── Dividend Declarations ────────────────────────────────────────────────────

export async function getDividendDeclarations(params?: PaginationParams) {
  return api.get<PaginatedResponse<DividendDeclaration>>(
    "/contributions/dividends/declarations/",
    params
  );
}

export async function getDividendEligibilityPreview(params: {
  record_date: string;
  per_share_amount: string;
}) {
  return api.get<DividendEligibilityPreview>(
    "/contributions/dividends/declarations/eligibility-preview/",
    params
  );
}

export async function createDividendDeclaration(payload: {
  financial_year: string;
  record_date: string;
  per_share_amount: string;
}) {
  return api.post<DividendDeclaration>(
    "/contributions/dividends/declarations/",
    payload
  );
}

export async function approveDividendDeclaration(
  id: string,
  payload: { agm_reference: string }
) {
  return api.post<DividendDeclaration>(
    `/contributions/dividends/declarations/${id}/approve/`,
    payload
  );
}

// ─── Dividend Entitlements ────────────────────────────────────────────────────

export async function getDividendEntitlements(params?: PaginationParams) {
  return api.get<PaginatedResponse<DividendEntitlement>>(
    "/contributions/dividends/entitlements/",
    params
  );
}

export async function recordDividendPayment(
  entitlementId: string,
  payload: {
    status: "paid" | "withheld" | "reinvested";
    payment_reference?: string;
  }
) {
  return api.post<DividendEntitlement>(
    `/contributions/dividends/entitlements/${entitlementId}/record-payment/`,
    payload
  );
}

// ─── Contribution Agreements ──────────────────────────────────────────────────

export async function getContributionAgreements(params?: PaginationParams) {
  return api.get<PaginatedResponse<MemberContributionAgreement>>(
    "/contributions/agreements/",
    params
  );
}

export async function createContributionAgreement(payload: {
  member_profile: string;
  plan: string;
  amount: string;
  effective_from: string;
  effective_to?: string;
  reason: string;
}) {
  return api.post<MemberContributionAgreement>(
    "/contributions/agreements/",
    payload
  );
}

// ─── Exit Requests ────────────────────────────────────────────────────────────

export async function getExitRequests(params?: PaginationParams) {
  return api.get<PaginatedResponse<ExitRequest>>(
    "/contributions/exit-requests/",
    params
  );
}

export async function getMyExitRequests() {
  return api.get<ExitRequest[]>("/members/me/exit-requests/");
}

export async function createExitRequest(payload: {
  requested_exit_date: string;
  reason: string;
}) {
  return api.post<ExitRequest>("/members/me/exit-requests/", payload);
}

export async function getExitEstimate() {
  return api.get<ExitEstimate>("/members/me/exit-settlement/");
}

export async function reviewExitRequest(
  id: string,
  payload: {
    decision: "approve" | "reject";
    gross_contribution_balance?: string;
    deductions?: Array<{ label: string; amount: string }>;
    proposed_payable?: string;
    reason: string;
  }
) {
  return api.post<ExitRequest>(
    `/contributions/exit-requests/${id}/review/`,
    payload
  );
}

export async function markExitSettled(
  id: string,
  payload: { payment_reference: string }
) {
  return api.post<ExitRequest>(
    `/contributions/exit-requests/${id}/mark-settled/`,
    payload
  );
}
