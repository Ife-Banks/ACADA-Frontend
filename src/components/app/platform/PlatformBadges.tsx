"use client";

/**
 * PlatformBadges — status pills for tenants and onboarding state.
 */

import type { OnboardingState, TenantStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TenantStatus, string> = {
  active: "bg-success/10 text-success",
  suspended: "bg-warning/10 text-warning",
  deactivated: "bg-destructive/10 text-destructive",
};

const STATUS_LABEL: Record<TenantStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  deactivated: "Deactivated",
};

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

const ONBOARDING_STYLES: Record<OnboardingState, string> = {
  pending: "bg-muted text-muted-foreground",
  configuring: "bg-brand-primary/10 text-brand-primary",
  importing: "bg-warning/10 text-warning",
  active: "bg-success/10 text-success",
};

const ONBOARDING_LABEL: Record<OnboardingState, string> = {
  pending: "Pending setup",
  configuring: "Configuring rules",
  importing: "Importing members",
  active: "Operational",
};

export function OnboardingBadge({ state }: { state: OnboardingState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        ONBOARDING_STYLES[state] ?? "bg-muted text-muted-foreground"
      )}
    >
      {ONBOARDING_LABEL[state] ?? state}
    </span>
  );
}

export function RuleStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
        active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
      )}
    >
      {active ? "Active" : "Archived"}
    </span>
  );
}
