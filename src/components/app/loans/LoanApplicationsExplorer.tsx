"use client";

/**
 * LoanApplicationsExplorer — executive list of loan applications with
 * status filters, quick stats and links to the decision view.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, CreditCard, Loader2, Search, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NmInput, NmSelect } from "@/components/app/shared/NmField";
import { useLoanApplications } from "@/hooks/useLoans";
import { LoanApplicationStatusBadge } from "./LoanBadges";
import { ApiError } from "@/lib/api/client";
import type { LoanApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const money = (v: string) => `₦${Number(v).toLocaleString("en-NG")}`;
const PAGE_SIZE = 25;

type StatusFilter = "all" | LoanApplicationStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "guarantor_pending", label: "Awaiting guarantors" },
  { value: "evaluating", label: "Evaluating" },
  { value: "escalated", label: "Escalated" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
  { value: "disbursed", label: "Disbursed" },
];

/* ─── Stat tile ─────────────────────────────────────────────────── */

function StatTile({
  label,
  value,
  inactive,
  onClick,
  index,
}: {
  label: string;
  value: string;
  inactive?: boolean;
  onClick?: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className={cn(
        "nm-raised bg-surface rounded-3xl p-5 text-left flex flex-col gap-1.5 transition-all duration-200",
        onClick && "hover:-translate-y-0.5 hover:shadow-lg",
        inactive && "opacity-50"
      )}
      style={{ animation: `var(--animate-fade-up) ${150 + index * 60}ms both` }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xl font-bold text-foreground leading-tight">{value}</span>
    </button>
  );
}

/* ─── Explorer ──────────────────────────────────────────────────── */

export function LoanApplicationsExplorer() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error, refetch } = useLoanApplications(page, PAGE_SIZE);

  const rows = useMemo(() => data?.results ?? [], [data]);
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesStatus = status === "all" || r.status === status;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.member_name.toLowerCase().includes(q) ||
        r.product_name.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [rows, status, search]);

  const stats = useMemo(() => {
    const awaitingAction = rows.filter((r) =>
      ["submitted", "evaluating", "escalated"].includes(r.status)
    ).length;
    const awaitingGuarantors = rows.filter(
      (r) => r.status === "guarantor_pending"
    ).length;
    const approved = rows.filter((r) =>
      ["approved", "disbursed"].includes(r.status)
    ).length;
    return { total: rows.length, awaitingAction, awaitingGuarantors, approved };
  }, [rows]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-1">Loan Applications</h1>
        <p className="text-muted-foreground text-sm">
          Review and approve escalated loan applications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Applications"
          value={String(stats.total)}
          index={0}
          onClick={() => setStatus("all")}
          inactive={status !== "all"}
        />
        <StatTile
          label="Awaiting decision"
          value={String(stats.awaitingAction)}
          index={1}
          onClick={() => setStatus("submitted")}
          inactive={status !== "submitted"}
        />
        <StatTile
          label="Awaiting guarantors"
          value={String(stats.awaitingGuarantors)}
          index={2}
          onClick={() => setStatus("guarantor_pending")}
          inactive={status !== "guarantor_pending"}
        />
        <StatTile
          label="Approved / paid"
          value={String(stats.approved)}
          index={3}
          onClick={() => setStatus("approved")}
          inactive={status !== "approved"}
        />
      </div>

      {/* List */}
      <div className="nm-raised-lg bg-surface rounded-3xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <NmInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member or product…"
              className="pl-9"
            />
          </div>
          <NmSelect
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="w-[190px]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NmSelect>
        </div>

        {isError ? (
          <div className="text-center py-14 flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm">
              {error instanceof ApiError
                ? error.messages[0]
                : "Could not load loan applications."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm font-semibold text-brand-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 flex flex-col items-center gap-3">
            <Users className="w-6 h-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No loan applications match your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="text-left border-b border-border/60">
                  {["Member", "Product", "Amount", "Term", "Submitted", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="pb-2.5 pr-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40 transition-colors duration-150">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-primary">
                          {r.member_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate">
                          {r.member_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-foreground whitespace-nowrap">
                      {r.product_name}
                    </td>
                    <td className="py-3.5 pr-4 text-sm font-semibold text-foreground whitespace-nowrap tabular-nums">
                      {money(r.amount_requested)}
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-foreground whitespace-nowrap">
                      {r.term_months} mo
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                      {r.submitted_at
                        ? new Date(r.submitted_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="py-3.5 pr-4">
                      <LoanApplicationStatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 pr-1 text-right">
                      <Link
                        href={`/executive/loans/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline whitespace-nowrap"
                      >
                        Review <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
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

        {isLoading && (
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mt-3">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Syncing…
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
        <CreditCard className="w-3.5 h-3.5" />
        Select an application to review its rule evaluation, guarantors and approval trail.
      </p>
    </div>
  );
}