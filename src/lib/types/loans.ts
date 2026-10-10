/**
 * Loan domain types — products, applications, guarantors, approvals, active loans.
 */

export type LoanApplicationStatus =
  | "draft"
  | "submitted"
  | "guarantor_pending"
  | "evaluating"
  | "approved"
  | "rejected"
  | "escalated"
  | "cancelled"
  | "disbursed";

export type LoanStatus = "active" | "repaying" | "closed" | "defaulted";
export type GuarantorStatus = "pending" | "confirmed" | "declined";
export type RepaymentStatus = "scheduled" | "paid" | "partial" | "overdue" | "waived";

export interface LoanProduct {
  id: string;
  name: string;
  description: string;
  min_membership_months: number;
  min_contribution_months: number;
  guarantor_required_count: number;
  max_amount: string;
  max_multiplier: string;
  interest_rate: string;
  max_term_months: number;
  min_term_months: number;
  auto_approval_threshold: string;
  is_active: boolean;
  created_at: string;
}

export interface LoanGuarantor {
  id: string;
  guarantor_member: string;
  guarantor_name: string;
  guarantor_email: string;
  status: GuarantorStatus;
  confirmed_at: string | null;
  decline_reason: string;
}

export interface LoanApprovalStep {
  id: string;
  actor_user: string;
  actor_name: string;
  actor_role_code: string;
  decision: "approve" | "reject" | "abstain";
  comments: string;
  decided_at: string;
}

/** Single rule result from the eligibility engine */
export interface RuleResult {
  rule_name: string;
  passed: boolean;
  message: string;
  details: Record<string, unknown>;
}

/** Full eligibility evaluation — returned inside the application and from /eligibility/ */
export interface RuleEvaluation {
  eligible: boolean;
  max_borrowable: string;
  approval_mode: "auto" | "manual";
  message: string;
  blocked_on_guarantors: boolean;
  rules: RuleResult[];
}

export interface LoanApplicationSummary {
  id: string;
  member_profile: string;
  member_name: string;
  loan_product: string;
  product_name: string;
  amount_requested: string;
  term_months: number;
  status: LoanApplicationStatus;
  submitted_at: string | null;
  created_at: string;
}

export interface LoanApplicationDetail {
  id: string;
  member_profile: string;
  member_name: string;
  product: LoanProduct;
  amount_requested: string;
  purpose: string;
  term_months: number;
  status: LoanApplicationStatus;
  rule_evaluation: RuleEvaluation | null;
  evaluated_at: string | null;
  rejection_reason: string;
  submitted_at: string | null;
  guarantors: LoanGuarantor[];
  approval_steps: LoanApprovalStep[];
  created_at: string;
}

export interface RepaymentScheduleItem {
  id: string;
  installment_no: number;
  due_cycle: string | null;
  principal_component: string;
  interest_component: string;
  amount_due: string;
  amount_received: string;
  status: RepaymentStatus;
  paid_at: string | null;
}

export interface ActiveLoan {
  id: string;
  application: string;
  member_name: string;
  principal_amount: string;
  approved_amount: string;
  interest_rate: string;
  term_months: number;
  total_repayable: string;
  monthly_installment: string;
  status: LoanStatus;
  total_paid: string;
  outstanding_balance: string;
  disbursement_mode: string;
  opened_at: string;
  closed_at: string | null;
  repayment_schedule: RepaymentScheduleItem[];
}

export interface EligibilityCheckPayload {
  loan_product_id: string;
  amount?: string;
}

export interface LoanApplicationPayload {
  loan_product: string;
  amount_requested: string;
  purpose: string;
  term_months: number;
  guarantor_member_ids?: string[];
}
