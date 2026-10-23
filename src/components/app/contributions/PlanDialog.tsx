"use client";

/**
 * PlanDialog — create or edit a contribution plan.
 *
 * POST /contributions/plans/  (new)
 * PATCH /contributions/plans/{id}/  (edit)
 *
 * Exactly one plan is kept as the default: when this plan is marked default,
 * any other defaults in the society are cleared first.
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarDays, Coins, PiggyBank } from "lucide-react";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmField,
  NmInput,
  NmTextarea,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import {
  createPlan,
  getAllPlans,
  updatePlan,
} from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import { localTodayIso } from "@/lib/utils";
import type { ContributionPlan } from "@/lib/types";

const schema = z
  .object({
    plan_name: z.string().trim().min(2, "Enter a plan name"),
    amount_fixed: z
      .string()
      .min(1, "Enter the monthly amount")
      .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
    effective_from: z.string().min(1, "Choose a start date"),
    effective_to: z.string().optional(),
    description: z.string().trim().optional(),
    allows_extra: z.boolean(),
    is_default: z.boolean(),
  })
  .refine(
    (v) => !v.effective_to || v.effective_to >= v.effective_from,
    {
      message: "End date cannot be before the start date",
      path: ["effective_to"],
    }
  )
  .refine((v) => !v.is_default || !v.effective_to, {
    message: "A default plan must have no end date",
    path: ["effective_to"],
  })
  .refine((v) => !v.is_default || v.effective_from <= localTodayIso(), {
    message: "A default plan must start today or earlier",
    path: ["effective_from"],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  plan?: ContributionPlan | null;
}

export function PlanDialog({ open, onClose, plan }: Props) {
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
      plan_name: "",
      amount_fixed: "",
      effective_from: localTodayIso(),
      effective_to: "",
      description: "",
      allows_extra: true,
      is_default: false,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      plan_name: plan?.plan_name ?? "",
      amount_fixed: plan?.amount_fixed ?? "",
      effective_from: plan?.effective_from ?? localTodayIso(),
      effective_to: plan?.effective_to ?? "",
      description: plan?.description ?? "",
      allows_extra: plan?.allows_extra ?? true,
      is_default: plan?.is_default ?? false,
    });
  }, [open, plan, reset]);

  // Closing clears the stale error so the next open starts clean.
  function handleClose() {
    setServerError(null);
    onClose();
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        plan_name: values.plan_name,
        amount_fixed: values.amount_fixed,
        effective_from: values.effective_from,
        effective_to: values.effective_to || null,
        description: values.description || "",
        allows_extra: values.allows_extra,
        is_default: values.is_default,
      };

      const saved = plan
        ? await updatePlan(plan.id, payload)
        : await createPlan(payload);

      // Enforce a single default plan for the society.
      if (payload.is_default) {
        const current = await getAllPlans();
        const otherDefaults = current.filter(
          (p) => p.id !== saved.id && p.is_default
        );
        await Promise.all(
          otherDefaults.map((p) => updatePlan(p.id, { is_default: false }))
        );
      }

      return saved;
    },
    onSuccess: (saved) => {
      toast.success(plan ? "Plan updated." : `${saved.plan_name} created.`);
      queryClient.invalidateQueries({ queryKey: qk.contributions.plans });
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      setServerError(null);
      onClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages.join(" ")
          : "Could not save the plan. Please try again."
      );
    },
  });

  return (
    <NmDialog
      className="plans-dialog"
      open={open}
      onClose={handleClose}
      title={plan ? "Edit contribution plan" : "New contribution plan"}
      description="Monthly cycles generate member entries from the active default plan."
      confirmLabel={isPending ? "Saving…" : plan ? "Save changes" : "Create plan"}
      onConfirm={handleSubmit((values) => mutate(values))}
      loading={isPending}
    >
      <form
        onSubmit={handleSubmit((values) => mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <NmField label="Plan name" error={errors.plan_name?.message} required>
          <NmInput
            icon={PiggyBank}
            placeholder="e.g. Standard Monthly"
            error={!!errors.plan_name}
            {...register("plan_name")}
          />
        </NmField>

        <NmField
          label="Fixed monthly amount (₦)"
          error={errors.amount_fixed?.message}
          required
        >
          <NmInput
            icon={Coins}
            type="number"
            min={0}
            placeholder="e.g. 25000"
            error={!!errors.amount_fixed}
            {...register("amount_fixed")}
          />
        </NmField>

        <div className="grid grid-cols-2 gap-3">
          <NmField
            label="Effective from"
            error={errors.effective_from?.message}
            required
          >
            <NmInput
              icon={CalendarDays}
              type="date"
              error={!!errors.effective_from}
              {...register("effective_from")}
            />
          </NmField>
          <NmField
            label="Effective to"
            error={errors.effective_to?.message}
            hint="Leave blank for no end date."
          >
            <NmInput
              icon={CalendarDays}
              type="date"
              error={!!errors.effective_to}
              {...register("effective_to")}
            />
          </NmField>
        </div>

        <NmField label="Description" error={errors.description?.message}>
          <NmTextarea
            rows={2}
            placeholder="What does this plan cover?"
            error={!!errors.description}
            {...register("description")}
          />
        </NmField>

        <div className="flex flex-col gap-2">
          <label className="flex items-start gap-3 rounded-xl nm-inset px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-brand-primary"
              {...register("allows_extra")}
            />
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Allow extra contributions
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Members may contribute more than the fixed monthly amount.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl nm-inset px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-brand-primary"
              {...register("is_default")}
            />
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Use as the default plan
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Required for monthly cycles to generate entries. Any previous
                default is cleared.
              </span>
            </span>
          </label>
        </div>

        {serverError && <NmErrorBanner message={serverError} />}
      </form>
    </NmDialog>
  );
}
