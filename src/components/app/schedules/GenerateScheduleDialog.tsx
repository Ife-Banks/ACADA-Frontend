"use client";

/**
 * Screen 31 — Generate Deduction Schedule Dialog
 *
 * Triggered from the Schedules page. Lets the treasurer pick a
 * closed/processing cycle and a batch type, then calls
 * POST /schedules/generate/
 *
 * On success it offers immediate CSV and Excel export buttons.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  FileText,
  Download,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmField,
  NmSelect,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { getCycles } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import {
  generateSchedule,
  exportScheduleCsv,
  exportScheduleExcel,
} from "@/lib/api/schedules";
import type { ScheduleBatchDetail, BatchType } from "@/lib/types";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  cycle_id: z.string().min(1, "Select a contribution cycle"),
  batch_type: z.enum(["deduction", "repayment", "combined"] as const, {
    error: "Select a batch type",
  }),
});
type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GenerateScheduleDialog({ open, onClose }: Props) {
  const [generated, setGenerated] = useState<ScheduleBatchDetail | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);
  const queryClient = useQueryClient();

  /* Cycle list — only closed/processing cycles make sense */
  const { data: cyclesData, isLoading: cyclesLoading } = useQuery({
    queryKey: qk.contributions.cycles(1, 100),
    queryFn: () => getCycles({ page_size: 100 }),
    enabled: open,
  });
  const cycles = (cyclesData?.results ?? []).filter(
    (c) => c.status === "closed" || c.status === "processing"
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { cycle_id: "", batch_type: "combined" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      generateSchedule({
        cycle_id: values.cycle_id,
        batch_type: values.batch_type as BatchType,
      }),
    onSuccess: (data) => {
      setGenerated(data);
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: qk.schedules.root });
      toast.success("Schedule generated successfully.");
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Schedule generation failed. Please try again."
      );
    },
  });

  async function handleExport(format: "csv" | "excel") {
    if (!generated) return;
    setExporting(format);
    try {
      if (format === "csv") await exportScheduleCsv(generated.id);
      else await exportScheduleExcel(generated.id);
    } catch {
      toast.error(`${format.toUpperCase()} export failed.`);
    } finally {
      setExporting(null);
    }
  }

  function handleClose() {
    setGenerated(null);
    setServerError(null);
    reset();
    onClose();
  }

  return (
    <NmDialog
      open={open}
      onClose={handleClose}
      title="Generate Deduction Schedule"
      description="Create a bursary-ready deduction schedule for a contribution cycle."
      hideFooter
    >
      <div className="flex flex-col gap-4">
        {/* ── Success state ── */}
        {generated ? (
          <div
            className="flex flex-col gap-4"
            style={{ animation: "var(--animate-fade-up)" }}
          >
            {/* Success banner */}
            <div
              className="nm-raised rounded-2xl p-5 flex flex-col gap-3"
              style={{ borderLeft: "4px solid var(--success)" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="font-bold text-foreground text-sm">
                  Schedule generated
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Cycle",       value: generated.cycle_display ?? "—" },
                  { label: "Type",        value: generated.batch_type },
                  { label: "Members",     value: String(generated.member_count) },
                  { label: "Total amount",value: `₦${Number(generated.total_amount).toLocaleString("en-NG")}` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      {label}
                    </p>
                    <p className="text-xs font-bold text-foreground capitalize">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Export buttons */}
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Export
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleExport("csv")}
                disabled={!!exporting}
                className="nm-raised flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-foreground hover:text-brand-primary transition-colors disabled:opacity-50"
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
                className="nm-raised flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-foreground hover:text-success transition-colors disabled:opacity-50"
              >
                {exporting === "excel" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Excel
              </button>
            </div>

            {/* Generate another */}
            <button
              type="button"
              onClick={() => { setGenerated(null); reset(); }}
              className="nm-btn-ghost w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-muted-foreground border border-border"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate another
            </button>
          </div>
        ) : (
          /* ── Generate form ── */
          <form
            onSubmit={handleSubmit((v) => mutate(v))}
            className="flex flex-col gap-4"
            noValidate
          >
            <NmField
              label="Contribution cycle"
              error={errors.cycle_id?.message}
              required
            >
              <NmSelect
                icon={RefreshCw}
                error={!!errors.cycle_id}
                {...register("cycle_id")}
              >
                <option value="">
                  {cyclesLoading ? "Loading cycles…" : cycles.length === 0 ? "No closed cycles found" : "Select a cycle"}
                </option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.period_display} — {c.status}
                  </option>
                ))}
              </NmSelect>
            </NmField>

            <NmField
              label="Batch type"
              error={errors.batch_type?.message}
              hint="Combined includes both contribution deductions and loan repayments."
              required
            >
              <NmSelect
                icon={Download}
                error={!!errors.batch_type}
                {...register("batch_type")}
              >
                <option value="combined">Combined (contributions + repayments)</option>
                <option value="deduction">Contributions only</option>
                <option value="repayment">Loan repayments only</option>
              </NmSelect>
            </NmField>

            {serverError && <NmErrorBanner message={serverError} />}

            {/* Footer buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="nm-btn-ghost flex-1 rounded-xl py-2.5 text-sm font-semibold text-foreground border border-border disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || cycles.length === 0}
                className="nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </NmDialog>
  );
}
