"use client";

/**
 * DividendDeclarationsExplorer — manage dividend declarations.
 *
 * Shows all dividend declarations with status and actions for approval.
 */

import { useState } from "react";
import { Coins, Plus, CheckCircle } from "lucide-react";
import { useDividendDeclarations } from "@/hooks/useContributions";
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
import { CreateDividendDeclarationDialog } from "./CreateDividendDeclarationDialog";
import { ApproveDividendDialog } from "./ApproveDividendDialog";

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

function DeclarationStatusBadge({ status }: { status: string }) {
  const styles = {
    proposed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    approved: "bg-green-500/10 text-green-600 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  const labels = {
    proposed: "Proposed",
    approved: "Approved",
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

export function DividendDeclarationsExplorer() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<string | null>(null);

  const PAGE_SIZE = 20;
  const declarations = useDividendDeclarations(page, PAGE_SIZE);

  const items = declarations.data?.results ?? [];
  const total = declarations.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dividend Declarations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Declare and manage member dividends from share capital.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="nm-btn-primary flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Declaration
        </button>
      </div>

      {/* ── Table ── */}
      <div className="nm-raised-lg rounded-3xl overflow-hidden">
        <div className="px-4 pb-4">
          {declarations.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load declarations. Please try again." />
            </div>
          )}

          {declarations.isLoading ? (
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
            <div className="flex flex-col items-center justify-center text-center py-14 gap-3">
              <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center">
                <Coins className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-bold text-foreground">No dividend declarations yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Create a declaration to distribute dividends to shareholders.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Financial Year</TableHead>
                  <TableHead>Record Date</TableHead>
                  <TableHead className="text-right">Per Share</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AGM Reference</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => (
                  <TableRow key={d.id} className="group">
                    <TableCell className="text-sm font-semibold text-foreground">
                      {d.financial_year}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(d.record_date)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      {formatMoney(d.per_share_amount)}
                    </TableCell>
                    <TableCell>
                      <DeclarationStatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {d.agm_reference || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {d.status === "proposed" && (
                        <button
                          onClick={() => setApproveTarget(d.id)}
                          className="nm-chip inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-500/10 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
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
        {!declarations.isLoading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{from}</span>–
              <span className="font-semibold text-foreground">{to}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!declarations.data?.previous}
                onClick={() => setPage((p) => p - 1)}
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={!declarations.data?.next}
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
      <CreateDividendDeclarationDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <ApproveDividendDialog
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        declarationId={approveTarget}
      />
    </div>
  );
}
