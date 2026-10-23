"use client";

/**
 * Screen 28 — Guarantor Confirmation Dialog
 *
 * Opened from a guarantee request in the notification centre or from the
 * GuaranteeRequests panel. Renders the loan summary, then lets the guarantor
 * confirm or decline with a reason.
 *
 * Calls GET  /loans/applications/{id}/guarantee-request/
 * Calls POST /loans/applications/{id}/confirm-guarantor/
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import { NmField, NmTextarea, NmErrorBanner } from "@/components/app/shared/NmField";
import { respondAsGuarantor } from "@/lib/api/loans";
import { useGuaranteeRequest } from "@/hooks/useLoans";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

interface Props {
  open: boolean;
  onClose: () => void;
  applicationId: string;
}

export function GuarantorConfirmDialog({ open, onClose, applicationId }: Props) {
  const [decision, setDecision] = useState<"confirm" | "decline" | null>(null);
  const [reason, setReason] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: application, isLoading, isError } = useGuaranteeRequest(
    applicationId,
    open
  );

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      respondAsGuarantor(applicationId, {
        decision: decision!,
        reason: reason || undefined,
      }),
    onSuccess: () => {
      toast.success(
        decision === "confirm"
          ? "You have confirmed your guarantee."
          : "You have declined the guarantee request."
      );
      queryClient.invalidateQueries({ queryKey: qk.notifications.root });
      queryClient.invalidateQueries({ queryKey: qk.loans.guarantorRequests });
      queryClient.invalidateQueries({ queryKey: qk.loans.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError ? err.messages[0] : "Request failed. Please try again."
      );
    },
  });

  function handleClose() {
    setDecision(null);
    setReason("");
    setServerError(null);
    onClose();
  }

  function handleConfirm() {
    if (!decision) return;
    mutate();
  }

  return (
    <NmDialog
      open={open}
      onClose={handleClose}
      title="Guarantor Request"
      description="A member has listed you as a guarantor for their loan application."
      confirmLabel={
        isError
          ? "Close"
          : decision === "confirm"
          ? "Confirm guarantee"
          : decision === "decline"
          ? "Decline"
          : "Choose an option"
      }
      onConfirm={isError ? handleClose : handleConfirm}
      loading={isPending || isLoading}
      variant={decision === "decline" ? "danger" : "primary"}
      hideFooter={false}
    >
      <div className="flex flex-col gap-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Loading application details…
          </p>
        )}

        {isError && (
          <div className="nm-inset rounded-xl px-4 py-6 text-center">
            <p className="text-sm font-semibold text-foreground">
              Request unavailable
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              This guarantee request may have been withdrawn or already
              processed. Ask the applicant to check the application status.
            </p>
          </div>
        )}

        {application && (
          <>
            {/* Loan summary */}
            <div className="nm-inset rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Loan details
              </p>
              {[
                { label: "Applicant", value: application.member_name },
                { label: "Product",   value: application.product.name },
                { label: "Amount",    value: `₦${Number(application.amount_requested).toLocaleString("en-NG")}` },
                { label: "Term",      value: `${application.term_months} months` },
                { label: "Purpose",   value: application.purpose || "Not specified" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                  <span className="text-xs font-semibold text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* Responsibility notice */}
            <div
              className="nm-raised rounded-xl p-3.5 flex items-start gap-2.5"
              style={{ borderLeft: "3px solid var(--warning)" }}
            >
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                As a guarantor, you confirm the applicant is a trustworthy
                member of the society. Their repayment obligations may affect
                your own eligibility.
              </p>
            </div>

            {/* Decision buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision("confirm")}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                  decision === "confirm"
                    ? "nm-pressed bg-success/10 text-success border border-success/30"
                    : "nm-raised text-muted-foreground hover:text-success"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setDecision("decline")}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                  decision === "decline"
                    ? "nm-pressed bg-destructive/10 text-destructive border border-destructive/30"
                    : "nm-raised text-muted-foreground hover:text-destructive"
                }`}
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </div>

            {/* Reason — required for decline, optional for confirm */}
            {decision && (
              <NmField
                label={decision === "decline" ? "Reason for declining" : "Comment (optional)"}
                hint={decision === "decline" ? "Optional — the applicant will see this reason." : undefined}
              >
                <NmTextarea
                  placeholder={
                    decision === "decline"
                      ? "Why are you declining?"
                      : "Any additional comments…"
                  }
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </NmField>
            )}

            {serverError && <NmErrorBanner message={serverError} />}
          </>
        )}
      </div>
    </NmDialog>
  );
}
