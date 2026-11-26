"use client";

/**
 * ExitRequestSheet — member submits an exit request.
 *
 * Allows members to request exit from the cooperative with settlement estimate.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { NmSheet } from "@/components/app/shared/NmSheet";
import {
  NmField,
  NmInput,
  NmTextarea,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { createExitRequest, getExitEstimate } from "@/lib/api/contributions";
import { useExitEstimate } from "@/hooks/useContributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  requested_exit_date: z.string().min(1, "Select an exit date"),
  reason: z.string().min(10, "Please provide a reason (min 10 characters)"),
});
type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ExitRequestSheet({ open, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const estimate = useExitEstimate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      requested_exit_date: "",
      reason: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      createExitRequest({
        requested_exit_date: values.requested_exit_date,
        reason: values.reason,
      }),
    onSuccess: () => {
      toast.success("Exit request submitted.");
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not submit request. Please try again."
      );
    },
  });

  function handleClose() {
    setServerError(null);
    reset();
    onClose();
  }

  return (
    <NmSheet
      open={open}
      onClose={handleClose}
      title="Request Exit"
      description="Submit a request to exit the cooperative."
      footer={
        <div className="flex gap-3">
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
            form="exit-request-form"
            disabled={isPending}
            className="nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Submit request
              </>
            )}
          </button>
        </div>
      }
    >
      <form
        id="exit-request-form"
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Warning */}
        <div className="nm-raised-lg rounded-2xl p-4 border border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Important</p>
              <p className="text-xs text-muted-foreground mt-1">
                Exiting the cooperative is a significant decision. Please review the settlement
                estimate below before submitting.
              </p>
            </div>
          </div>
        </div>

        {/* Settlement estimate */}
        {estimate.data && (
          <div className="nm-raised-lg rounded-2xl p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Settlement estimate</p>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gross contributions</span>
                <span className="font-semibold text-foreground">
                  ₦{parseFloat(estimate.data.gross_compulsory_contributions || "0").toLocaleString("en-NG")}
                </span>
              </div>
              {estimate.data.proposed_deductions.map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-semibold text-red-600">
                    -₦{parseFloat(d.amount || "0").toLocaleString("en-NG")}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-foreground">Estimated payable</span>
                  <span className="font-bold text-green-600">
                    ₦{parseFloat(estimate.data.proposed_payable || "0").toLocaleString("en-NG")}
                  </span>
                </div>
              </div>
            </div>
            {estimate.data.note && (
              <p className="text-xs text-muted-foreground mt-3 italic">{estimate.data.note}</p>
            )}
          </div>
        )}

        <NmField label="Requested exit date" error={errors.requested_exit_date?.message} required>
          <NmInput type="date" {...register("requested_exit_date")} />
        </NmField>

        <NmField
          label="Reason for exit"
          error={errors.reason?.message}
          hint="Please explain why you're leaving the cooperative."
          required
        >
          <NmTextarea
            rows={4}
            placeholder="e.g. Relocating to another city, pursuing further education..."
            {...register("reason")}
          />
        </NmField>

        {serverError && <NmErrorBanner message={serverError} />}
      </form>
    </NmSheet>
  );
}
