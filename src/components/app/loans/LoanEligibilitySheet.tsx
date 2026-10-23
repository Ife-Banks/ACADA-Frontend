"use client";

/**
 * Screen 26 — Loan Eligibility Check Result
 * Slide-over panel on the Member Loans page.
 *
 * Shows a product selector, triggers POST /loans/eligibility/,
 * then renders per-rule pass/fail results so the member knows
 * exactly why they qualify or don't.
 *
 * Props:
 *   open        — controlled open state
 *   onClose     — close handler
 *   onApply     — called when member clicks "Apply now" after passing
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  AlertCircle,
  Loader2,
  Landmark,
} from "lucide-react";
import { NmSheet } from "@/components/app/shared/NmSheet";
import { NmField, NmSelect, NmInput, NmErrorBanner } from "@/components/app/shared/NmField";
import { checkEligibility } from "@/lib/api/loans";
import { useAllLoanProducts } from "@/hooks/useLoans";
import type { RuleEvaluation, RuleResult } from "@/lib/types";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  loan_product_id: z.string().min(1, "Select a loan product"),
  amount: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

/* ─── Rule result row ──────────────────────────────────────────── */

function RuleRow({ rule }: { rule: RuleResult }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200",
        rule.passed ? "nm-raised" : "nm-raised border-l-2 border-destructive"
      )}
    >
      {rule.passed ? (
        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground capitalize">
          {rule.rule_name.replace(/_/g, " ")}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {rule.message}
        </p>
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (productId: string, maxAmount: string) => void;
}

export function LoanEligibilitySheet({ open, onClose, onApply }: Props) {
  const [result, setResult] = useState<RuleEvaluation | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  /* Fetch the full product catalogue — a member must be able to compare
     every product the society offers, not just the first page. */
  const { data: allProducts, isLoading: productsLoading } = useAllLoanProducts();
  const products = (allProducts ?? []).filter((p) => p.is_active);

  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedProductId = watch("loan_product_id");

  /* Eligibility mutation */
  const { mutate, isPending } = useMutation({
    mutationFn: checkEligibility,
    onSuccess: (data) => {
      setResult(data);
      setServerError(null);
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Eligibility check failed. Please try again."
      );
    },
  });

  function onSubmit(values: FormValues) {
    setResult(null);
    mutate({
      loan_product_id: values.loan_product_id,
      amount: values.amount || undefined,
    });
  }

  function handleClose() {
    setResult(null);
    setServerError(null);
    onClose();
  }

  const passedAll = result?.eligible && !result?.blocked_on_guarantors;
  const passCount = result?.rules.filter((r) => r.passed).length ?? 0;
  const totalCount = result?.rules.length ?? 0;

  return (
    <NmSheet
      open={open}
      onClose={handleClose}
      title="Check Eligibility"
      description="See if you qualify for a loan before applying."
    >
      <div className="flex flex-col gap-5">
        {/* Check form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <NmField label="Loan product" error={errors.loan_product_id?.message} required>
            <NmSelect
              icon={Landmark}
              error={!!errors.loan_product_id}
              {...register("loan_product_id")}
            >
              <option value="">
                {productsLoading ? "Loading products…" : "Select a product"}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — up to ₦{Number(p.max_amount).toLocaleString("en-NG")}
                </option>
              ))}
            </NmSelect>
          </NmField>

          <NmField
            label="Desired amount (optional)"
            hint="Leave blank to check against the product maximum."
            error={errors.amount?.message}
          >
            <NmInput
              type="number"
              placeholder="e.g. 500000"
              min={0}
              {...register("amount")}
            />
          </NmField>

          {serverError && <NmErrorBanner message={serverError} />}

          <button
            type="submit"
            disabled={isPending || !selectedProductId}
            className="nm-btn-primary w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white font-semibold text-sm py-3 hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking…
              </>
            ) : (
              "Check eligibility"
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div
            className="flex flex-col gap-4"
            style={{ animation: "var(--animate-fade-up)" }}
          >
            {/* Summary banner */}
            <div
              className={cn(
                "rounded-2xl p-5 flex flex-col gap-1",
                passedAll ? "nm-raised" : "nm-raised"
              )}
              style={{
                borderLeft: `4px solid ${passedAll ? "var(--success)" : "var(--destructive)"}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                {passedAll ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
                <span className="font-bold text-foreground text-sm">
                  {passedAll ? "You are eligible" : result.blocked_on_guarantors ? "Awaiting guarantors" : "Not eligible"}
                </span>
                <span className="ml-auto text-xs text-muted-foreground font-medium">
                  {passCount}/{totalCount} rules passed
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {result.message}
              </p>
              {passedAll && (
                <p className="text-xs font-semibold text-success mt-1">
                  Max borrowable: ₦{Number(result.max_borrowable).toLocaleString("en-NG")} ·{" "}
                  {result.approval_mode === "auto" ? "Auto-approved" : "Requires executive approval"}
                </p>
              )}
            </div>

            {/* Per-rule breakdown */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rule breakdown
              </p>
              {result.rules.map((rule) => (
                <RuleRow key={rule.rule_name} rule={rule} />
              ))}
            </div>

            {/* Apply CTA */}
            {passedAll && (
              <button
                type="button"
                onClick={() =>
                  onApply(selectedProductId, result.max_borrowable)
                }
                className="nm-btn-primary w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white font-semibold text-sm py-3 hover:bg-brand-primary-hover transition-colors duration-200 mt-1"
              >
                Apply now
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </NmSheet>
  );
}
