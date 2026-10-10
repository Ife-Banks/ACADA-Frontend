"use client";

/**
 * CreateCycleDialog — opens a new monthly contribution cycle.
 *
 * Calls POST /contributions/cycles/ (cycle_month, cycle_year, notes).
 * The backend generates entries for every active member.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmField,
  NmInput,
  NmSelect,
  NmTextarea,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { createCycle } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  cycle_month: z.string().regex(/^(1[0-2]|[1-9])$/, "Select a valid month"),
  cycle_year: z
    .string()
    .regex(/^\d{4}$/, "Enter a valid year")
    .refine((v) => {
      const y = parseInt(v, 10);
      return y >= currentYear - 1 && y <= currentYear + 1;
    }, "Year is out of range"),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const currentYear = new Date().getFullYear();

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateCycleDialog({ open, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cycle_month: String(new Date().getMonth() + 1),
      cycle_year: String(currentYear),
      notes: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      createCycle({
        cycle_month: parseInt(values.cycle_month, 10),
        cycle_year: parseInt(values.cycle_year, 10),
        notes: values.notes || undefined,
      }),
    onSuccess: (cycle) => {
      toast.success(`${cycle.period_display} cycle opened.`);
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not create the cycle. Please try again."
      );
    },
  });

  function handleClose() {
    setServerError(null);
    reset();
    onClose();
  }

  return (
    <NmDialog
      open={open}
      onClose={handleClose}
      title="Open contribution cycle"
      description="Creates a monthly cycle and generates an entry for every active member."
      hideFooter
    >
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="grid grid-cols-2 gap-4">
          <NmField label="Month" error={errors.cycle_month?.message} required>
            <NmSelect {...register("cycle_month")} className="py-2.5">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString("en", { month: "long" })}
                </option>
              ))}
            </NmSelect>
          </NmField>

          <NmField label="Year" error={errors.cycle_year?.message} required>
            <NmInput
              icon={CalendarDays}
              type="number"
              min={currentYear - 1}
              max={currentYear + 1}
              {...register("cycle_year")}
            />
          </NmField>
        </div>

        <NmField
          label="Notes"
          error={errors.notes?.message}
          hint="Optional — e.g. 'August 2026 — salary month'."
        >
          <NmTextarea
            rows={3}
            placeholder="Optional note for this cycle."
            {...register("notes")}
          />
        </NmField>

        {serverError && <NmErrorBanner message={serverError} />}

        {/* Footer */}
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
            disabled={isPending}
            className="nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Opening…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Open cycle
              </>
            )}
          </button>
        </div>
      </form>
    </NmDialog>
  );
}