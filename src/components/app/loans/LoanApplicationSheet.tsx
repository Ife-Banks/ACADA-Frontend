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

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Landmark, DollarSign, Clock, FileText, Users, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useGuarantorCandidates } from "@/hooks/useMembers";
import { useAllLoanProducts, useLoanQuote } from "@/hooks/useLoans";
import { NmStepSheet } from "@/components/app/shared/NmStepSheet";
import {
  NmField,
  NmInput,
  NmSelect,
  NmTextarea,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { LoanRepaymentEstimate } from "./LoanRepaymentEstimate";
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
  const [guarantorSearch, setGuarantorSearch] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /* Product list — the full catalogue, so a member can pick any product
     the society offers. */
  const { data: allProducts } = useAllLoanProducts();
  const products = (allProducts ?? []).filter((p) => p.is_active);

  /*
   * Guarantor picker.
   *
   * The backend expects MemberProfile IDs, and only members with a profile
   * are eligible. `guarantor-candidates` returns exactly those people with
   * a name, an email and the profile id — so a member choosing a guarantor
   * is never handed the whole roster, with everybody's employee and payroll
   * numbers, to pick one from.
   */
  const membersQuery = useGuarantorCandidates(open && step === 1);
  const members = (membersQuery.data ?? []).filter((m) => !!m.profile_id);

  const guarantorTerm = guarantorSearch.trim().toLowerCase();
  const visibleMembers = guarantorTerm
    ? members.filter(
        (m) =>
          m.full_name.toLowerCase().includes(guarantorTerm) ||
          m.email.toLowerCase().includes(guarantorTerm)
      )
    : members;

  /* Step 0 form */
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    reset,
    setValue,
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

  /*
   * The sheet stays mounted while closed, so seed the form each time it opens.
   * Without this, a product chosen from the eligibility sheet would not carry
   * over to an already-mounted application form.
   */
  useEffect(() => {
    if (!open) return;
    reset({
      loan_product: prefillProductId ?? "",
      amount_requested: "",
      term_months: "",
      purpose: "",
    });
    setStep(0);
    setGuarantorIds([]);
    setGuarantorSearch("");
    setServerError(null);
  }, [open, prefillProductId, reset]);

  const selectedProductId = watch("loan_product");
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const requiredGuarantors = selectedProduct?.guarantor_required_count ?? 0;

  /*
   * Repayment preview.
   *
   * The backend prices the loan with the same calculator that writes the
   * contract, so the figure shown here is the figure the member will be
   * charged — not an estimate made up in the browser. The request is
   * debounced so that typing an amount does not fire one per keystroke.
   */
  const amountValue = watch("amount_requested") ?? "";
  const termValue = watch("term_months") ?? "";
  const [debounced, setDebounced] = useState({ amount: "", term: "" });

  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced({ amount: amountValue, term: termValue }),
      350
    );
    return () => clearTimeout(timer);
  }, [amountValue, termValue]);

  const quoteQuery = useLoanQuote(
    selectedProductId ?? "",
    debounced.amount,
    debounced.term,
    open
  );

  const quoteError = quoteQuery.isError
    ? quoteQuery.error instanceof ApiError
      ? quoteQuery.error.messages.join(" ")
      : "Could not price this loan."
    : null;

  // A term that was valid for the previous product may be out of range for the
  // newly selected one, so clear it when the product changes.
  useEffect(() => {
    if (!selectedProductId) return;
    setValue("term_months", "");
  }, [selectedProductId, setValue]);

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
    setGuarantorSearch("");
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

  /** `profileId` is a MemberProfile id — what the API stores as guarantor. */
  function toggleGuarantor(profileId: string) {
    setGuarantorIds((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
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
      width="sm:max-w-2xl"
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
                { label: "Interest basis", value: selectedProduct.interest_method === "reducing" ? "Reducing balance" : "Flat" },
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

          {/* What this loan will actually cost — priced by the backend. */}
          <LoanRepaymentEstimate
            quote={quoteQuery.data}
            isLoading={quoteQuery.isFetching}
            error={quoteError}
          />

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

          {members.length > 0 && (
            <NmInput
              icon={Search}
              type="search"
              placeholder="Search by name, email, or employee no…"
              value={guarantorSearch}
              onChange={(e) => setGuarantorSearch(e.target.value)}
              className="py-2.5"
            />
          )}

          <div className="flex flex-col gap-2">
            {membersQuery.isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading members…</p>
            ) : members.length === 0 ? (
              <div className="nm-inset rounded-xl px-4 py-6 text-center">
                <p className="text-sm font-semibold text-foreground">
                  No eligible guarantors
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Guarantors must be active members with a completed member
                  profile. Ask an administrator to complete profiles first.
                </p>
              </div>
            ) : visibleMembers.length === 0 ? (
              <div className="nm-inset rounded-xl px-4 py-6 text-center">
                <p className="text-sm font-semibold text-foreground">
                  No members match your search
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different name or email.
                </p>
              </div>
            ) : (
              visibleMembers.map((m) => {
                const profileId = m.profile_id!;
                const selected = guarantorIds.includes(profileId);
                return (
                  <button
                    key={profileId}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleGuarantor(profileId)}
                    className={`guarantor-option flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200 ${
                      selected
                        ? "is-selected"
                        : ""
                    }`}
                  >
                    <div
                      className="guarantor-avatar w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    >
                      {m.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        selected
                          ? "is-selected"
                          : ""
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
              { label: "Interest", value: selectedProduct
                  ? `${selectedProduct.interest_rate}% ${selectedProduct.interest_method === "reducing" ? "reducing balance" : "flat"}`
                  : "—" },
              { label: "Total interest", value: quoteQuery.data
                  ? `₦${Number(quoteQuery.data.total_interest).toLocaleString("en-NG")}`
                  : "—" },
              { label: "Monthly instalment", value: quoteQuery.data
                  ? `₦${Number(quoteQuery.data.monthly_installment).toLocaleString("en-NG")}`
                  : "—" },
              { label: "Purpose",  value: vals.purpose || "—" },
              { label: "Guarantors", value: guarantorIds.length > 0
                  ? members.filter((m) => m.profile_id && guarantorIds.includes(m.profile_id)).map((m) => m.full_name).join(", ")
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
              By submitting, you confirm that the information is accurate and
              that you have asked each selected guarantor to support this
              application. Their confirmations are tracked on the application.
            </p>
          </div>
        </div>
      )}
    </NmStepSheet>
  );
}
