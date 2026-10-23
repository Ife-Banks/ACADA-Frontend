"use client";

/**
 * CycleDetailView — executive cycle detail.
 *
 * Header card with cycle meta, then two tabs:
 *   Entries   — GET /contributions/cycles/{id}/entries/ (+ single/bulk confirm)
 *   Penalties — GET /contributions/cycles/{id}/penalties/
 */

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  CalendarDays,
  ClipboardCheck,
  Users,
  CheckCircle2,
  Hash,
  Inbox,
} from "lucide-react";
import {
  useCycle,
  useCycleEntries,
  useCyclePenalties,
} from "@/hooks/useContributions";
import type { ContributionEntry } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NmSelect, NmErrorBanner } from "@/components/app/shared/NmField";
import { useAuth } from "@/hooks/useAuth";
import {
  CycleStatusBadge,
  EntryStatusBadge,
  EntryTypeBadge,
  PenaltyStatusBadge,
  PenaltyTypeBadge,
} from "./ContributionBadges";
import { ConfirmEntryDialog } from "./ConfirmEntryDialog";
import { ConfirmCycleBulkSheet } from "./ConfirmCycleBulkSheet";

const PAGE_SIZE = 25;

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

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-lg nm-inset flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
          {label}
        </p>
        <p className="text-sm font-bold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */

export function CycleDetailView({ id }: { id: string }) {
  const cycle = useCycle(id);
  const { isExecutiveOrAbove, user } = useAuth();

  const [tab, setTab] = useState("entries");
  const [entryStatus, setEntryStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [confirmEntry, setConfirmEntry] = useState<ContributionEntry | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const entries = useCycleEntries(id, page, PAGE_SIZE, entryStatus === "all" ? undefined : entryStatus);
  const penalties = useCyclePenalties(id);

  const entryRows = entries.data?.results ?? [];
  const penaltyRows = penalties.data ?? [];
  const total = entries.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const openPendingCount = entryRows.filter((e) => e.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Back link ── */}
      <Link
        href="/executive/cycles"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        All cycles
      </Link>

      {/* ── Header card ── */}
      <div
        className="nm-raised-lg rounded-3xl p-6"
        style={{ animation: "var(--animate-fade-up)" }}
      >
        {cycle.isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-56 rounded-xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ) : cycle.isError ? (
          <NmErrorBanner message="Could not load this cycle. Check your connection and try again." />
        ) : !cycle.data ? null : (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl nm-inset flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {cycle.data.period_display}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Created {formatDate(cycle.data.created_at)}
                  </p>
                </div>
              </div>
              <CycleStatusBadge status={cycle.data.status} />
            </div>

            {cycle.data.notes && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {cycle.data.notes}
              </p>
            )}

            {/* Confirmation progress */}
            <div className="nm-inset rounded-2xl px-4 py-3 mt-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold text-muted-foreground">
                  Contribution confirmation
                </p>
                <p className="text-xs font-bold text-foreground">
                  {cycle.data.confirmed_count}/{cycle.data.entry_count} confirmed
                </p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-success transition-all duration-500"
                  style={{
                    width: `${
                      cycle.data.entry_count === 0
                        ? 0
                        : (cycle.data.confirmed_count / cycle.data.entry_count) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              <MetaItem
                icon={Users}
                label="Entries"
                value={cycle.data.entry_count}
              />
              <MetaItem
                icon={CheckCircle2}
                label="Confirmed"
                value={cycle.data.confirmed_count}
              />
              <MetaItem
                icon={Hash}
                label="Generated by"
                value={
                  cycle.data.generated_by_name ??
                  (cycle.data.generated_by === user?.id
                    ? user?.full_name ?? "You"
                    : "Society officer")
                }
              />
              <MetaItem
                icon={CalendarDays}
                label="Closed"
                value={cycle.data.closed_at ? formatDate(cycle.data.closed_at) : "Not closed"}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); }}>
        <TabsList variant="line" className="gap-4">
          <TabsTrigger value="entries" className="text-sm">
            Entries
            {entryRows.length > 0 && (
              <span className="ml-1.5 h-5 min-w-5 px-1.5 rounded-full nm-chip text-[10px] font-bold text-brand-primary flex items-center justify-center">
                {total}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="penalties" className="text-sm">
            Penalties
            {penaltyRows.length > 0 && (
              <span className="ml-1.5 h-5 min-w-5 px-1.5 rounded-full nm-chip text-[10px] font-bold text-warning flex items-center justify-center">
                {penaltyRows.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ══ Entries ══ */}
        <TabsContent value="entries" className="mt-4">
          <div className="nm-raised-lg rounded-3xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_170px] gap-3">
                <NmSelect
                  value={entryStatus}
                  onChange={(e) => {
                    setEntryStatus(e.target.value);
                    setPage(1);
                  }}
                  className="py-2.5"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="partial">Partial</option>
                  <option value="missed">Missed</option>
                </NmSelect>
              </div>
              {isExecutiveOrAbove && (
                <button
                  type="button"
                  disabled={openPendingCount === 0}
                  onClick={() => setBulkOpen(true)}
                  className="nm-btn-primary inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white font-semibold text-sm px-4 py-2.5 hover:bg-brand-primary-hover transition-colors duration-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Confirm pending
                  {openPendingCount > 0 && (
                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center">
                      {openPendingCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            <div className="px-4 pb-4">
              {entries.isError && (
                <div className="pt-4">
                  <NmErrorBanner message="Could not load entries for this cycle." />
                </div>
              )}

              {entries.isLoading ? (
                <div className="flex flex-col gap-3 pt-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-11 w-full rounded-xl" />
                  ))}
                </div>
              ) : entryRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-14 gap-3">
                  <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center">
                    <Inbox className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    No entries for this cycle.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead className="text-right">Received</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entryRows.map((e) => (
                      <TableRow key={e.id} className="group">
                        <TableCell>
                          <p className="text-sm font-semibold text-foreground truncate">
                            {e.member_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {e.member_email}
                          </p>
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
                        <TableCell className="text-right">
                          {e.status === "pending" && isExecutiveOrAbove ? (
                            <button
                              type="button"
                              onClick={() => setConfirmEntry(e)}
                              className="nm-chip inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold text-brand-primary hover:bg-brand-primary/10 px-3 py-1.5 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirm
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {e.confirmed_by_name ??
                                (e.confirmed_by
                                  ? e.confirmed_by === user?.id
                                    ? "You"
                                    : "Society officer"
                                  : "—")}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {!entries.isLoading && total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{from}</span>–
                  <span className="font-semibold text-foreground">{to}</span> of{" "}
                  <span className="font-semibold text-foreground">{total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!entries.data?.previous}
                    onClick={() => setPage((p) => p - 1)}
                    className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={!entries.data?.next}
                    onClick={() => setPage((p) => p + 1)}
                    className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ══ Penalties ══ */}
        <TabsContent value="penalties" className="mt-4">
          <div className="nm-raised-lg rounded-3xl overflow-hidden">
            <div className="px-4 pb-4 pt-4">
              {penalties.isLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : penalties.isError ? (
                <NmErrorBanner message="Could not load penalties for this cycle." />
              ) : penaltyRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-14 gap-3">
                  <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    No penalties for this cycle.
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                    Late or missed contribution penalties will appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[28%]">Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Waived by</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {penaltyRows.map((p) => (
                      <TableRow key={p.id} className="group">
                        <TableCell className="text-sm font-semibold text-foreground">
                          {p.member_name}
                        </TableCell>
                        <TableCell>
                          <PenaltyTypeBadge type={p.penalty_type} />
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-destructive">
                          {formatMoney(p.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {p.reason || "—"}
                        </TableCell>
                        <TableCell>
                          <PenaltyStatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {p.waived_by_name ??
                            (p.waived_by
                              ? p.waived_by === user?.id
                                ? "You"
                                : "Society officer"
                              : "—")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Action surfaces ── */}
      {isExecutiveOrAbove && (
        <>
          <ConfirmEntryDialog
            open={!!confirmEntry}
            onClose={() => setConfirmEntry(null)}
            entry={confirmEntry}
            cycleId={id}
          />
          <ConfirmCycleBulkSheet
            open={bulkOpen}
            onClose={() => setBulkOpen(false)}
            cycleId={id}
            cycleDisplay={cycle.data?.period_display ?? ""}
          />
        </>
      )}
    </div>
  );
}