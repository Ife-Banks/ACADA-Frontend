"use client";

/**
 * CreateAgreementDialog — create a member contribution agreement.
 *
 * Allows society admins to set custom contribution amounts for specific members.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmField,
  NmInput,
  NmSelect,
  NmTextarea,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { createContributionAgreement } from "@/lib/api/contributions";
import { useAllPlans } from "@/hooks/useContributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  member_profile: z.string().min(1, "Select a member"),
  plan: z.string().min(1, "Select a plan"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount"),
  effective_from: z.string().min(1, "Select start date"),
  effective_to: z.string().optional(),
  reason: z.string().min(10, "Please provide a reason (min 10 characters)"),
});
type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateAgreementDialog({ open, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const plans = useAllPlans();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      member_profile: "",
      plan: "",
      amount: "",
      effective_from: "",
      effective_to: "",
      reason: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      createContributionAgreement({
        member_profile: values.member_profile,
        plan: values.plan,
        amount: values.amount,
        effective_from: values.effective_from,
        effective_to: values.effective_to || undefined,
        reason: values.reason,
      }),
    onSuccess: () => {
      toast.success("Agreement created.");
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not create agreement. Please try again."
      );
    },
  });

  function handleClose() {
    setServerError(null);
    reset();
    onClose();
  }

  const activePlans = (plans.data ?? []).filter((p) => p.is_active);

  return (
    <NmDialog
      open={open}
      onClose={handleClose}
      title="New Contribution Agreement"
      description="Set a custom contribution amount for a specific member."
      hideFooter
    >
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        <NmField label="Member" error={errors.member_profile?.message} required>
          <NmInput
            placeholder="Member profile ID"
            {...register("member_profile")}
          />
        </NmField>

        <NmField label="Contribution plan" error={errors.plan?.message} required>
          <NmSelect {...register("plan")} className="py-2.5">
            <option value="">Select a plan</option>
            {activePlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.plan_name} — ₦{parseFloat(p.amount_fixed).toLocaleString("en-NG")}
              </option>
            ))}
          </NmSelect>
        </NmField>

        <NmField
          label="Custom amount"
          error={errors.amount?.message}
          hint="Amount to be deducted each cycle (overrides plan default)"
          required
        >
          <NmInput
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("amount")}
          />
        </NmField>

        <div className="grid grid-cols-2 gap-4">
          <NmField label="Effective from" error={errors.effective_from?.message} required>
            <NmInput type="date" {...register("effective_from")} />
          </NmField>
          <NmField label="Effective to" error={errors.effective_to?.message}>
            <NmInput type="date" {...register("effective_to")} />
          </NmField>
        </div>

        <NmField
          label="Reason"
          error={errors.reason?.message}
          hint="Why is this member getting a custom amount?"
          required
        >
          <NmTextarea
            rows={3}
            placeholder="e.g. Part-time staff, special arrangement..."
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
            disabled={isPending}
            className="nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Create agreement
              </>
            )}
          </button>
        </div>
      </form>
    </NmDialog>
  );
}
