"use client";

/**
 * CyclesExplorer — the Contribution Cycles portal for EXECUTIVE+.
 *
 * Lists monthly contribution cycles (GET /contributions/cycles/) with
 * quick filters, a "New cycle" action (POST /contributions/cycles/),
 * and per-row bulk confirmation of member entries.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  Lock,
  Search,
  MoreHorizontal,
  ExternalLink,
  ClipboardCheck,
  CalendarDays,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import { useCycles, useAllPlans } from "@/hooks/useContributions";
import { useAuth } from "@/hooks/useAuth";
import type { ContributionCycle } from "@/lib/types";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  NmInput,
  NmSelect,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { CycleStatusBadge } from "./ContributionBadges";
import { ConfirmCycleBulkSheet } from "./ConfirmCycleBulkSheet";
import { CreateCycleDialog } from "./CreateCycleDialog";

const PAGE_SIZE = 25;
const MONTH_NAMES = new Intl.DateTimeFormat("en", { month: "long" });

/* ─── Helpers ───────────────────────────────────────────────────── */

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  onClick,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  hint?: string;
  onClick?: () => void;
  delay: number;
}) {
  const isClickable = !!onClick;
  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={onClick}
      className={cn(
        "nm-raised-lg rounded-3xl p-5 text-left w-full flex flex-col gap-3",
        isClickable &&
          "cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
      )}
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
    </button>
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
        Open a new monthly cycle to generate entries for every active member.
      </p>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */

export function CyclesExplorer() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [bulkCycle, setBulkCycle] = useState<ContributionCycle | null>(null);

  const list = useCycles(page, PAGE_SIZE);
  const plans = useAllPlans();
  const { isExecutiveOrAbove } = useAuth();

  /*
   * The cycle generator only reads a default plan that is still open-ended
   * (`effective_to IS NULL`). A plan with an end date is ignored even while
   * that date is in the future, so mirror that rule here.
   */
  const defaultPlan = (plans.data ?? []).find(
    (p) => p.is_default && p.is_active && !p.effective_to
  );
  const canCreateCycle = isExecutiveOrAbove && !!defaultPlan;

  const filtered = useMemo(() => {
    const rows = list.data?.results ?? [];
    const term = search.trim().toLowerCase();
    return rows.filter((c) => {
      const matchesStatus = status === "all" || c.status === status;
      if (!matchesStatus) return false;
      if (!term) return true;
      return c.period_display.toLowerCase().includes(term);
    });
  }, [list.data, search, status]);

  const openCount = (list.data?.results ?? []).filter((c) => c.status === "open").length;
  const processingCount = (list.data?.results ?? []).filter((c) => c.status === "processing").length;
  const closedCount = (list.data?.results ?? []).filter((c) => c.status === "closed").length;

  const total = list.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="executive-page executive-cycles-page flex flex-col gap-5">
      {/* ── Stat tiles ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={RefreshCw}
          label="All cycles"
          value={list.isLoading ? "…" : total}
          hint={`Showing ${from}–${to} of ${total}`}
          delay={0}
        />
        <Stat
          icon={CheckCircle2}
          label="Open cycles"
          value={list.isLoading ? "…" : openCount}
          hint="Accepting contributions"
          delay={75}
          onClick={() => {
            setStatus("open");
            setPage(1);
          }}
        />
        <Stat
          icon={Clock}
          label="Processing"
          value={list.isLoading ? "…" : processingCount}
          hint="Awaiting confirmation"
          delay={150}
          onClick={() => {
            setStatus("processing");
            setPage(1);
          }}
        />
        <Stat
          icon={Lock}
          label="Closed cycles"
          value={list.isLoading ? "…" : closedCount}
          hint="Locked for the period"
          delay={225}
          onClick={() => {
            setStatus("closed");
            setPage(1);
          }}
        />
      </div>

      {/* ── Default-plan guard ── */}
      {!plans.isLoading && !plans.isError && !defaultPlan && (
        <div
          className="nm-raised rounded-2xl p-4 flex items-start gap-3"
          style={{ borderLeft: "4px solid var(--warning)" }}
        >
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              No active default contribution plan
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              New cycles would generate zero entries because every member&apos;s
              amount comes from the default plan.
            </p>
            {isExecutiveOrAbove && (
              <Link
                href="/executive/plans"
                className="text-xs font-semibold text-brand-primary hover:underline mt-2 inline-block"
              >
                Set up a contribution plan
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Cycles table ── */}
      <div className="nm-raised-lg rounded-3xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3">
            <NmInput
              icon={Search}
              type="search"
              placeholder="Search by cycle period…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="py-2.5"
            />
            <NmSelect
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="py-2.5"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="processing">Processing</option>
              <option value="closed">Closed</option>
            </NmSelect>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={!canCreateCycle}
            title={
              !isExecutiveOrAbove
                ? "Committee members cannot open cycles"
                : !defaultPlan
                ? "Create and mark a default contribution plan first"
                : undefined
            }
            className="nm-btn-primary inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white font-semibold text-sm px-4 py-2.5 hover:bg-brand-primary-hover transition-colors duration-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <RefreshCw className="w-4 h-4" />
            New cycle
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {list.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load contribution cycles. Check your connection and try again." />
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
            <NoRows
              message={
                search || status !== "all"
                  ? "No cycles match your filters."
                  : "No contribution cycles yet."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[24%]">Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
                  <TableHead className="text-right">Confirmed</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="group">
                    <TableCell>
                      <Link
                        href={`/executive/cycles/${c.id}`}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <div className="w-9 h-9 rounded-xl nm-chip flex flex-col items-center justify-center shrink-0">
                          <span className="text-[8px] uppercase tracking-wide text-muted-foreground font-bold leading-none">
                            {MONTH_NAMES.format(
                              new Date(2000, c.cycle_month - 1, 1)
                            ).slice(0, 3)}
                          </span>
                          <span className="text-xs font-extrabold text-foreground leading-tight">
                            {c.cycle_year}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {c.period_display}
                          </p>
                          {c.notes && (
                            <p className="text-xs text-muted-foreground truncate">
                              {c.notes}
                            </p>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <CycleStatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {c.entry_count}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      {c.confirmed_count}
                      {c.entry_count > 0 && (
                        <span className="text-xs text-muted-foreground font-normal ml-1">
                          / {c.entry_count}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(c.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl nm-chip transition-colors hover:text-foreground"
                          aria-label={`Actions for ${c.period_display}`}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`/executive/cycles/${c.id}`} />}>
                            <ExternalLink className="size-4" />
                            View cycle
                          </DropdownMenuItem>
                          {isExecutiveOrAbove && (
                            <>
                              <DropdownMenuItem
                                disabled={c.confirmed_count === c.entry_count}
                                onClick={() => setBulkCycle(c)}
                              >
                                <ClipboardCheck className="size-4" />
                                Confirm entries
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            render={<Link href={`/executive/cycles/${c.id}`} />}
                          >
                            <CalendarDays className="size-4" />
                            View penalties
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Action surfaces ── */}
      {isExecutiveOrAbove && (
        <>
          <CreateCycleDialog open={createOpen} onClose={() => setCreateOpen(false)} />
          <ConfirmCycleBulkSheet
            open={!!bulkCycle}
            onClose={() => setBulkCycle(null)}
            cycleId={bulkCycle?.id ?? ""}
            cycleDisplay={bulkCycle?.period_display ?? ""}
          />
        </>
      )}
    </div>
  );
}
