"use client";

/**
 * RecordSharePaymentDialog — record a share payment.
 *
 * Allows executives to record payments against share subscriptions.
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
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { recordSharePayment } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount"),
  reference: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  holdingId: string | null;
}

export function RecordSharePaymentDialog({ open, onClose, holdingId }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "", reference: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      recordSharePayment(holdingId!, {
        amount: values.amount,
        reference: values.reference || undefined,
      }),
    onSuccess: () => {
      toast.success("Payment recorded.");
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not record payment. Please try again."
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
      title="Record Share Payment"
      description="Record a payment against this share subscription."
      hideFooter
    >
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        <NmField label="Amount" error={errors.amount?.message} required>
          <NmInput
            icon={DollarSign}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("amount")}
          />
        </NmField>

        <NmField
          label="Reference"
          error={errors.reference?.message}
          hint="Optional — bank transfer reference, receipt number, etc."
        >
          <NmInput
            placeholder="e.g. TRF-2026-001"
            {...register("reference")}
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
            disabled={isPending || !holdingId}
            className="nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Recording…
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Record payment
              </>
            )}
          </button>
        </div>
      </form>
    </NmDialog>
  );
}
