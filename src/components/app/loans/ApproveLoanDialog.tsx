"use client";

/**
 * Screen 32 — Approve / Reject Loan Application Dialog
 *
 * Shown on the Loan Application Detail page for EXECUTIVE and
 * SOCIETY_ADMIN roles. Renders:
 *   — Full rule evaluation results (pass/fail per rule)
 *   — Guarantor status list
 *   — Approve / Reject toggle
 *   — Comments field
 *
 * Calls POST /loans/applications/{id}/approve/
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import { NmField, NmTextarea, NmErrorBanner } from "@/components/app/shared/NmField";
import { decideLoanApplication } from "@/lib/api/loans";
import { qk } from "@/lib/query-keys";
import type { LoanApplicationDetail, RuleResult, LoanGuarantor } from "@/lib/types";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/* ─── Sub-components ───────────────────────────────────────────── */

function RuleRow({ rule }: { rule: RuleResult }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl",
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

function GuarantorRow({ g }: { g: LoanGuarantor }) {
  const colors: Record<string, string> = {
    confirmed: "text-success",
    declined:  "text-destructive",
    pending:   "text-warning",
  };
  const icons: Record<string, React.ElementType> = {
    confirmed: CheckCircle2,
    declined:  XCircle,
    pending:   AlertCircle,
  };
  const Icon = icons[g.status] ?? AlertCircle;

  return (
    <div className="nm-raised flex items-center gap-3 p-3 rounded-xl">
      <Icon className={cn("w-4 h-4 shrink-0", colors[g.status])} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">
          {g.guarantor_name}
        </p>
        <p className="text-xs text-muted-foreground">{g.guarantor_email}</p>
      </div>
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-wide",
          colors[g.status]
        )}
      >
        {g.status}
      </span>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  application: LoanApplicationDetail | null;
}

export function ApproveLoanDialog({ open, onClose, application }: Props) {
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [comments, setComments] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      decideLoanApplication(application!.id, {
        decision: decision!,
        comments: comments || undefined,
      }),
    onSuccess: () => {
      toast.success(
        decision === "approve"
          ? "Loan application approved."
          : "Loan application rejected."
      );
      queryClient.invalidateQueries({ queryKey: qk.loans.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Decision could not be submitted."
      );
    },
  });

  function handleClose() {
    setDecision(null);
    setComments("");
    setServerError(null);
    onClose();
  }

  if (!application) return null;

  const evaluation = application.rule_evaluation;
  const passCount  = evaluation?.rules.filter((r) => r.passed).length ?? 0;
  const totalCount = evaluation?.rules.length ?? 0;
  const allGuarantorsConfirmed = application.guarantors.every(
    (g) => g.status === "confirmed"
  );

  return (
    <NmDialog
      open={open}
      onClose={handleClose}
      title="Loan Decision"
      description={`Review and decide on ${application.member_name}'s application.`}
      confirmLabel={
        decision === "approve"
          ? "Approve application"
          : decision === "reject"
          ? "Reject application"
          : "Choose a decision"
      }
      onConfirm={() => mutate()}
      loading={isPending}
      variant={decision === "reject" ? "danger" : "primary"}
      hideFooter={false}
    >
      <div className="flex flex-col gap-5">

        {/* ── Loan summary ── */}
        <div className="nm-inset rounded-2xl p-4 grid grid-cols-2 gap-3">
          {[
            { label: "Applicant",  value: application.member_name },
            { label: "Product",    value: application.product.name },
            { label: "Amount",     value: `₦${Number(application.amount_requested).toLocaleString("en-NG")}` },
            { label: "Term",       value: `${application.term_months} months` },
            { label: "Status",     value: application.status.replace(/_/g, " ") },
            { label: "Mode",       value: evaluation?.approval_mode === "auto" ? "Auto" : "Manual" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                {label}
              </p>
              <p className="text-xs font-bold text-foreground capitalize">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Rule evaluation ── */}
        {evaluation && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Rule evaluation
              </p>
              <span
                className={cn(
                  "text-xs font-bold",
                  evaluation.eligible ? "text-success" : "text-destructive"
                )}
              >
                {passCount}/{totalCount} passed
              </span>
            </div>
            {evaluation.rules.map((rule) => (
              <RuleRow key={rule.rule_name} rule={rule} />
            ))}
            {evaluation.blocked_on_guarantors && (
              <div
                className="nm-raised rounded-xl p-3 flex items-center gap-2"
                style={{ borderLeft: "3px solid var(--warning)" }}
              >
                <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Application is still waiting on guarantor confirmations.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Guarantors ── */}
        {application.guarantors.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Guarantors{" "}
              {allGuarantorsConfirmed && (
                <span className="text-success font-bold">— all confirmed</span>
              )}
            </p>
            {application.guarantors.map((g) => (
              <GuarantorRow key={g.id} g={g} />
            ))}
          </div>
        )}

        {/* ── Decision toggle ── */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your decision
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision("approve")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
                decision === "approve"
                  ? "nm-pressed border border-success/30 text-success bg-success/5"
                  : "nm-raised text-muted-foreground hover:text-success"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => setDecision("reject")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
                decision === "reject"
                  ? "nm-pressed border border-destructive/30 text-destructive bg-destructive/5"
                  : "nm-raised text-muted-foreground hover:text-destructive"
              )}
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>

        {/* ── Comments ── */}
        {decision && (
          <NmField
            label={decision === "reject" ? "Rejection reason" : "Comments (optional)"}
            hint={decision === "reject" ? "Saved on the application and shown to the member." : undefined}
          >
            <NmTextarea
              placeholder={
                decision === "reject"
                  ? "Explain why the application is being rejected…"
                  : "Any notes for the record…"
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </NmField>
        )}

        {serverError && <NmErrorBanner message={serverError} />}
      </div>
    </NmDialog>
  );
}
