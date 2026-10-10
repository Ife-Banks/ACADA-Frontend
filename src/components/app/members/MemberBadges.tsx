"use client";

/**
 * MemberBadges — consistent status and role pills used across the
 * members list and member detail pages.
 */

import { cn } from "@/lib/utils";
import type { MembershipStatus } from "@/lib/types";

const STATUS_STYLES: Record<MembershipStatus, string> = {
  pending:   "bg-warning/10 text-warning",
  active:    "bg-success/10 text-success",
  suspended: "bg-destructive/10 text-destructive",
  removed:   "bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<MembershipStatus, string> = {
  pending:   "Pending",
  active:    "Active",
  suspended: "Suspended",
  removed:   "Removed",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (Object.keys(STATUS_LABEL).includes(status) ? status : "pending") as MembershipStatus;
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

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  return (
    <span
      className={cn(
        "nm-chip inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap text-brand-primary",
        className
      )}
    >
      {role.replace(/_/g, " ")}
    </span>
  );
}