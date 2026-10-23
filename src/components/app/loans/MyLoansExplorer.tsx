"use client";

/**
 * MyLoansExplorer — member-facing loans page: eligibility check,
 * application flow, and active loans with repayment schedules.
 */

import { useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileCheck2,
  Handshake,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveLoans, useGuarantorRequests } from "@/hooks/useLoans";
import { LoanEligibilitySheet } from "./LoanEligibilitySheet";
import { LoanApplicationSheet } from "./LoanApplicationSheet";
import { MyLoanApplications } from "./MyLoanApplications";
import { GuaranteeRequestsPanel } from "./GuaranteeRequestsPanel";
import { LoanStatusBadge, RepaymentStatusBadge } from "./LoanBadges";
import { ApiError } from "@/lib/api/client";
import type { ActiveLoan } from "@/lib/types";

const money = (v: string) => `₦${Number(v).toLocaleString("en-NG")}`;
const PAGE_SIZE = 10;

/* ─── Active loan card ──────────────────────────────────────────── */

function LoanCard({ loan }: { loan: ActiveLoan }) {
  const [showSchedule, setShowSchedule] = useState(false);

  const totalRepayable = Number(loan.total_repayable);
  const progress =
    totalRepayable > 0
      ? Math.min(100, Math.round((Number(loan.total_paid) / totalRepayable) * 100))
      : 0;

  const summary: { label: string; value: string }[] = [
    { label: "Principal", value: money(loan.principal_amount) },
    { label: "Instalment", value: `${money(loan.monthly_installment)}/mo` },
    { label: "Interest", value: `${loan.interest_rate}% ${loan.interest_method === "reducing" ? "reducing" : "flat"}` },
    { label: "Term", value: `${loan.term_months} months` },
    { label: "Total repayable", value: money(loan.total_repayable) },
    { label: "Paid to date", value: money(loan.total_paid) },
  ];

  return (
    <div className="nm-raised-lg bg-surface rounded-3xl p-5">
      {/* Head */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">
                {money(loan.approved_amount)}
              </p>
              <LoanStatusBadge status={loan.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Disbursed {new Date(loan.opened_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              {loan.closed_at
                ? ` · Closed ${new Date(loan.closed_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`
                : ""}
            </p>
          </div>
        </div>
        <span className="text-xl font-bold text-foreground tabular-nums">
          {money(loan.outstanding_balance)}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-foreground">{progress}% repaid</span>
          <span className="text-muted-foreground">Outstanding balance</span>
        </div>
        <div className="h-2.5 rounded-full bg-border/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-dark transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mb-4">
        {summary.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              {label}
            </p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
          </div>
        ))}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
            Disbursement
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5 capitalize">
            {loan.disbursement_mode.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {/* Schedule toggle */}
      <button
        type="button"
        onClick={() => setShowSchedule((s) => !s)}
        className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
      >
        {showSchedule ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        Repayment schedule ({loan.repayment_schedule.length} instalments)
      </button>

      {showSchedule && (
        <div
          className="mt-3 overflow-x-auto"
          style={{ animation: "var(--animate-fade-up)" }}
        >
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-left border-b border-border/60">
                {["#", "Due cycle", "Principal", "Interest", "Amount due", "Received", "Status", "Paid"].map((h) => (
                  <th
                    key={h}
                    className="pb-2 pr-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loan.repayment_schedule.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 pr-3 text-xs font-semibold text-muted-foreground">
                    {item.installment_no}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-foreground">
                    {item.due_cycle ?? "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-foreground tabular-nums">
                    {money(item.principal_component)}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-foreground tabular-nums">
                    {money(item.interest_component)}
                  </td>
                  <td className="py-2.5 pr-3 text-xs font-semibold text-foreground tabular-nums">
                    {money(item.amount_due)}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-foreground tabular-nums">
                    {money(item.amount_received)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <RepaymentStatusBadge status={item.status} />
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                    {item.paid_at
                      ? new Date(item.paid_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Explorer ──────────────────────────────────────────────────── */

export function MyLoansExplorer() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"active" | "applications" | "guarantees">("active");
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ productId?: string; maxAmount?: string }>({
    productId: undefined,
    maxAmount: undefined,
  });

  const { data, isLoading, isError, error, refetch } = useActiveLoans(page, PAGE_SIZE);
  const { data: guaranteeRequests } = useGuarantorRequests();

  const pendingGuarantees = (guaranteeRequests ?? []).filter(
    (request) => request.guarantor_status === "pending"
  ).length;

  const loans = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  function handleEligibilityApply(productId: string, maxAmount: string) {
    setEligibilityOpen(false);
    setPrefill({ productId, maxAmount });
    setApplyOpen(true);
  }

  return (
    <div className="member-page member-loans-page flex flex-col gap-5">
      {/* Header + actions */}
      <header className="member-page-heading">
        <div>
          <p className="member-page-eyebrow">Borrowing</p>
          <h1>My loans</h1>
          <p>Check eligibility, apply for a loan, and track repayments.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEligibilityOpen(true)}
            className="nm-btn-primary flex items-center gap-2 rounded-xl bg-brand-primary text-white text-sm font-semibold px-4 py-2.5 hover:bg-brand-primary-hover transition-colors duration-200"
          >
            <ShieldCheck className="w-4 h-4" />
            Check eligibility
          </button>
          <button
            type="button"
            onClick={() => {
              setPrefill({ productId: undefined, maxAmount: undefined });
              setApplyOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl text-sm font-semibold px-4 py-2.5 nm-raised"
          >
            <FileCheck2 className="w-4 h-4" />
            Apply for loan
          </button>
        </div>
      </header>

      {/* Pending guarantee callout */}
      {pendingGuarantees > 0 && (
        <button
          type="button"
          onClick={() => setTab("guarantees")}
          className="nm-raised-lg bg-surface rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left transition-colors duration-200"
          style={{ borderLeft: "3px solid var(--warning)" }}
        >
          <div className="nm-inset rounded-xl w-10 h-10 flex items-center justify-center shrink-0">
            <Handshake className="w-5 h-5 text-warning" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {pendingGuarantees} guarantee{" "}
              {pendingGuarantees === 1 ? "request" : "requests"} awaiting your
              response
            </p>
            <p className="text-xs text-muted-foreground">
              A member has asked you to stand as guarantor for a loan.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 nm-inset rounded-xl p-1 w-fit">
        {(
          [
            { value: "active", label: "Active loans" },
            { value: "applications", label: "Applications" },
            { value: "guarantees", label: "Guarantee requests" },
          ] as const
        ).map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 ${
              tab === item.value
                ? "bg-brand-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
            {item.value === "guarantees" && pendingGuarantees > 0
              ? ` (${pendingGuarantees})`
              : ""}
          </button>
        ))}
      </div>

      {tab === "active" ? (
        <>
      {/* Loading / error / empty */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="nm-raised-lg bg-surface rounded-3xl p-5 text-center py-14 flex flex-col items-center gap-3">
          <p className="text-muted-foreground text-sm">
            {error instanceof ApiError
              ? error.messages[0]
              : "Could not load your loans."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-semibold text-brand-primary hover:underline"
          >
            Try again
          </button>
        </div>
      ) : loans.length === 0 ? (
        <div className="nm-raised-lg bg-surface rounded-3xl p-5 text-center py-16 flex flex-col items-center gap-3">
          <div className="nm-inset rounded-2xl w-14 h-14 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold text-sm">No active loans</p>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
            You don&apos;t have any active loans. Check your eligibility and apply
            to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Showing {from}–{to} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg nm-raised text-xs font-semibold disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg nm-raised text-xs font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

        </>
      ) : tab === "applications" ? (
        <MyLoanApplications />
      ) : (
        <GuaranteeRequestsPanel />
      )}

      {tab === "active" && isLoading && (
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Syncing…
        </p>
      )}

      {/* Flows */}
      <LoanEligibilitySheet
        open={eligibilityOpen}
        onClose={() => setEligibilityOpen(false)}
        onApply={handleEligibilityApply}
      />
      <LoanApplicationSheet
        open={applyOpen}
        onClose={() => {
          setApplyOpen(false);
          setPrefill({ productId: undefined, maxAmount: undefined });
        }}
        prefillProductId={prefill.productId}
        prefillMaxAmount={prefill.maxAmount}
      />

      <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
        <CalendarClock className="w-3.5 h-3.5" />
        Repayment schedules update after each cycle confirmation.
      </p>
    </div>
  );
}
