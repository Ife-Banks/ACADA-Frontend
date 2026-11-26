"use client";

/**
 * CreateDividendDeclarationDialog — create a new dividend declaration.
 *
 * Allows society admins to declare dividends with record date and per-share amount.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Coins, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmField,
  NmInput,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { createDividendDeclaration } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  financial_year: z.string().regex(/^\d{4}$/, "Enter a valid year"),
  record_date: z.string().min(1, "Select a record date"),
  per_share_amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount"),
});
type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateDividendDeclarationDialog({ open, onClose }: Props) {
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
      financial_year: String(new Date().getFullYear()),
      record_date: "",
      per_share_amount: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      createDividendDeclaration({
        financial_year: values.financial_year,
        record_date: values.record_date,
        per_share_amount: values.per_share_amount,
      }),
    onSuccess: () => {
      toast.success("Dividend declaration created.");
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not create declaration. Please try again."
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
      title="New Dividend Declaration"
      description="Declare dividends for shareholders based on paid units."
      hideFooter
    >
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        <NmField label="Financial Year" error={errors.financial_year?.message} required>
          <NmInput
            type="number"
            min="2020"
            max="2100"
            placeholder="2026"
            {...register("financial_year")}
          />
        </NmField>

        <NmField label="Record Date" error={errors.record_date?.message} required>
          <NmInput type="date" {...register("record_date")} />
        </NmField>

        <NmField
          label="Per Share Amount"
          error={errors.per_share_amount?.message}
          hint="Amount payable per eligible share unit"
          required
        >
          <NmInput
            icon={Coins}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("per_share_amount")}
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
                <Coins className="w-4 h-4" />
                Create declaration
              </>
            )}
          </button>
        </div>
      </form>
    </NmDialog>
  );
}
