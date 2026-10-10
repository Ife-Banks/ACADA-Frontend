"use client";

/**
 * ExecutiveDashboard — society KPIs: membership, savings, loans and a
 * monthly contribution chart with pending-action shortcuts.
 */

import Link from "next/link";
import {
  ChevronRight,
  ClipboardList,
  Coins,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDashboardSummary, useContributionsChart } from "@/hooks/useReports";
import { ContributionChart } from "./ContributionChart";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const money = (v: string) => `₦${Number(v).toLocaleString("en-NG")}`;

/* ─── KPI tile ──────────────────────────────────────────────────── */

function KpiTile({
  label,
  value,
  icon,
  index,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  index: number;
}) {
  const Icon = icon;
  return (
    <div
      className="nm-raised bg-surface rounded-3xl p-5 flex flex-col gap-2"
      style={{ animation: `var(--animate-fade-up) ${150 + index * 60}ms both` }}
    >
      <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-brand-primary" />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xl font-bold text-foreground leading-tight">{value}</span>
    </div>
  );
}

/* ─── Pending action row ────────────────────────────────────────── */

function PendingRow({
  label,
  count,
  href,
  index,
}: {
  label: string;
  count: number;
  href?: string;
  index: number;
}) {
  const body = (
    <div
      className={cn(
        "nm-raised rounded-xl px-4 py-3.5 flex items-center gap-3",
        href && "hover:bg-muted/50 transition-colors duration-200"
      )}
      style={{ animation: `var(--animate-fade-up) ${150 + index * 60}ms both` }}
    >
      <span className="text-sm font-semibold text-foreground flex-1">{label}</span>
      <span className="h-6 min-w-6 px-1.5 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">
        {count}
      </span>
      {href && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/* ─── Dashboard ─────────────────────────────────────────────────── */

export function ExecutiveDashboard() {
  const { data: me } = useCurrentUser();
  const year = new Date().getFullYear();

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useDashboardSummary();

  const { data: chart, isLoading: chartLoading } = useContributionsChart(year);

  const firstName = me?.full_name?.split(" ")[0] ?? "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (summaryError) {
    return (
      <div className="nm-raised-lg bg-surface rounded-3xl p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
        {summaryError instanceof ApiError
          ? summaryError.messages[0]
          : "Could not load the dashboard."}
        <button
          type="button"
          onClick={() => refetchSummary()}
          className="text-sm font-semibold text-brand-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const pendingLoanApps = summary?.loans.pending_applications ?? 0;
  const pendingMembers = summary?.membership.pending_approvals ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          {greeting}{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPIs */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiTile
            label="Active members"
            value={String(summary?.membership.active_members ?? 0)}
            icon={Users}
            index={0}
          />
          <KpiTile
            label="Pending approvals"
            value={String(pendingMembers)}
            icon={ClipboardList}
            index={1}
          />
          <KpiTile
            label="Total savings"
            value={money(summary?.financials.total_savings ?? "0")}
            icon={Wallet}
            index={2}
          />
          <KpiTile
            label="Loans disbursed"
            value={money(summary?.financials.total_loans_disbursed ?? "0")}
            icon={CreditCard}
            index={3}
          />
          <KpiTile
            label="Active loans"
            value={String(summary?.loans.active_loan_count ?? 0)}
            icon={Coins}
            index={4}
          />
          <KpiTile
            label="Loan applications"
            value={String(pendingLoanApps)}
            icon={RefreshCw}
            index={5}
          />
        </div>
      )}

      {/* Chart + pending actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 nm-raised-lg bg-surface rounded-3xl p-5">
          {chartLoading ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : chart ? (
            <ContributionChart data={chart} year={year} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              No contribution data for {year}.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Pending actions
          </p>
          <PendingRow
            label="Loan applications to review"
            count={pendingLoanApps}
            href={pendingLoanApps > 0 ? "/executive/loans" : undefined}
            index={0}
          />
          <PendingRow
            label={pendingMembers > 0 ? "Member approvals pending" : "Member approvals"}
            count={pendingMembers}
            index={1}
          />
          <div
            className="nm-inset rounded-2xl p-4 flex items-start gap-2.5"
            style={{ animation: "var(--animate-fade-up) 400ms both" }}
          >
            <ShieldCheck className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Member onboarding is handled by the society admin portal. Executives
              review loan applications and contribution cycles here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}