"use client";

/**
 * ScheduleBadges — pills for schedule batch types and lifecycle statuses.
 */

import { cn } from "@/lib/utils";
import type { BatchType, BatchStatus } from "@/lib/types";

/* ─── Batch type ────────────────────────────────────────────────── */

const TYPE_STYLES: Record<BatchType, string> = {
  deduction: "bg-brand-primary/10 text-brand-primary",
  repayment: "bg-warning/10 text-warning",
  combined:  "bg-success/10 text-success",
};

const TYPE_LABEL: Record<BatchType, string> = {
  deduction: "Contributions",
  repayment: "Repayments",
  combined:  "Combined",
};

export function BatchTypeBadge({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const key = (Object.keys(TYPE_LABEL).includes(type) ? type : "deduction") as BatchType;
  return (
    <span
      className={cn(
        "nm-chip inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        TYPE_STYLES[key],
        className
      )}
    >
      {TYPE_LABEL[key]}
    </span>
  );
}

/* ─── Batch status ──────────────────────────────────────────────── */

const STATUS_STYLES: Record<BatchStatus, string> = {
  draft:     "bg-muted text-muted-foreground",
  finalized: "bg-brand-primary/10 text-brand-primary",
  exported:  "bg-success/10 text-success",
  submitted: "bg-warning/10 text-warning",
};

const STATUS_LABEL: Record<BatchStatus, string> = {
  draft:     "Draft",
  finalized: "Finalized",
  exported:  "Exported",
  submitted: "Submitted",
};

export function BatchStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (Object.keys(STATUS_LABEL).includes(status) ? status : "draft") as BatchStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        STATUS_STYLES[key],
        className
      )}
    >
      <span className="nm-live-dot w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABEL[key]}
    </span>
  );
}