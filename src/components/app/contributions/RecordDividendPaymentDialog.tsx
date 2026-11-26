"use client";

/**
 * RecordDividendPaymentDialog — record dividend payment status.
 *
 * Allows executives to mark dividend entitlements as paid, withheld, or reinvested.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmField,
  NmInput,
  NmSelect,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { recordDividendPayment } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  status: z.enum(["paid", "withheld", "reinvested"]),
  payment_reference: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  entitlementId: string | null;
}

export function RecordDividendPaymentDialog({ open, onClose, entitlementId }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "paid", payment_reference: "" },
  });

  const selectedStatus = watch("status");

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      recordDividendPayment(entitlementId!, {
        status: values.status,
        payment_reference: values.payment_reference || undefined,
      }),
    onSuccess: () => {
      toast.success("Payment status updated.");
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not update status. Please try again."
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
      title="Record Dividend Payment"
      description="Update the payment status for this entitlement."
      hideFooter
    >
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        <NmField label="Status" error={errors.status?.message} required>
          <NmSelect {...register("status")} className="py-2.5">
            <option value="paid">Paid</option>
            <option value="withheld">Withheld</option>
            <option value="reinvested">Reinvested</option>
          </NmSelect>
        </NmField>

        {selectedStatus === "paid" && (
          <NmField
            label="Payment Reference"
            error={errors.payment_reference?.message}
            hint="Optional — bank transfer reference or receipt number"
          >
            <NmInput
              icon={DollarSign}
              placeholder="e.g. TRF-2026-001"
              {...register("payment_reference")}
            />
          </NmField>
        )}

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
            disabled={isPending || !entitlementId}
            className="nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Update status
              </>
            )}
          </button>
        </div>
      </form>
    </NmDialog>
  );
}
