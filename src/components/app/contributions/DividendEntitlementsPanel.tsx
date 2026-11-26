"use client";

/**
 * DividendEntitlementsPanel — member-facing dividend entitlements.
 *
 * Shows the member's dividend entitlements from approved declarations.
 */

import { useState } from "react";
import { Coins, TrendingUp, Calendar } from "lucide-react";
import { useDividendEntitlements } from "@/hooks/useContributions";
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
import { NmErrorBanner } from "@/components/app/shared/NmField";

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

function EntitlementStatusBadge({ status }: { status: string }) {
  const styles = {
    proposed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    payable: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    paid: "bg-green-500/10 text-green-600 border-green-500/20",
    withheld: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    reinvested: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  const labels = {
    proposed: "Proposed",
    payable: "Payable",
    paid: "Paid",
    withheld: "Withheld",
    reinvested: "Reinvested",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border",
        styles[status as keyof typeof styles] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

/* ─── Sub-components ────────────────────────────────────────────── */

function EntitlementKpi({
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
        <Coins className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <p className="text-sm font-bold text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Your dividend entitlements will appear here when declarations are made.
      </p>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */

export function DividendEntitlementsPanel() {
  const entitlements = useDividendEntitlements();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const items = entitlements.data?.results ?? [];
  const total = entitlements.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const totalPayable = items
    .filter((e) => e.status === "payable")
    .reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
  const totalPaid = items
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);

  return (
    <div className="member-page-content flex flex-col gap-5">
      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EntitlementKpi
          icon={TrendingUp}
          label="Total dividends"
          value={formatMoney(items.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0).toString())}
          hint="All entitlements"
          delay={0}
        />
        <EntitlementKpi
          icon={Calendar}
          label="Payable now"
          value={formatMoney(totalPayable.toString())}
          hint="Approved declarations"
          delay={60}
        />
        <EntitlementKpi
          icon={Coins}
          label="Paid to date"
          value={formatMoney(totalPaid.toString())}
          hint="Received dividends"
          delay={120}
        />
        <EntitlementKpi
          icon={Coins}
          label="Entitlements"
          value={items.length}
          hint="Total records"
          delay={180}
        />
      </div>

      {/* ── Entitlements table ── */}
      <div className="nm-raised-lg rounded-3xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-foreground">Dividend entitlements</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your share of declared dividends based on paid units.
            </p>
          </div>
        </div>

        <div className="px-4 pb-4">
          {entitlements.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load dividend entitlements. Please try again." />
            </div>
          )}

          {entitlements.isLoading ? (
            <div className="flex flex-col gap-3 pt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <NoRows message="No dividend entitlements yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Declaration</TableHead>
                  <TableHead className="text-right">Eligible units</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment ref</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((e) => (
                  <TableRow key={e.id} className="group">
                    <TableCell className="text-sm font-semibold text-foreground">
                      {e.declaration}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {e.eligible_units}
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold text-foreground">
                      {formatMoney(e.amount)}
                    </TableCell>
                    <TableCell>
                      <EntitlementStatusBadge status={e.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {e.payment_reference || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {!entitlements.isLoading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{from}</span>–
              <span className="font-semibold text-foreground">{to}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!entitlements.data?.previous}
                onClick={() => setPage((p) => p - 1)}
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={!entitlements.data?.next}
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
