"use client";

/**
 * MarkSettledDialog — mark an approved exit request as settled.
 *
 * Records the payment reference for settlement.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmField,
  NmInput,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { markExitSettled } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  payment_reference: z.string().min(1, "Enter payment reference"),
});
type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  requestId: string | null;
}

export function MarkSettledDialog({ open, onClose, requestId }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { payment_reference: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      markExitSettled(requestId!, {
        payment_reference: values.payment_reference,
      }),
    onSuccess: () => {
      toast.success("Exit request marked as settled.");
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not mark as settled. Please try again."
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
      title="Mark as Settled"
      description="Record the payment reference for this exit settlement."
      hideFooter
    >
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        <NmField
          label="Payment Reference"
          error={errors.payment_reference?.message}
          hint="Bank transfer reference, cheque number, or payment confirmation"
          required
        >
          <NmInput
            placeholder="e.g. TRF-2026-SETTLE-001"
            {...register("payment_reference")}
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
            disabled={isPending || !requestId}
            className="nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Marking…
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Mark settled
              </>
            )}
          </button>
        </div>
      </form>
    </NmDialog>
  );
}
