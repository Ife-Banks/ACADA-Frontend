/**
 * Contribution domain types — plans, cycles, entries, penalties, ledger.
 */

export type CycleStatus = "open" | "processing" | "closed";
export type EntryType = "regular" | "extra" | "adjustment";
export type EntryStatus = "pending" | "confirmed" | "missed" | "partial";
export type PenaltyType = "late_payment" | "missed_payment" | "other";
export type PenaltyStatus = "pending" | "applied" | "waived";
export type LedgerEventType =
  | "contribution_credit"
  | "extra_contribution"
  | "penalty_debit"
  | "loan_disbursement"
  | "loan_repayment"
  | "adjustment_credit"
  | "adjustment_debit";

export interface ContributionPlan {
  id: string;
  plan_name: string;
  amount_fixed: string;
  allows_extra: boolean;
  is_default: boolean;
  effective_from: string;
  effective_to: string | null;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContributionCycle {
  id: string;
  cycle_month: number;
  cycle_year: number;
  period_display: string;
  status: CycleStatus;
  generated_by: string | null;
  /** Display name of the officer who generated the cycle (null if unknown). */
  generated_by_name: string | null;
  generated_at: string | null;
  closed_at: string | null;
  notes: string;
  entry_count: number;
  confirmed_count: number;
  created_at: string;
}

export interface ContributionEntry {
  id: string;
  cycle: string;
  member_profile: string;
  member_name: string;
  member_email: string;
  member_payroll_no: string;
  entry_type: EntryType;
  amount_due: string;
  amount_received: string;
  source_reference: string;
  status: EntryStatus;
  confirmed_by: string | null;
  /** Display name of the officer who confirmed the entry (null if unknown). */
  confirmed_by_name: string | null;
  confirmed_at: string | null;
  created_at: string;
}

export interface PenaltyEntry {
  id: string;
  member_profile: string;
  member_name: string;
  cycle: string;
  penalty_type: PenaltyType;
  amount: string;
  reason: string;
  status: PenaltyStatus;
  waived_by: string | null;
  /** Display name of the officer who waived the penalty (null if unknown). */
  waived_by_name: string | null;
  waived_reason: string;
  created_at: string;
}

export interface FinancialLedgerEntry {
  id: string;
  member_profile: string;
  event_type: LedgerEventType;
  description: string;
  source_table: string;
  source_id: string;
  debit: string;
  credit: string;
  balance_after: string;
  posted_at: string;
}

/** Response from GET /contributions/my/balance/ */
export interface MemberBalance {
  current_balance: string;
  total_cycles: number;
  total_due: string;
  total_received: string;
  confirmed_count: number;
  missed_count: number;
}
