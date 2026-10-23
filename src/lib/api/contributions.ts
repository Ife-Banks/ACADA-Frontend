/**
 * Contributions API — plans, cycles, entries, penalties, ledger, my contributions.
 */

import { api } from "./client";
import type {
  ContributionPlan,
  ContributionCycle,
  ContributionEntry,
  PenaltyEntry,
  FinancialLedgerEntry,
  MemberBalance,
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

// ─── Ledger ───────────────────────────────────────────────────────────────────

export async function getLedger(
  params?: PaginationParams & { member_profile_id?: string }
) {
  return api.get<PaginatedResponse<FinancialLedgerEntry>>(
    "/contributions/ledger/",
    params
  );
}
