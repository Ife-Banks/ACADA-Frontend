"use client";

/**
 * LedgerExplorer — Financial Ledger for EXECUTIVE+.
 *
 * Immutable record of every member money movement
 * (GET /contributions/ledger/) — contributions, penalties, loan payouts
 * and repayments, and adjustments.
 */

import { useMemo, useState } from "react";
import { Search, BookOpen, TrendingUp, TrendingDown, Inbox } from "lucide-react";
import { useLedger } from "@/hooks/useContributions";
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
import { NmInput, NmSelect, NmErrorBanner } from "@/components/app/shared/NmField";
import { LedgerEventBadge } from "./ContributionBadges";

const PAGE_SIZE = 25;

/* ─── Helpers ───────────────────────────────────────────────────── */

function formatMoney(value?: string | null) {
  if (!value) return "₦0";
  const n = parseFloat(value);
  if (Number.isNaN(n)) return "₦0";
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─── Main component ────────────────────────────────────────────── */

export function LedgerExplorer() {
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("all");
  const [page, setPage] = useState(1);

  const list = useLedger(page, PAGE_SIZE);

  const filtered = useMemo(() => {
    const rows = list.data?.results ?? [];
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesType = eventType === "all" || r.event_type === eventType;
      if (!matchesType) return false;
      if (!term) return true;
      return r.description.toLowerCase().includes(term);
    });
  }, [list.data, search, eventType]);

  const total = list.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col gap-6">
      {/* Intro note */}
      <div className="nm-raised-lg rounded-3xl p-5 flex items-start gap-3" style={{ animation: "var(--animate-fade-up)" }}>
        <span className="w-10 h-10 rounded-xl bg-brand-primary/8 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-brand-primary" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-foreground">Immutable financial history</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
            Every member money movement is recorded here: contributions,
            penalties, loan payouts and repayments, and officer adjustments.
            Entries cannot be edited or deleted.
          </p>
        </div>
      </div>

      {/* ── Ledger table ── */}
      <div className="nm-raised-lg rounded-3xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3">
            <NmInput
              icon={Search}
              type="search"
              placeholder="Search by description…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="py-2.5"
            />
            <NmSelect
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(1);
              }}
              className="py-2.5"
            >
              <option value="all">All event types</option>
              <option value="contribution_credit">Contributions</option>
              <option value="extra_contribution">Extra contributions</option>
              <option value="penalty_debit">Penalties</option>
              <option value="loan_disbursement">Loan payouts</option>
              <option value="loan_repayment">Loan repayments</option>
              <option value="adjustment_credit">Adjustment (credit)</option>
              <option value="adjustment_debit">Adjustment (debit)</option>
            </NmSelect>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {list.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load the ledger. Check your connection and try again." />
            </div>
          )}

          {list.isLoading ? (
            <div className="flex flex-col gap-3 pt-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14 gap-3">
              <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center">
                <Inbox className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {search || eventType !== "all"
                  ? "No ledger entries match your filters."
                  : "No ledger entries yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance after</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const debit = parseFloat(r.debit);
                  const credit = parseFloat(r.credit);
                  return (
                    <TableRow key={r.id} className="group">
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(r.posted_at)}
                      </TableCell>
                      <TableCell>
                        <LedgerEventBadge type={r.event_type} />
                      </TableCell>
                      <TableCell className="text-sm text-foreground max-w-xs truncate">
                        {r.description}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right text-sm font-semibold whitespace-nowrap",
                          debit > 0 ? "text-destructive" : "text-muted-foreground"
                        )}
                      >
                        {debit > 0 ? formatMoney(r.debit) : "—"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right text-sm font-semibold whitespace-nowrap",
                          credit > 0 ? "text-success" : "text-muted-foreground"
                        )}
                      >
                        {credit > 0 ? formatMoney(r.credit) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-foreground whitespace-nowrap">
                        {formatMoney(r.balance_after)}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-success" />
          Credit (money in)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          Debit (money out)
        </span>
      </div>
    </div>
  );
}