"use client";

/**
 * CreateLoanProductDialog — form for creating a new loan product
 * (rates, terms, guarantor requirements, auto-approval threshold).
 */

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Landmark } from "lucide-react";
import { NmDialog } from "@/components/app/shared/NmDialog";
import { NmField, NmInput, NmSelect, NmTextarea, NmErrorBanner } from "@/components/app/shared/NmField";
import { createLoanProduct, updateLoanProduct } from "@/lib/api/loans";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { LoanProduct } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a product name"),
  // Description is optional on the backend, so legacy products with a blank
  // description remain editable.
  description: z.string().trim(),
  max_amount: z
    .string()
    .min(1, "Enter the maximum amount")
    .refine((v) => Number(v) > 0, "Must be greater than 0"),
  interest_rate: z
    .string()
    .min(1, "Enter the interest rate")
    .refine((v) => Number(v) >= 0, "Rate cannot be negative"),
  interest_method: z.enum(["flat", "reducing"] as const, {
    error: "Choose how the interest is charged",
  }),
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
  /** When set, the dialog edits this product instead of creating a new one. */
  product?: LoanProduct | null;
}

export function CreateLoanProductDialog({ open, onClose, product }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      min_membership_months: "0",
      min_contribution_months: "0",
      max_multiplier: "3",
      auto_approval_threshold: "0",
      interest_method: "flat",
    },
  });

  /*
   * `useWatch` rather than `watch()` — the whole-form `watch()` makes the
   * compiler skip memoising this component, and all this needs is one field.
   */
  const interestMethod = useWatch({ control, name: "interest_method" });

  useEffect(() => {
    if (!open) return;
    reset({
      name: product?.name ?? "",
      description: product?.description ?? "",
      max_amount: product?.max_amount ?? "",
      interest_rate: product?.interest_rate ?? "",
      interest_method: product?.interest_method ?? "flat",
      min_term_months: product ? String(product.min_term_months) : "",
      max_term_months: product ? String(product.max_term_months) : "",
      guarantor_required_count: product
        ? String(product.guarantor_required_count)
        : "",
      max_multiplier: product?.max_multiplier ?? "3",
      min_membership_months: product
        ? String(product.min_membership_months)
        : "0",
      min_contribution_months: product
        ? String(product.min_contribution_months)
        : "0",
      auto_approval_threshold: product?.auto_approval_threshold ?? "0",
    });
  }, [open, product, reset]);

  // Closing clears the stale error so the next open starts clean.
  function handleClose() {
    setServerError(null);
    onClose();
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Partial<LoanProduct>) =>
      product
        ? updateLoanProduct(product.id, payload)
        : createLoanProduct(payload),
    onSuccess: () => {
      toast.success(product ? "Loan product updated" : "Loan product created");
      queryClient.invalidateQueries({ queryKey: qk.loans.root });
      setServerError(null);
      onClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : `Could not ${product ? "update" : "create"} the loan product. Please try again.`
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
      interest_method: values.interest_method,
      max_term_months: Number(values.max_term_months),
      min_term_months: Number(values.min_term_months),
      auto_approval_threshold: values.auto_approval_threshold,
      is_active: product ? product.is_active : true,
    });
  }

  return (
    <NmDialog
      className="loan-products-dialog"
      open={open}
      onClose={handleClose}
      title={product ? "Edit Loan Product" : "Create Loan Product"}
      description={
        product
          ? "Update rates, terms, guarantor requirements and approval rules."
          : "Define a new loan product — rates, terms and approval rules."
      }
      confirmLabel={
        isPending
          ? product
            ? "Saving…"
            : "Creating…"
          : product
          ? "Save changes"
          : "Create product"
      }
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

        <NmField label="Description" error={errors.description?.message}>
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

        <NmField
          label="Interest basis"
          hint={
            interestMethod === "reducing"
              ? "Interest is charged on the balance still owed, so it falls as members repay. Instalments stay level."
              : "Interest is charged on the original amount for the whole term. Every instalment is the same."
          }
          error={errors.interest_method?.message}
          required
        >
          <NmSelect
            error={!!errors.interest_method}
            {...register("interest_method")}
          >
            <option value="flat">Flat (simple) interest</option>
            <option value="reducing">Reducing balance (amortised)</option>
          </NmSelect>
        </NmField>

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
