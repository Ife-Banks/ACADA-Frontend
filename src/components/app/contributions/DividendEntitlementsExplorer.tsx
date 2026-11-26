"use client";

/**
 * DividendEntitlementsExplorer — executive view of all dividend entitlements.
 *
 * Shows all member dividend entitlements with payment status.
 */

import { useState } from "react";
import { Coins, Search } from "lucide-react";
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
import { NmErrorBanner, NmInput, NmSelect } from "@/components/app/shared/NmField";
import { RecordDividendPaymentDialog } from "./RecordDividendPaymentDialog";

/* ─── Helpers ───────────────────────────────────────────────────── */

function formatMoney(value?: string | null) {
  if (!value) return "₦0";
  const n = parseFloat(value);
  if (Number.isNaN(n)) return "₦0";
  return `₦${n.toLocaleString("en-NG")}`;
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

/* ─── Main component ────────────────────────────────────────────── */

export function DividendEntitlementsExplorer() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentTarget, setPaymentTarget] = useState<string | null>(null);

  const PAGE_SIZE = 20;
  const entitlements = useDividendEntitlements(page, PAGE_SIZE);

  const items = entitlements.data?.results ?? [];
  const total = entitlements.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const filtered = items.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return e.member_name?.toLowerCase().includes(s);
    }
    return true;
  });

  const totalPayable = items
    .filter((e) => e.status === "payable")
    .reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dividend Entitlements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and record dividend payments to members.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="nm-raised-lg rounded-3xl p-5">
          <p className="text-2xl font-bold text-foreground">
            {formatMoney(totalPayable.toString())}
          </p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Total payable
          </p>
        </div>
        <div className="nm-raised-lg rounded-3xl p-5">
          <p className="text-2xl font-bold text-foreground">
            {items.filter((e) => e.status === "paid").length}
          </p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Paid count
          </p>
        </div>
        <div className="nm-raised-lg rounded-3xl p-5">
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Total entitlements
          </p>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="nm-raised-lg rounded-3xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <NmInput
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-1 sm:w-40">
            <NmSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5"
            >
              <option value="all">All statuses</option>
              <option value="proposed">Proposed</option>
              <option value="payable">Payable</option>
              <option value="paid">Paid</option>
              <option value="withheld">Withheld</option>
              <option value="reinvested">Reinvested</option>
            </NmSelect>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {entitlements.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load entitlements. Please try again." />
            </div>
          )}

          {entitlements.isLoading ? (
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
            <div className="flex flex-col items-center justify-center text-center py-14 gap-3">
              <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center">
                <Coins className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-bold text-foreground">No entitlements found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Declaration</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment ref</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id} className="group">
                    <TableCell className="text-sm font-semibold text-foreground">
                      {e.member_name || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
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
                    <TableCell className="text-right">
                      {e.status === "payable" && (
                        <button
                          onClick={() => setPaymentTarget(e.id)}
                          className="nm-chip rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10 transition-colors"
                        >
                          Record payment
                        </button>
                      )}
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

      {/* ── Dialog ── */}
      <RecordDividendPaymentDialog
        open={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        entitlementId={paymentTarget}
      />
    </div>
  );
}
