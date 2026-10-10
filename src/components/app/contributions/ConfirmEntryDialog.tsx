"use client";

/**
 * Screen 30 — Confirm Single Entry Dialog
 *
 * Inline confirm for a single contribution entry row on the cycle
 * detail page. Lets the treasurer enter the exact amount received
 * and an optional source reference (e.g. payroll batch number).
 *
 * Calls POST /contributions/entries/{id}/confirm/
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Hash } from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import { NmField, NmInput, NmErrorBanner } from "@/components/app/shared/NmField";
import { confirmEntry } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import type { ContributionEntry } from "@/lib/types";
import { ApiError } from "@/lib/api/client";
import { useState } from "react";

const schema = z.object({
  amount_received: z
    .string()
    .min(1, "Enter the amount received")
    .refine((v) => parseFloat(v) >= 0, "Amount cannot be negative"),
  source_reference: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  entry: ContributionEntry | null;
  cycleId: string;
}

export function ConfirmEntryDialog({ open, onClose, entry, cycleId }: Props) {
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
      amount_received: entry?.amount_due ?? "",
      source_reference: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      confirmEntry(entry!.id, {
        amount_received: values.amount_received,
        source_reference: values.source_reference || undefined,
      }),
    onSuccess: () => {
      toast.success(`Entry confirmed for ${entry?.member_name}.`);
      queryClient.invalidateQueries({ queryKey: qk.contributions.cycle(cycleId) });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError ? err.messages[0] : "Confirmation failed."
      );
    },
  });

  function handleClose() {
    reset();
    setServerError(null);
    onClose();
  }

  if (!entry) return null;

  const amountDue = parseFloat(entry.amount_due);

  return (
    <NmDialog
      open={open}
      onClose={handleClose}
      title="Confirm Entry"
      description={`Confirm the contribution received from ${entry.member_name}.`}
      hideFooter
    >
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Member summary tile */}
        <div className="nm-inset rounded-xl px-4 py-3 grid grid-cols-2 gap-2">
          {[
            { label: "Member",     value: entry.member_name },
            { label: "Payroll no", value: entry.member_payroll_no },
            { label: "Amount due", value: `₦${amountDue.toLocaleString("en-NG")}` },
            { label: "Status",     value: entry.status },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                {label}
              </p>
              <p className="text-xs font-bold text-foreground capitalize">{value}</p>
            </div>
          ))}
        </div>

        <NmField
          label="Amount received (₦)"
          error={errors.amount_received?.message}
          hint={`Due: ₦${amountDue.toLocaleString("en-NG")}`}
          required
        >
          <NmInput
            icon={DollarSign}
            type="number"
            min={0}
            step="0.01"
            placeholder={entry.amount_due}
            error={!!errors.amount_received}
            {...register("amount_received")}
          />
        </NmField>

        <NmField
          label="Source reference"
          error={errors.source_reference?.message}
          hint="Optional — e.g. payroll batch number."
        >
          <NmInput
            icon={Hash}
            type="text"
            placeholder="e.g. PAYROLL-2026-08"
            {...register("source_reference")}
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
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-2a8 8 0 01-8-8z" />
                </svg>
                Confirming…
              </span>
            ) : (
              "Confirm entry"
            )}
          </button>
        </div>
      </form>
    </NmDialog>
  );
}
