"use client";

/**
 * MyContributionsExplorer — member-facing Contributions page.
 *
 * Top balance summary (GET /contributions/my/balance/) plus the
 * member's own entry history (GET /contributions/my/). Read-only.
 */

import { useMemo, useState } from "react";
import {
  PiggyBank,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Wallet,
  Inbox,
} from "lucide-react";
import { useMyBalance, useMyContributions, useContributionPlans } from "@/hooks/useContributions";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { NmSelect, NmErrorBanner } from "@/components/app/shared/NmField";
import { EntryStatusBadge, EntryTypeBadge } from "./ContributionBadges";

const PAGE_SIZE = 20;

/* ─── Helpers ───────────────────────────────────────────────────── */

function formatMoney(value?: string | null) {
  if (!value) return "₦0";
  const n = parseFloat(value);
  if (Number.isNaN(n)) return "₦0";
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ─── Sub-components ────────────────────────────────────────────── */

function BalanceKpi({
  icon: Icon,
  label,
  value,
  hint,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  hint?: string;
  delay: number;
}) {
  return (
    <div
      className="nm-raised-lg rounded-3xl p-5 flex flex-col gap-3"
      style={{ animation: "var(--animate-fade-up)", animationDelay: `${delay}ms` }}
    >
      <div className="w-10 h-10 rounded-xl bg-brand-primary/8 flex items-center justify-center">
        <Icon className="w-5 h-5 text-brand-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{label}</p>
        {hint && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function NoRows({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 gap-3">
      <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center">
        <Inbox className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <p className="text-sm font-bold text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Your active cycle contributions will appear here as they are processed.
      </p>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */

export function MyContributionsExplorer() {
  const balance = useMyBalance();
  const plans = useContributionPlans();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const defaultPlan =
    (plans.data?.results ?? []).find((p) => p.is_active) ??
    (plans.data?.results ?? [])[0];

  const list = useMyContributions(page, PAGE_SIZE);

  const filtered = useMemo(() => {
    const rows = list.data?.results ?? [];
    if (status === "all") return rows;
    return rows.filter((r) => r.status === status);
  }, [list.data, status]);

  const total = list.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Balance summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="nm-raised-lg rounded-3xl p-5 sm:col-span-2 lg:col-span-1 lg:row-span-2 flex flex-col gap-3"
          style={{ animation: "var(--animate-fade-up)" }}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-primary/8 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-brand-primary">
              {balance.isLoading ? "…" : formatMoney(balance.data?.current_balance)}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-1">
              Current balance
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <p className="text-lg font-bold text-foreground">
                {balance.isLoading ? "…" : balance.data?.total_cycles ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                Cycles
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {balance.isLoading ? "…" : balance.data?.confirmed_count ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                Confirmed
              </p>
            </div>
            <div className="col-span-2 pt-1 border-t border-border flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <XCircle className="w-3.5 h-3.5 text-destructive" />
                {balance.data?.missed_count ?? 0} missed
              </span>
            </div>
          </div>
        </div>

        <BalanceKpi
          icon={CalendarDays}
          label="Total due"
          value={balance.isLoading ? "…" : formatMoney(balance.data?.total_due)}
          hint="Across all cycles"
          delay={60}
        />
        <BalanceKpi
          icon={CheckCircle2}
          label="Total received"
          value={balance.isLoading ? "…" : formatMoney(balance.data?.total_received)}
          hint="Confirmed contributions"
          delay={120}
        />
        <BalanceKpi
          icon={PiggyBank}
          label="Contribution plan"
          value={plans.isLoading ? "…" : defaultPlan?.plan_name ?? "—"}
          hint={
            defaultPlan
              ? `₦${parseFloat(defaultPlan.amount_fixed).toLocaleString("en-NG")}/month`
              : "No active plan"
          }
          delay={180}
        />
      </div>

      {/* ── History ── */}
      <div className="nm-raised-lg rounded-3xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-foreground">Contribution history</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your entry-level history for every monthly cycle.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:w-44">
            <NmSelect
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="py-2.5"
            >
              <option value="all">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="missed">Missed</option>
            </NmSelect>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {list.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load your contributions. Check your connection and try again." />
            </div>
          )}

          {list.isLoading ? (
            <div className="flex flex-col gap-3 pt-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <NoRows message={status === "all" ? "No contributions yet." : "No entries match this status."} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount due</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id} className="group">
                    <TableCell className="text-sm font-semibold text-foreground">
                      {e.cycle}
                    </TableCell>
                    <TableCell>
                      <EntryTypeBadge type={e.entry_type} />
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatMoney(e.amount_due)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      {formatMoney(e.amount_received)}
                    </TableCell>
                    <TableCell>
                      <EntryStatusBadge status={e.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(e.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {!list.isLoading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{from}</span>–
              <span className="font-semibold text-foreground">{to}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!list.data?.previous}
                onClick={() => setPage((p) => p - 1)}
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={!list.data?.next}
                onClick={() => setPage((p) => p + 1)}
                className={cn(
                  "nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}