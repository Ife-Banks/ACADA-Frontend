"use client";

/**
 * ScheduleDetailView — full view of a single deduction schedule batch:
 * header summary, meta tiles, batch notes and the complete line-item table.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchedule } from "@/hooks/useSchedules";
import { BatchStatusBadge, BatchTypeBadge } from "./ScheduleBadges";
import { exportScheduleCsv, exportScheduleExcel } from "@/lib/api/schedules";
import { ApiError } from "@/lib/api/client";
import type { ScheduleLine } from "@/lib/types";

const money = (v: string) => `₦${Number(v).toLocaleString("en-NG")}`;

/* ─── Stat tile ─────────────────────────────────────────────────── */

function StatTile({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}) {
  return (
    <div
      className="nm-raised bg-surface rounded-3xl p-4 flex flex-col gap-1"
      style={{ animation: `var(--animate-fade-up) ${150 + index * 60}ms both` }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-lg font-bold text-foreground leading-tight">{value}</span>
    </div>
  );
}

/* ─── Line table ────────────────────────────────────────────────── */

function LineTable({ lines }: { lines: ScheduleLine[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="text-left border-b border-border/60">
            {["Member", "Employee no.", "Payroll no.", "Contribution", "Repayment", "Penalty", "Total"].map((h) => (
              <th
                key={h}
                className="pb-2.5 pr-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {lines.map((l) => (
            <tr key={l.id}>
              <td className="py-3 pr-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-[11px] font-bold text-brand-primary">
                    {l.member_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {l.member_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {(l.employee_no || l.payroll_no || "No payroll ref").toUpperCase()}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-3 text-xs text-foreground whitespace-nowrap">
                {l.employee_no || "—"}
              </td>
              <td className="py-3 pr-3 text-xs text-foreground whitespace-nowrap">
                {l.payroll_no || "—"}
              </td>
              <td className="py-3 pr-3 text-xs text-foreground tabular-nums">
                {Number(l.contribution_amount) > 0 ? money(l.contribution_amount) : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="py-3 pr-3 text-xs text-foreground tabular-nums">
                {Number(l.repayment_amount) > 0 ? money(l.repayment_amount) : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="py-3 pr-3 text-xs text-destructive tabular-nums">
                {Number(l.penalty_amount) > 0 ? money(l.penalty_amount) : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="py-3 pr-1 text-xs font-bold text-foreground tabular-nums whitespace-nowrap">
                {money(l.total_amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Explorer ──────────────────────────────────────────────────── */

export function ScheduleDetailView({ scheduleId }: { scheduleId: string }) {
  const { data: batch, isLoading, isError, error, refetch } = useSchedule(scheduleId);
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);

  async function handleExport(format: "csv" | "excel") {
    if (!batch) return;
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

  if (isError) {
    return (
      <div className="nm-raised-lg bg-surface rounded-3xl p-5 text-center py-14 flex flex-col items-center gap-3">
        <p className="text-muted-foreground text-sm">
          {error instanceof ApiError
            ? error.messages[0]
            : "Could not load this schedule."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm font-semibold text-brand-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading || !batch) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    );
  }

  const meta = [
    { label: "Members", value: String(batch.member_count) },
    { label: "Batch total", value: money(batch.total_amount) },
    { label: "Generated by", value: batch.generated_by_name ?? "System" },
    {
      label: "Created",
      value: new Date(batch.created_at).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/executive/schedules"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Deduction schedules
      </Link>

      {/* Header card */}
      <div className="nm-raised-lg bg-surface rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-bold text-foreground">
                  {batch.cycle_display ?? "Unassigned cycle"}
                </p>
                <BatchTypeBadge type={batch.batch_type} />
                <BatchStatusBadge status={batch.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {batch.lines.length} line items · {
                  new Date(batch.created_at).toLocaleString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport("csv")}
              disabled={!!exporting}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold nm-raised disabled:opacity-50"
            >
              {exporting === "csv" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport("excel")}
              disabled={!!exporting}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold nm-raised disabled:opacity-50"
            >
              {exporting === "excel" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              Excel
            </button>
          </div>
        </div>

        {batch.notes && (
          <div className="mt-4 nm-inset rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
              Notes
            </p>
            <p className="text-sm text-foreground leading-relaxed">{batch.notes}</p>
          </div>
        )}
      </div>

      {/* Meta tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {meta.map((m, i) => (
          <StatTile key={m.label} label={m.label} value={m.value} index={i} />
        ))}
      </div>

      {/* Lines */}
      <div className="nm-raised-lg bg-surface rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-sm font-semibold text-foreground">
            Batch lines
          </p>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {batch.lines.length} members
          </p>
        </div>
        {batch.lines.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            This schedule has no line items.
          </p>
        ) : (
          <LineTable lines={batch.lines} />
        )}
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Syncing…
        </p>
      )}
    </div>
  );
}