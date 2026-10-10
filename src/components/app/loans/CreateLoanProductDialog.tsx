"use client";

/**
 * CreateLoanProductDialog — form for creating a new loan product
 * (rates, terms, guarantor requirements, auto-approval threshold).
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Landmark } from "lucide-react";
import { NmDialog } from "@/components/app/shared/NmDialog";
import { NmField, NmInput, NmTextarea, NmErrorBanner } from "@/components/app/shared/NmField";
import { createLoanProduct } from "@/lib/api/loans";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a product name"),
  description: z.string().trim().min(10, "Describe the product (at least 10 characters)"),
  max_amount: z
    .string()
    .min(1, "Enter the maximum amount")
    .refine((v) => Number(v) > 0, "Must be greater than 0"),
  interest_rate: z
    .string()
    .min(1, "Enter the interest rate")
    .refine((v) => Number(v) >= 0, "Rate cannot be negative"),
  min_term_months: z
    .string()
    .min(1, "Enter the minimum term")
    .refine((v) => Number(v) > 0, "Must be greater than 0"),
  max_term_months: z
    .string()
    .min(1, "Enter the maximum term")
    .refine((v) => Number(v) > 0, "Must be greater than 0"),
  guarantor_required_count: z
    .string()
    .min(1, "Enter the guarantor count"),
  max_multiplier: z
    .string()
    .min(1, "Enter the multiplier"),
  min_membership_months: z.string().min(1),
  min_contribution_months: z.string().min(1),
  auto_approval_threshold: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateLoanProductDialog({ open, onClose }: Props) {
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
      min_membership_months: "0",
      min_contribution_months: "0",
      max_multiplier: "3",
      auto_approval_threshold: "0",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createLoanProduct,
    onSuccess: () => {
      toast.success("Loan product created");
      queryClient.invalidateQueries({ queryKey: qk.loans.root });
      reset();
      setServerError(null);
      onClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not create the loan product. Please try again."
      );
    },
  });

  function onSubmit(values: FormValues) {
    setServerError(null);
    mutate({
      name: values.name,
      description: values.description,
      min_membership_months: Number(values.min_membership_months),
      min_contribution_months: Number(values.min_contribution_months),
      guarantor_required_count: Number(values.guarantor_required_count),
      max_amount: values.max_amount,
      max_multiplier: values.max_multiplier,
      interest_rate: values.interest_rate,
      max_term_months: Number(values.max_term_months),
      min_term_months: Number(values.min_term_months),
      auto_approval_threshold: values.auto_approval_threshold,
      is_active: true,
    });
  }

  return (
    <NmDialog
      open={open}
      onClose={onClose}
      title="Create Loan Product"
      description="Define a new loan product — rates, terms and approval rules."
      confirmLabel={isPending ? "Creating…" : "Create product"}
      onConfirm={handleSubmit(onSubmit)}
      loading={isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <NmField label="Product name" error={errors.name?.message} required>
          <NmInput
            icon={Landmark}
            placeholder="e.g. Staff Salary Advance"
            error={!!errors.name}
            {...register("name")}
          />
        </NmField>

        <NmField label="Description" error={errors.description?.message} required>
          <NmTextarea
            placeholder="What is this product for?"
            rows={3}
            error={!!errors.description}
            {...register("description")}
          />
        </NmField>

        <div className="grid grid-cols-2 gap-3">
          <NmField label="Max amount (₦)" error={errors.max_amount?.message} required>
            <NmInput
              type="number"
              placeholder="e.g. 5000000"
              min={0}
              error={!!errors.max_amount}
              {...register("max_amount")}
            />
          </NmField>
          <NmField label="Interest rate (%)" error={errors.interest_rate?.message} required>
            <NmInput
              type="number"
              placeholder="e.g. 5"
              min={0}
              step="0.01"
              error={!!errors.interest_rate}
              {...register("interest_rate")}
            />
          </NmField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NmField label="Min term (months)" error={errors.min_term_months?.message} required>
            <NmInput
              type="number"
              placeholder="e.g. 3"
              min={1}
              error={!!errors.min_term_months}
              {...register("min_term_months")}
            />
          </NmField>
          <NmField label="Max term (months)" error={errors.max_term_months?.message} required>
            <NmInput
              type="number"
              placeholder="e.g. 24"
              min={1}
              error={!!errors.max_term_months}
              {...register("max_term_months")}
            />
          </NmField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NmField label="Guarantors required" error={errors.guarantor_required_count?.message} required>
            <NmInput
              type="number"
              placeholder="e.g. 2"
              min={0}
              error={!!errors.guarantor_required_count}
              {...register("guarantor_required_count")}
            />
          </NmField>
          <NmField
            label="Max multiplier"
            hint="How many × contributions a member can borrow"
            error={errors.max_multiplier?.message}
          >
            <NmInput
              type="number"
              placeholder="e.g. 3"
              min={0}
              step="0.1"
              error={!!errors.max_multiplier}
              {...register("max_multiplier")}
            />
          </NmField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NmField label="Min membership (months)" error={errors.min_membership_months?.message}>
            <NmInput
              type="number"
              min={0}
              error={!!errors.min_membership_months}
              {...register("min_membership_months")}
            />
          </NmField>
          <NmField label="Min contributions (months)" error={errors.min_contribution_months?.message}>
            <NmInput
              type="number"
              min={0}
              error={!!errors.min_contribution_months}
              {...register("min_contribution_months")}
            />
          </NmField>
        </div>

        <NmField
          label="Auto-approval threshold (₦)"
          hint="Amounts at or below this are auto-approved (0 disables)"
          error={errors.auto_approval_threshold?.message}
        >
          <NmInput
            type="number"
            min={0}
            error={!!errors.auto_approval_threshold}
            {...register("auto_approval_threshold")}
          />
        </NmField>

        {serverError && <NmErrorBanner message={serverError} />}
      </form>
    </NmDialog>
  );
}