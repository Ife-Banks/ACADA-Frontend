"use client";

/**
 * Screen 27 — Apply for Loan (multi-step sheet)
 *
 * Step 0 — Product & Amount  : product, amount, term, purpose
 * Step 1 — Guarantors        : pick required number of guarantors
 * Step 2 — Review & Submit   : read-only summary before final submit
 *
 * Uses NmStepSheet for the step indicator and navigation.
 * Calls POST /loans/applications/ on final submit.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Landmark, DollarSign, Clock, FileText, Users } from "lucide-react";
import { toast } from "sonner";
import { NmStepSheet } from "@/components/app/shared/NmStepSheet";
import {
  NmField,
  NmInput,
  NmSelect,
  NmTextarea,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { getLoanProducts } from "@/lib/api/loans";
import { getMembers } from "@/lib/api/members";
import { qk } from "@/lib/query-keys";
import { submitLoanApplication } from "@/lib/api/loans";
import { ApiError } from "@/lib/api/client";

const STEPS = ["Product & Amount", "Guarantors", "Review"];

/* ─── Step 0 schema ────────────────────────────────────────────── */
const step0Schema = z.object({
  loan_product: z.string().min(1, "Select a loan product"),
  amount_requested: z
    .string()
    .min(1, "Enter the loan amount")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
  term_months: z
    .string()
    .min(1, "Select a repayment term"),
  purpose: z.string().min(10, "Describe the purpose (at least 10 characters)"),
});

type Step0Values = z.infer<typeof step0Schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-fill product + max amount coming from the eligibility sheet */
  prefillProductId?: string;
  prefillMaxAmount?: string;
}

export function LoanApplicationSheet({
  open,
  onClose,
  prefillProductId,
  prefillMaxAmount,
}: Props) {
  const [step, setStep] = useState(0);
  const [guarantorIds, setGuarantorIds] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  /* Product list */
  const { data: productsData } = useQuery({
    queryKey: qk.loans.products,
    queryFn: getLoanProducts,
    enabled: open,
  });
  const products = productsData?.results ?? [];

  /* Members list for guarantor picker */
  const { data: membersData } = useQuery({
    queryKey: qk.members.list(1, 200),
    queryFn: () => getMembers({ page_size: 200 }),
    enabled: open && step === 1,
  });
  const members = membersData?.results ?? [];

  /* Step 0 form */
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<Step0Values>({
    resolver: zodResolver(step0Schema),
    defaultValues: {
      loan_product: prefillProductId ?? "",
      amount_requested: "",
      term_months: "",
      purpose: "",
    },
  });

  const selectedProductId = watch("loan_product");
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const requiredGuarantors = selectedProduct?.guarantor_required_count ?? 0;

  /* Submit mutation */
  const { mutate, isPending } = useMutation({
    mutationFn: submitLoanApplication,
    onSuccess: () => {
      toast.success("Application submitted successfully.");
      queryClient.invalidateQueries({ queryKey: qk.loans.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages.join(" ")
          : "Submission failed. Please try again."
      );
    },
  });

  function handleClose() {
    setStep(0);
    setGuarantorIds([]);
    setServerError(null);
    onClose();
  }

  /* Step 0 → 1 gate: run react-hook-form validation */
  function handleNext() {
    if (step === 0) {
      handleSubmit(() => setStep(1))();
      return;
    }
    if (step === 1) {
      if (guarantorIds.length < requiredGuarantors) return;
      setStep(2);
    }
  }

  /* Final submit */
  function handleFinalSubmit() {
    const vals = getValues();
    mutate({
      loan_product: vals.loan_product,
      amount_requested: vals.amount_requested,
      purpose: vals.purpose,
      term_months: Number(vals.term_months),
      guarantor_member_ids: guarantorIds,
    });
  }

  function toggleGuarantor(memberId: string) {
    setGuarantorIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }

  const vals = getValues();
  const nextDisabled =
    step === 1 && guarantorIds.length < requiredGuarantors;

  return (
    <NmStepSheet
      open={open}
      onClose={handleClose}
      title="Apply for a Loan"
      steps={STEPS}
      currentStep={step}
      onBack={() => setStep((s) => s - 1)}
      onNext={handleNext}
      onSubmit={handleFinalSubmit}
      loading={isPending}
      nextDisabled={nextDisabled}
      width="sm:max-w-xl"
    >
      {/* ── Step 0: Product & Amount ── */}
      {step === 0 && (
        <div className="flex flex-col gap-5">
          <NmField label="Loan product" error={errors.loan_product?.message} required>
            <NmSelect
              icon={Landmark}
              error={!!errors.loan_product}
              {...register("loan_product")}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NmSelect>
          </NmField>

          {selectedProduct && (
            <div className="nm-inset rounded-xl p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Max amount",    value: `₦${Number(selectedProduct.max_amount).toLocaleString("en-NG")}` },
                { label: "Interest rate", value: `${selectedProduct.interest_rate}%` },
                { label: "Max term",      value: `${selectedProduct.max_term_months} months` },
                { label: "Guarantors",    value: `${selectedProduct.guarantor_required_count} required` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
                  <p className="text-sm font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          )}

          <NmField label="Amount requested (₦)" error={errors.amount_requested?.message} required>
            <NmInput
              icon={DollarSign}
              type="number"
              placeholder={prefillMaxAmount ? `Up to ₦${Number(prefillMaxAmount).toLocaleString("en-NG")}` : "e.g. 500000"}
              min={0}
              error={!!errors.amount_requested}
              {...register("amount_requested")}
            />
          </NmField>

          <NmField label="Repayment term" error={errors.term_months?.message} required>
            <NmSelect
              icon={Clock}
              error={!!errors.term_months}
              {...register("term_months")}
            >
              <option value="">Select term</option>
              {selectedProduct
                ? Array.from(
                    { length: selectedProduct.max_term_months - (selectedProduct.min_term_months - 1) },
                    (_, i) => i + selectedProduct.min_term_months
                  ).map((m) => (
                    <option key={m} value={m}>{m} months</option>
                  ))
                : [6, 12, 18, 24, 36].map((m) => (
                    <option key={m} value={m}>{m} months</option>
                  ))}
            </NmSelect>
          </NmField>

          <NmField label="Purpose" error={errors.purpose?.message} required>
            <NmTextarea
              placeholder="Describe why you need this loan…"
              rows={4}
              error={!!errors.purpose}
              {...register("purpose")}
            />
          </NmField>
        </div>
      )}

      {/* ── Step 1: Guarantors ── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="nm-inset rounded-xl px-4 py-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              This product requires{" "}
              <span className="font-semibold text-foreground">
                {requiredGuarantors} guarantor{requiredGuarantors !== 1 ? "s" : ""}
              </span>
              . Selected: {guarantorIds.length}/{requiredGuarantors}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading members…</p>
            ) : (
              members.map((m) => {
                const selected = guarantorIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleGuarantor(m.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200 ${
                      selected
                        ? "nm-pressed border border-brand-primary/30"
                        : "nm-raised"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-primary"
                    >
                      {m.user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{m.user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.user.email}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        selected
                          ? "bg-brand-primary border-brand-primary"
                          : "border-border"
                      }`}
                    >
                      {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {guarantorIds.length < requiredGuarantors && (
            <p className="text-xs text-warning font-medium text-center">
              Select {requiredGuarantors - guarantorIds.length} more guarantor{requiredGuarantors - guarantorIds.length !== 1 ? "s" : ""} to continue
            </p>
          )}
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          {serverError && <NmErrorBanner message={serverError} />}

          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Application summary
          </p>

          <div className="nm-inset rounded-2xl p-5 flex flex-col gap-3">
            {[
              { label: "Product",  value: products.find((p) => p.id === vals.loan_product)?.name ?? "—" },
              { label: "Amount",   value: vals.amount_requested ? `₦${Number(vals.amount_requested).toLocaleString("en-NG")}` : "—" },
              { label: "Term",     value: vals.term_months ? `${vals.term_months} months` : "—" },
              { label: "Purpose",  value: vals.purpose || "—" },
              { label: "Guarantors", value: guarantorIds.length > 0
                  ? members.filter((m) => guarantorIds.includes(m.id)).map((m) => m.user.full_name).join(", ")
                  : "None" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-xs text-muted-foreground font-medium shrink-0">{label}</span>
                <span className="text-xs text-foreground font-semibold text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="nm-raised rounded-xl p-4 flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              By submitting, you confirm that all information is accurate. Each
              guarantor will receive a notification to confirm their commitment.
            </p>
          </div>
        </div>
      )}
    </NmStepSheet>
  );
}
