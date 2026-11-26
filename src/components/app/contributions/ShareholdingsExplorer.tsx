"use client";

/**
 * ShareholdingsExplorer — executive view of all member shareholdings.
 *
 * Shows all share subscriptions across the society with payment status.
 */

import { useState } from "react";
import { Share2, Search, Plus } from "lucide-react";
import { useShareholdings, useAllShareProducts } from "@/hooks/useContributions";
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
import { ShareSubscriptionSheet } from "./ShareSubscriptionSheet";
import { RecordSharePaymentDialog } from "./RecordSharePaymentDialog";

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

function ShareStatusBadge({ status }: { status: string }) {
  const styles = {
    subscribed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    part_paid: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    paid: "bg-green-500/10 text-green-600 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  const labels = {
    subscribed: "Subscribed",
    part_paid: "Part Paid",
    paid: "Paid",
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

export function ShareholdingsExplorer() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<string | null>(null);

  const PAGE_SIZE = 20;
  const shareholdings = useShareholdings(page, PAGE_SIZE);
  const products = useAllShareProducts();

  const items = shareholdings.data?.results ?? [];
  const total = shareholdings.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const filtered = items.filter((h) => {
    if (productFilter !== "all" && h.product !== productFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        h.member_name?.toLowerCase().includes(s) ||
        h.product_name?.toLowerCase().includes(s) ||
        h.certificate_reference?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalInvested = items.reduce(
    (sum, h) => sum + parseFloat(h.amount_paid || "0"),
    0
  );

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Share Capital</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage member share subscriptions and payments.
          </p>
        </div>
        <button
          onClick={() => setSubscribeOpen(true)}
          className="nm-btn-primary flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Subscription
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="nm-raised-lg rounded-3xl p-5">
          <p className="text-2xl font-bold text-foreground">
            {formatMoney(totalInvested.toString())}
          </p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Total invested
          </p>
        </div>
        <div className="nm-raised-lg rounded-3xl p-5">
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Total holdings
          </p>
        </div>
        <div className="nm-raised-lg rounded-3xl p-5">
          <p className="text-2xl font-bold text-foreground">
            {items.filter((h) => h.status === "paid").length}
          </p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Fully paid
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
              placeholder="Search members or certificates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-1 sm:w-48">
            <NmSelect
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="py-2.5"
            >
              <option value="all">All products</option>
              {(products.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NmSelect>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {shareholdings.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load shareholdings. Please try again." />
            </div>
          )}

          {shareholdings.isLoading ? (
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
                <Share2 className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-bold text-foreground">No shareholdings found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Try adjusting your filters or create a new subscription.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((h) => (
                  <TableRow key={h.id} className="group">
                    <TableCell className="text-sm font-semibold text-foreground">
                      {h.member_name || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {h.product_name || h.product}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {h.units}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      {h.units_paid}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      {formatMoney(h.amount_paid)}
                    </TableCell>
                    <TableCell>
                      <ShareStatusBadge status={h.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {h.certificate_reference || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {h.status !== "cancelled" && (
                        <button
                          onClick={() => setPaymentTarget(h.id)}
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
        {!shareholdings.isLoading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{from}</span>–
              <span className="font-semibold text-foreground">{to}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!shareholdings.data?.previous}
                onClick={() => setPage((p) => p - 1)}
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={!shareholdings.data?.next}
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

      {/* ── Dialogs ── */}
      <ShareSubscriptionSheet
        open={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />
      <RecordSharePaymentDialog
        open={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        holdingId={paymentTarget}
      />
    </div>
  );
}
