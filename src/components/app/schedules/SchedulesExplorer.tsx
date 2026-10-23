"use client";

/**
 * SchedulesExplorer — executive bursary deduction schedules: generate,
 * inspect line items, and export as CSV / Excel.
 */

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NmSelect } from "@/components/app/shared/NmField";
import { useSchedules } from "@/hooks/useSchedules";
import { GenerateScheduleDialog } from "./GenerateScheduleDialog";
import { BatchStatusBadge, BatchTypeBadge } from "./ScheduleBadges";
import { getSchedule, exportScheduleCsv, exportScheduleExcel } from "@/lib/api/schedules";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { BatchType, ScheduleBatch, ScheduleLine } from "@/lib/types";
import { cn } from "@/lib/utils";

const money = (v: string) => `₦${Number(v).toLocaleString("en-NG")}`;

type StatusFilter = "all" | "draft" | "finalized" | "exported";

/* ─── Stat tile ─────────────────────────────────────────────────── */

function StatTile({
  label,
  value,
  inactive,
  onClick,
  index,
}: {
  label: string;
  value: string;
  inactive?: boolean;
  onClick?: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className={cn(
        "nm-raised bg-surface rounded-3xl p-5 text-left flex flex-col gap-1.5 transition-all duration-200",
        onClick && "hover:-translate-y-0.5 hover:shadow-lg",
        inactive && "opacity-50"
      )}
      style={{ animation: `var(--animate-fade-up) ${150 + index * 60}ms both` }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xl font-bold text-foreground leading-tight">{value}</span>
    </button>
  );
}

/* ─── Line amount cell ──────────────────────────────────────────── */

function moneyOrDash(v: string) {
  return Number(v) > 0 ? money(v) : <span className="text-muted-foreground">—</span>;
}

/* ─── Schedule line ─────────────────────────────────────────────── */

function LineDetail({ detail }: { detail: { lines: ScheduleLine[] } }) {
  return (
    <div
      className="nm-inset rounded-2xl p-4 overflow-x-auto"
      style={{ animation: "var(--animate-fade-up)" }}
    >
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="text-left border-b border-border/60">
            {["Member", "Employee no.", "Payroll no.", "Contribution", "Repayment", "Penalty", "Total"].map((h) => (
              <th
                key={h}
                className="pb-2 pr-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {detail.lines.map((l) => (
            <tr key={l.id}>
              <td className="py-2.5 pr-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-brand-primary">
                    {l.member_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate">
                    {l.member_name}
                  </span>
                </div>
              </td>
              <td className="py-2.5 pr-3 text-xs text-foreground whitespace-nowrap">
                {l.employee_no || "—"}
              </td>
              <td className="py-2.5 pr-3 text-xs text-foreground whitespace-nowrap">
                {l.payroll_no || "—"}
              </td>
              <td className="py-2.5 pr-3 text-xs text-foreground tabular-nums">
                {moneyOrDash(l.contribution_amount)}
              </td>
              <td className="py-2.5 pr-3 text-xs text-foreground tabular-nums">
                {moneyOrDash(l.repayment_amount)}
              </td>
              <td className="py-2.5 pr-3 text-xs text-destructive tabular-nums">
                {moneyOrDash(l.penalty_amount)}
              </td>
              <td className="py-2.5 pr-1 text-xs font-bold text-foreground tabular-nums whitespace-nowrap">
                {money(l.total_amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Batch row ─────────────────────────────────────────────────── */

function BatchRow({ batch }: { batch: ScheduleBatch }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);

  /* Lazy detail fetch — only loads when the row is expanded. */
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: qk.schedules.detail(batch.id),
    queryFn: () => getSchedule(batch.id),
    enabled: open,
    staleTime: 30_000,
  });

  async function handleExport(format: "csv" | "excel") {
    setExporting(format);
    try {
      if (format === "csv") await exportScheduleCsv(batch.id);
      else await exportScheduleExcel(batch.id);
    } catch {
      toast.error(
        format === "csv"
          ? "CSV export failed. Please try again."
          : "Excel export failed. Please try again."
      );
    } finally {
      setExporting(null);
    }
  }

  return (
    <>
      <tr className="hover:bg-muted/40 transition-colors duration-150">
        <td className="py-3.5 pr-4">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 text-left"
          >
            {open ? (
              <ChevronDown className="w-4 h-4 text-brand-primary shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-brand-primary shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {batch.cycle_display ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {batch.generated_by_name ?? "System"} ·{" "}
                {new Date(batch.created_at).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </button>
        </td>
        <td className="py-3.5 pr-4">
          <BatchTypeBadge type={batch.batch_type} />
        </td>
        <td className="py-3.5 pr-4">
          <BatchStatusBadge status={batch.status} />
        </td>
        <td className="py-3.5 pr-4 text-sm text-foreground whitespace-nowrap">
          {batch.member_count}
        </td>
        <td className="py-3.5 pr-4 text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
          {money(batch.total_amount)}
        </td>
        <td className="py-3.5 pr-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title="Export CSV"
              onClick={() => handleExport("csv")}
              disabled={!!exporting}
              className="w-8 h-8 rounded-lg nm-raised flex items-center justify-center text-muted-foreground hover:text-brand-primary transition-colors disabled:opacity-40"
            >
              {exporting === "csv" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              title="Export Excel"
              onClick={() => handleExport("excel")}
              disabled={!!exporting}
              className="w-8 h-8 rounded-lg nm-raised flex items-center justify-center text-muted-foreground hover:text-success transition-colors disabled:opacity-40"
            >
              {exporting === "excel" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
            </button>
            <Link
              href={`/executive/schedules/${batch.id}`}
              className="text-xs font-semibold text-brand-primary hover:underline whitespace-nowrap px-1.5"
            >
              View
            </Link>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="pb-4 pr-4">
            <div className="flex flex-col gap-3">
              {detailLoading ? (
                <Skeleton className="h-40 w-full rounded-2xl" />
              ) : detail ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {detail.lines.length} line items
                      {detail.notes && (
                        <span className="text-muted-foreground/80">· {detail.notes}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      Batch total: {money(detail.total_amount)}
                    </span>
                  </div>
                  <LineDetail detail={detail} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Could not load this schedule.
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── Explorer ──────────────────────────────────────────────────── */

export function SchedulesExplorer() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<"" | BatchType>("");
  const [generateOpen, setGenerateOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useSchedules();

  const batches = data?.results ?? [];

  const filtered = batches.filter((b) => {
    const matchesStatus =
      statusFilter === "all" ||
      b.status === statusFilter ||
      (statusFilter === "exported" &&
        (b.status === "exported" || b.status === "submitted"));
    const matchesType = !typeFilter || b.batch_type === typeFilter;
    return matchesStatus && matchesType;
  });

  const stats = batches.reduce(
    (acc, b) => {
      acc.totalAmount += Number(b.total_amount);
      acc.members += b.member_count;
      if (b.status === "draft") acc.draft += 1;
      if (b.status === "finalized") acc.finalized += 1;
      return acc;
    },
    { totalAmount: 0, members: 0, draft: 0, finalized: 0 }
  );

  const readyExport = batches.filter(
    (b) => b.status === "finalized" || b.status === "exported" || b.status === "submitted"
  ).length;

  return (
    <div className="executive-page executive-schedules-page flex flex-col gap-5">
      {/* Header */}
      <header className="executive-page-heading">
        <div>
          <p className="executive-page-eyebrow">Payroll</p>
          <h1>Deduction schedules</h1>
          <p>
            Generate, view, and export bursary deduction schedules.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGenerateOpen(true)}
          className="nm-btn-primary flex items-center gap-2 rounded-xl bg-brand-primary text-white text-sm font-semibold px-4 py-2.5 hover:bg-brand-primary-hover transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Generate schedule
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Batches"
          value={String(batches.length)}
          index={0}
          onClick={() => setStatusFilter("all")}
          inactive={statusFilter !== "all"}
        />
        <StatTile
          label="Total deducted"
          value={money(String(stats.totalAmount))}
          index={1}
        />
        <StatTile
          label="Members covered"
          value={String(stats.members)}
          index={2}
        />
        <StatTile
          label="Ready to export"
          value={String(readyExport)}
          index={3}
          onClick={() => setStatusFilter("exported")}
          inactive={statusFilter !== "exported"}
        />
      </div>

      {/* List */}
      <div className="nm-raised-lg bg-surface rounded-3xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-1 nm-inset rounded-xl p-1">
            {([
              { value: "all", label: "All" },
              { value: "draft", label: "Draft" },
              { value: "finalized", label: "Finalized" },
              { value: "exported", label: "Exported" },
            ] as { value: StatusFilter; label: string }[]).map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200",
                  statusFilter === f.value
                    ? "bg-brand-primary text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <NmSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "" | BatchType)}
            className="w-[190px]"
          >
            <option value="">All types</option>
            <option value="combined">Combined</option>
            <option value="deduction">Contributions</option>
            <option value="repayment">Repayments</option>
          </NmSelect>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {batches.length} batches
          </span>
        </div>

        {isError ? (
          <div className="text-center py-14 flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm">
              {error instanceof ApiError
                ? error.messages[0]
                : "Could not load deduction schedules."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm font-semibold text-brand-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 flex flex-col items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              {batches.length === 0
                ? "No schedules yet. Generate one from a closed contribution cycle."
                : "No schedules match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="text-left border-b border-border/60">
                  {["Cycle", "Type", "Status", "Members", "Total", ""].map((h) => (
                    <th
                      key={h}
                      className="pb-2.5 pr-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((b) => (
                  <BatchRow key={b.id} batch={b} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isLoading && (
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mt-3">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Syncing…
          </p>
        )}
      </div>

      <GenerateScheduleDialog open={generateOpen} onClose={() => setGenerateOpen(false)} />
    </div>
  );
}
