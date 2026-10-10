"use client";

/**
 * LoanBadges — status pills for loan applications, active loans,
 * guarantor confirmations and repayment schedule items.
 */

import { cn } from "@/lib/utils";
import type {
  LoanApplicationStatus,
  LoanStatus,
  GuarantorStatus,
  RepaymentStatus,
} from "@/lib/types";

/* ─── Loan application status ───────────────────────────────────── */

const APPLICATION_STYLES: Record<LoanApplicationStatus, string> = {
  draft:            "bg-muted text-muted-foreground",
  submitted:        "bg-brand-primary/10 text-brand-primary",
  guarantor_pending: "bg-warning/10 text-warning",
  evaluating:       "bg-warning/10 text-warning",
  approved:         "bg-success/10 text-success",
  rejected:         "bg-destructive/10 text-destructive",
  escalated:        "bg-brand-primary/10 text-brand-primary",
  cancelled:        "bg-muted text-muted-foreground",
  disbursed:        "bg-success/10 text-success",
};

const APPLICATION_LABEL: Record<LoanApplicationStatus, string> = {
  draft:             "Draft",
  submitted:         "Submitted",
  guarantor_pending: "Awaiting guarantors",
  evaluating:        "Evaluating",
  approved:          "Approved",
  rejected:          "Rejected",
  escalated:         "Escalated",
  cancelled:         "Cancelled",
  disbursed:         "Disbursed",
};

export function LoanApplicationStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (
    Object.keys(APPLICATION_LABEL).includes(status)
      ? status
      : "submitted"
  ) as LoanApplicationStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        APPLICATION_STYLES[key],
        className
      )}
    >
      <span className="nm-live-dot w-1.5 h-1.5 rounded-full bg-current" />
      {APPLICATION_LABEL[key]}
    </span>
  );
}

/* ─── Active loan status ────────────────────────────────────────── */

const LOAN_STYLES: Record<LoanStatus, string> = {
  active:    "bg-brand-primary/10 text-brand-primary",
  repaying:  "bg-success/10 text-success",
  closed:    "bg-muted text-muted-foreground",
  defaulted: "bg-destructive/10 text-destructive",
};

const LOAN_LABEL: Record<LoanStatus, string> = {
  active:    "Active",
  repaying:  "Repaying",
  closed:    "Closed",
  defaulted: "Defaulted",
};

export function LoanStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (Object.keys(LOAN_LABEL).includes(status) ? status : "active") as LoanStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        LOAN_STYLES[key],
        className
      )}
    >
      <span className="nm-live-dot w-1.5 h-1.5 rounded-full bg-current" />
      {LOAN_LABEL[key]}
    </span>
  );
}

/* ─── Guarantor status ──────────────────────────────────────────── */

const GUARANTOR_STYLES: Record<GuarantorStatus, string> = {
  pending:   "bg-warning/10 text-warning",
  confirmed: "bg-success/10 text-success",
  declined:  "bg-destructive/10 text-destructive",
};

export function GuarantorStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (
    Object.keys(GUARANTOR_STYLES).includes(status) ? status : "pending"
  ) as GuarantorStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        GUARANTOR_STYLES[key],
        className
      )}
    >
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </span>
  );
}

/* ─── Repayment schedule item ───────────────────────────────────── */

const REPAYMENT_STYLES: Record<RepaymentStatus, string> = {
  scheduled: "bg-muted text-muted-foreground",
  paid:      "bg-success/10 text-success",
  partial:   "bg-warning/10 text-warning",
  overdue:   "bg-destructive/10 text-destructive",
  waived:    "bg-muted text-muted-foreground",
};

export function RepaymentStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (
    Object.keys(REPAYMENT_STYLES).includes(status) ? status : "scheduled"
  ) as RepaymentStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        REPAYMENT_STYLES[key],
        className
      )}
    >
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </span>
  );
}