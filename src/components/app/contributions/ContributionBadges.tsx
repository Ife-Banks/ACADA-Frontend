"use client";

/**
 * ContributionBadges — status/tag pills for the contributions module:
 * cycles, entries, penalties, and ledger events. Mirrors MemberBadges.
 */

import { cn } from "@/lib/utils";
import type {
  CycleStatus,
  EntryStatus,
  PenaltyStatus,
  LedgerEventType,
} from "@/lib/types";

/* ─── Cycle status ──────────────────────────────────────────────────────────── */

const CYCLE_STYLES: Record<CycleStatus, string> = {
  open:       "bg-success/10 text-success",
  processing: "bg-warning/10 text-warning",
  closed:     "bg-muted text-muted-foreground",
};

const CYCLE_LABEL: Record<CycleStatus, string> = {
  open:       "Open",
  processing: "Processing",
  closed:     "Closed",
};

export function CycleStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (Object.keys(CYCLE_LABEL).includes(status) ? status : "open") as CycleStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        CYCLE_STYLES[key],
        className
      )}
    >
      <span className="nm-live-dot w-1.5 h-1.5 rounded-full bg-current" />
      {CYCLE_LABEL[key]}
    </span>
  );
}

/* ─── Entry status ──────────────────────────────────────────────────────────── */

const ENTRY_STYLES: Record<EntryStatus, string> = {
  pending:   "bg-warning/10 text-warning",
  confirmed: "bg-success/10 text-success",
  missed:    "bg-destructive/10 text-destructive",
  partial:   "bg-primary/10 text-brand-primary",
};

const ENTRY_LABEL: Record<EntryStatus, string> = {
  pending:   "Pending",
  confirmed: "Confirmed",
  missed:    "Missed",
  partial:   "Partial",
};

export function EntryStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (Object.keys(ENTRY_LABEL).includes(status) ? status : "pending") as EntryStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        ENTRY_STYLES[key],
        className
      )}
    >
      {ENTRY_LABEL[key]}
    </span>
  );
}

export function EntryTypeBadge({ type }: { type: string }) {
  let style = "bg-muted text-muted-foreground";
  if (type === "extra") style = "bg-brand-primary/10 text-brand-primary";
  if (type === "adjustment") style = "bg-warning/10 text-warning";
  return (
    <span
      className={cn(
        "nm-chip inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        style
      )}
    >
      {type}
    </span>
  );
}

/* ─── Penalty status ────────────────────────────────────────────────────────── */

const PENALTY_STYLES: Record<PenaltyStatus, string> = {
  pending: "bg-warning/10 text-warning",
  applied: "bg-destructive/10 text-destructive",
  waived:  "bg-muted text-muted-foreground",
};

const PENALTY_LABEL: Record<PenaltyStatus, string> = {
  pending: "Pending",
  applied: "Applied",
  waived:  "Waived",
};

export function PenaltyStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (Object.keys(PENALTY_LABEL).includes(status)
    ? status
    : "pending") as PenaltyStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap capitalize",
        PENALTY_STYLES[key],
        className
      )}
    >
      {PENALTY_LABEL[key]}
    </span>
  );
}

export function PenaltyTypeBadge({ type }: { type: string }) {
  return (
    <span className="nm-chip inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap capitalize text-foreground">
      {type.replace(/_/g, " ")}
    </span>
  );
}

/* ─── Ledger event type ─────────────────────────────────────────────────────── */

const LEDGER_STYLES: Record<LedgerEventType, string> = {
  contribution_credit: "bg-success/10 text-success",
  extra_contribution:  "bg-success/10 text-success",
  penalty_debit:       "bg-destructive/10 text-destructive",
  loan_disbursement:   "bg-warning/10 text-warning",
  loan_repayment:      "bg-success/10 text-success",
  adjustment_credit:   "bg-brand-primary/10 text-brand-primary",
  adjustment_debit:    "bg-brand-primary/10 text-brand-primary",
};

const LEDGER_LABEL: Record<LedgerEventType, string> = {
  contribution_credit: "Contribution",
  extra_contribution:  "Extra",
  penalty_debit:       "Penalty",
  loan_disbursement:   "Loan payout",
  loan_repayment:      "Loan repayment",
  adjustment_credit:   "Adjustment",
  adjustment_debit:    "Adjustment",
};

export function LedgerEventBadge({ type, className }: { type: string; className?: string }) {
  const key = (Object.keys(LEDGER_LABEL).includes(type) ? type : "adjustment_credit") as LedgerEventType;
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        LEDGER_STYLES[key],
        className
      )}
    >
      {LEDGER_LABEL[key]}
    </span>
  );
}