"use client";

/**
 * ReviewExitRequestDialog — review and approve/reject exit request.
 *
 * Allows executives to approve or reject exit requests with settlement details.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmField,
  NmInput,
  NmTextarea,
  NmSelect,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { reviewExitRequest } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  decision: z.enum(["approve", "reject"]),
  gross_contribution_balance: z.string().optional(),
  deductions: z.string().optional(), // JSON string
  proposed_payable: z.string().optional(),
  reason: z.string().min(10, "Please provide a reason (min 10 characters)"),
});
type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  requestId: string | null;
}

export function ReviewExitRequestDialog({ open, onClose, requestId }: Props) {
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
    defaultValues: {
      decision: "approve",
      gross_contribution_balance: "",
      deductions: "",
      proposed_payable: "",
      reason: "",
    },
  });

  const decision = watch("decision");

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      reviewExitRequest(requestId!, {
        decision: values.decision,
        gross_contribution_balance: values.gross_contribution_balance || undefined,
        deductions: values.deductions ? JSON.parse(values.deductions) : undefined,
        proposed_payable: values.proposed_payable || undefined,
        reason: values.reason,
      }),
    onSuccess: () => {
      toast.success(
        decision === "approve" ? "Exit request approved." : "Exit request rejected."
      );
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not process request. Please try again."
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
      title="Review Exit Request"
      description="Approve or reject this exit request."
      hideFooter
    >
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        <NmField label="Decision" error={errors.decision?.message} required>
          <NmSelect {...register("decision")} className="py-2.5">
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
          </NmSelect>
        </NmField>

        {decision === "approve" && (
          <>
            <NmField
              label="Gross Contribution Balance"
              error={errors.gross_contribution_balance?.message}
              hint="Total contributions before deductions"
            >
              <NmInput
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("gross_contribution_balance")}
              />
            </NmField>

            <NmField
              label="Deductions (JSON)"
              error={errors.deductions?.message}
              hint='Array format: [{"label":"Loan balance","amount":"5000.00"}]'
            >
              <NmTextarea
                rows={3}
                placeholder='[{"label":"Outstanding loan","amount":"5000.00"}]'
                {...register("deductions")}
              />
            </NmField>

            <NmField
              label="Proposed Payable"
              error={errors.proposed_payable?.message}
              hint="Amount to be paid to the member"
            >
              <NmInput
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("proposed_payable")}
              />
            </NmField>
          </>
        )}

        <NmField
          label="Reason"
          error={errors.reason?.message}
          hint={
            decision === "approve"
              ? "Explain the approval decision"
              : "Explain why the request is being rejected"
          }
          required
        >
          <NmTextarea
            rows={3}
            placeholder="Provide your reasoning..."
            {...register("reason")}
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
            className={
              decision === "approve"
                ? "nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                : "nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            }
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : decision === "approve" ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Approve
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Reject
              </>
            )}
          </button>
        </div>
      </form>
    </NmDialog>
  );
}
