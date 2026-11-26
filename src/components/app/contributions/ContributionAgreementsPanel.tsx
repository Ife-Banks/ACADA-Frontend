"use client";

/**
 * ContributionAgreementsPanel — manage member-specific contribution agreements.
 *
 * Allows society admins to set custom contribution amounts for specific members.
 */

import { useState } from "react";
import { FileText, Plus, Search } from "lucide-react";
import { useContributionAgreements } from "@/hooks/useContributions";
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
import { NmErrorBanner, NmInput } from "@/components/app/shared/NmField";
import { CreateAgreementDialog } from "./CreateAgreementDialog";

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

/* ─── Main component ────────────────────────────────────────────── */

export function ContributionAgreementsPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const PAGE_SIZE = 20;
  const agreements = useContributionAgreements(page, PAGE_SIZE);

  const items = agreements.data?.results ?? [];
  const total = agreements.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const filtered = items.filter((a) => {
    if (search) {
      const s = search.toLowerCase();
      return (
        a.member_profile?.toLowerCase().includes(s) ||
        a.reason?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contribution Agreements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Member-specific contribution amounts and terms.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="nm-btn-primary flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Agreement
        </button>
      </div>

      {/* ── Table ── */}
      <div className="nm-raised-lg rounded-3xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <NmInput
              placeholder="Search agreements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {agreements.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load agreements. Please try again." />
            </div>
          )}

          {agreements.isLoading ? (
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
                <FileText className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-bold text-foreground">No agreements found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Create an agreement to set custom contribution amounts for a member.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Effective To</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Approved By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id} className="group">
                    <TableCell className="text-sm font-semibold text-foreground">
                      {a.member_profile || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.plan}
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold text-foreground">
                      {formatMoney(a.amount)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(a.effective_from)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.effective_to ? formatDate(a.effective_to) : "Ongoing"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {a.reason}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.approved_by_name || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {!agreements.isLoading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{from}</span>–
              <span className="font-semibold text-foreground">{to}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!agreements.data?.previous}
                onClick={() => setPage((p) => p - 1)}
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={!agreements.data?.next}
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
      <CreateAgreementDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
