"use client";

/**
 * MyShareholdings — member-facing share register.
 *
 * Shows the member's own share subscriptions with paid units,
 * values, and certificate references. Includes subscribe action.
 */

import { useState } from "react";
import { Share2, TrendingUp, Award } from "lucide-react";
import { useMyShareholdings } from "@/hooks/useContributions";
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
import { ShareSubscriptionSheet } from "./ShareSubscriptionSheet";

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

/* ─── Sub-components ────────────────────────────────────────────── */

function ShareKpi({
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
        <Share2 className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <p className="text-sm font-bold text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Your share subscriptions will appear here once you invest.
      </p>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */

export function MyShareholdings() {
  const shareholdings = useMyShareholdings();
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const holdings = shareholdings.data ?? [];

  const totalPaid = holdings.reduce(
    (sum, h) => sum + parseFloat(h.amount_paid || "0"),
    0
  );
  const totalUnits = holdings.reduce((sum, h) => sum + h.units, 0);
  const totalPaidUnits = holdings.reduce((sum, h) => sum + h.units_paid, 0);

  return (
    <div className="member-page-content flex flex-col gap-5">
      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ShareKpi
          icon={TrendingUp}
          label="Total invested"
          value={formatMoney(totalPaid.toString())}
          hint="Across all share products"
          delay={0}
        />
        <ShareKpi
          icon={Award}
          label="Total units"
          value={totalUnits}
          hint={`${totalPaidUnits} paid`}
          delay={60}
        />
        <ShareKpi
          icon={Share2}
          label="Active holdings"
          value={holdings.filter((h) => h.status !== "cancelled").length}
          hint="Share subscriptions"
          delay={120}
        />
        <div
          className="nm-raised-lg rounded-3xl p-5 flex flex-col gap-3"
          style={{ animation: "var(--animate-fade-up)", animationDelay: "180ms" }}
        >
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">Ready to invest?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Subscribe to a share product to start earning dividends.
              </p>
            </div>
            <button
              onClick={() => setSubscribeOpen(true)}
              className="mt-4 nm-btn-primary rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors"
            >
              Subscribe to Shares
            </button>
          </div>
        </div>
      </div>

      {/* ── Holdings table ── */}
      <div className="nm-raised-lg rounded-3xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-foreground">Your shareholdings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share subscriptions, payments, and certificate references.
            </p>
          </div>
        </div>

        <div className="px-4 pb-4">
          {shareholdings.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load your shareholdings. Please try again." />
            </div>
          )}

          {shareholdings.isLoading ? (
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
          ) : holdings.length === 0 ? (
            <NoRows message="No shareholdings yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Paid units</TableHead>
                  <TableHead className="text-right">Amount paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Subscribed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((h) => (
                  <TableRow key={h.id} className="group">
                    <TableCell className="text-sm font-semibold text-foreground">
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
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(h.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* ── Subscribe sheet ── */}
      <ShareSubscriptionSheet
        open={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />
    </div>
  );
}
