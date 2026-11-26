"use client";

/**
 * ExitRequestsExplorer — executive view of all exit requests.
 *
 * Shows all member exit requests with review and settlement actions.
 */

import { useState } from "react";
import { LogOut, Search } from "lucide-react";
import { useExitRequests } from "@/hooks/useContributions";
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
import { ReviewExitRequestDialog } from "./ReviewExitRequestDialog";
import { MarkSettledDialog } from "./MarkSettledDialog";

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

function ExitStatusBadge({ status }: { status: string }) {
  const styles = {
    submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    in_review: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-600 border-green-500/20",
    rejected: "bg-red-500/10 text-red-600 border-red-500/20",
    settled: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  };
  const labels = {
    submitted: "Submitted",
    in_review: "In Review",
    approved: "Approved",
    rejected: "Rejected",
    settled: "Settled",
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

export function ExitRequestsExplorer() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewTarget, setReviewTarget] = useState<string | null>(null);
  const [settleTarget, setSettleTarget] = useState<string | null>(null);

  const PAGE_SIZE = 20;
  const exitRequests = useExitRequests(page, PAGE_SIZE);

  const items = exitRequests.data?.results ?? [];
  const total = exitRequests.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const filtered = items.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        r.member_profile?.toLowerCase().includes(s) ||
        r.reason?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exit Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and process member exit requests.
        </p>
      </div>

      {/* ── Table ── */}
      <div className="nm-raised-lg rounded-3xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <NmInput
              placeholder="Search requests..."
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
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="settled">Settled</option>
            </NmSelect>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {exitRequests.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load exit requests. Please try again." />
            </div>
          )}

          {exitRequests.isLoading ? (
            <div className="flex flex-col gap-3 pt-3">
              {Array.from({ length: 5 }).map((_, i) => (
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
                <LogOut className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-bold text-foreground">No exit requests found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Exit Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Proposed Payable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="group">
                    <TableCell className="text-sm font-semibold text-foreground">
                      {r.member_profile || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(r.requested_exit_date)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {r.reason}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      {r.proposed_payable ? formatMoney(r.proposed_payable) : "—"}
                    </TableCell>
                    <TableCell>
                      <ExitStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(r.status === "submitted" || r.status === "in_review") && (
                          <button
                            onClick={() => setReviewTarget(r.id)}
                            className="nm-chip rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10 transition-colors"
                          >
                            Review
                          </button>
                        )}
                        {r.status === "approved" && (
                          <button
                            onClick={() => setSettleTarget(r.id)}
                            className="nm-chip rounded-lg px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-500/10 transition-colors"
                          >
                            Mark settled
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {!exitRequests.isLoading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{from}</span>–
              <span className="font-semibold text-foreground">{to}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!exitRequests.data?.previous}
                onClick={() => setPage((p) => p - 1)}
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={!exitRequests.data?.next}
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
      <ReviewExitRequestDialog
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        requestId={reviewTarget}
      />
      <MarkSettledDialog
        open={!!settleTarget}
        onClose={() => setSettleTarget(null)}
        requestId={settleTarget}
      />
    </div>
  );
}
