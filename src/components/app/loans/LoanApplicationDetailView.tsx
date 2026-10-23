"use client";

/**
 * LoanApplicationDetailView — executive decision screen for a single
 * loan application: rule evaluation, guarantors, approval trail and
 * approve / reject actions.
 */

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Gavel,
  Loader2,
  MinusCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLoanApplication } from "@/hooks/useLoans";
import { ApproveLoanDialog } from "./ApproveLoanDialog";
import { GuarantorStatusBadge, LoanApplicationStatusBadge } from "./LoanBadges";
import { ApiError } from "@/lib/api/client";
import type { LoanApprovalStep, RuleResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const money = (v: string) => `₦${Number(v).toLocaleString("en-NG")}`;

const DECISIONABLE = ["submitted", "evaluating", "escalated"];

/* ─── Rule row ──────────────────────────────────────────────────── */

function RuleRow({ rule }: { rule: RuleResult }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-xl nm-raised",
        !rule.passed && "border-l-2 border-destructive"
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

/* ─── Approval step ─────────────────────────────────────────────── */

function ApprovalStep({ step }: { step: LoanApprovalStep }) {
  const Icon =
    step.decision === "approve" ? CheckCircle2 : step.decision === "reject" ? XCircle : MinusCircle;
  const color =
    step.decision === "approve"
      ? "text-success"
      : step.decision === "reject"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <div className="flex items-start gap-3">
      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", color)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="text-sm font-semibold text-foreground">{step.actor_name}</p>
          <span className="text-xs text-muted-foreground">
            {step.actor_role_code.replace("_", " ")} · {step.decision}
          </span>
          <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
            {new Date(step.decided_at).toLocaleString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        {step.comments && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            “{step.comments}”
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Explorer ──────────────────────────────────────────────────── */

export function LoanApplicationDetailView({ applicationId }: { applicationId: string }) {
  const { data: application, isLoading, isError, error, refetch } =
    useLoanApplication(applicationId);
  const { isExecutiveOrAbove } = useAuth();
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [tab, setTab] = useState<"overview" | "guarantors" | "trail">("overview");

  if (isError) {
    return (
      <div className="nm-raised-lg bg-surface rounded-3xl p-5 text-center py-14 flex flex-col items-center gap-3">
        <p className="text-muted-foreground text-sm">
          {error instanceof ApiError
            ? error.messages[0]
            : "Could not load this application."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm font-semibold text-brand-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading || !application) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const evaluation = application.rule_evaluation;
  const passCount = evaluation?.rules.filter((r) => r.passed).length ?? 0;
  const totalCount = evaluation?.rules.length ?? 0;
  const decisionable = DECISIONABLE.includes(application.status);
  const canDecide = decisionable && isExecutiveOrAbove;
  const accepted = ["approved", "disbursed"].includes(application.status);

  const tabs = [
    { id: "overview", label: `Overview${evaluation ? ` (${passCount}/${totalCount})` : ""}` },
    { id: "guarantors", label: `Guarantors (${application.guarantors.length})` },
    { id: "trail", label: `Approval trail (${application.approval_steps.length})` },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/executive/loans"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Loan applications
      </Link>

      {/* Header card */}
      <div className="nm-raised-lg bg-surface rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-base font-bold text-brand-primary">
              {application.member_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-bold text-foreground">
                  {application.member_name}
                </p>
                <LoanApplicationStatusBadge status={application.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {application.product.name} · {money(application.amount_requested)} ·{" "}
                {application.term_months} months
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
              {application.submitted_at ? "Submitted" : "Created"}
            </p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {new Date(application.submitted_at ?? application.created_at).toLocaleDateString(
                "en-NG",
                { day: "numeric", month: "short", year: "numeric" }
              )}
            </p>
          </div>
        </div>

        {/* Purpose */}
        {application.purpose && (
          <div className="mt-4 nm-inset rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
              Purpose
            </p>
            <p className="text-sm text-foreground leading-relaxed">{application.purpose}</p>
          </div>
        )}

        {/* Eligibility banner */}
        {evaluation && (
          <div
            className={cn(
              "mt-4 rounded-2xl p-4 nm-raised flex items-start gap-3",
              (evaluation.eligible || evaluation.blocked_on_guarantors) &&
                "border-l-4 border-success",
              !evaluation.eligible && !evaluation.blocked_on_guarantors &&
                "border-l-4 border-destructive"
            )}
          >
            <ShieldCheck
              className={cn(
                "w-5 h-5 shrink-0 mt-0.5",
                evaluation.eligible || evaluation.blocked_on_guarantors
                  ? "text-success"
                  : "text-destructive"
              )}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {evaluation.blocked_on_guarantors
                  ? "Awaiting guarantors"
                  : evaluation.eligible
                  ? evaluation.approval_mode === "auto"
                    ? "Auto-approval eligible"
                    : "Eligible — needs executive approval"
                  : "Not eligible"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {evaluation.message}
              </p>
              {evaluation.eligible && (
                <p className="text-xs font-semibold text-success mt-1">
                  Max borrowable: {money(evaluation.max_borrowable)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Decision CTA */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {accepted ? (
            <p className="text-xs text-success font-semibold inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              This application has been processed.
            </p>
          ) : decisionable ? (
            canDecide ? (
              <button
                type="button"
                onClick={() => setDecisionOpen(true)}
                className="nm-btn-primary flex items-center gap-2 rounded-xl bg-brand-primary text-white text-sm font-semibold px-4 py-2.5 hover:bg-brand-primary-hover transition-colors duration-200"
              >
                <Gavel className="w-4 h-4" />
                Approve or reject
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">
                Awaiting an executive decision. Committee members can review but
                not decide applications.
              </p>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              No action needed for this application right now.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Guarantors: <span className="font-semibold text-foreground">{application.guarantors.filter((g) => g.status === "confirmed").length}/{application.guarantors.length}</span> confirmed
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="nm-raised-lg bg-surface rounded-3xl p-5">
        <div className="flex items-center gap-1 nm-inset rounded-xl p-1 w-fit mb-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 whitespace-nowrap",
                tab === t.id
                  ? "bg-brand-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="flex flex-col gap-3">
            {/* Summary grid */}
            <div className="nm-inset rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 mb-1">
              {[
                { label: "Product", value: application.product.name },
                { label: "Interest", value: `${application.product.interest_rate}% ${application.product.interest_method === "reducing" ? "reducing balance" : "flat"}` },
                { label: "Max term", value: `${application.product.max_term_months} months` },
                { label: "Amount requested", value: money(application.amount_requested) },
                { label: "Term", value: `${application.term_months} months` },
                { label: "Mode", value: evaluation?.approval_mode === "auto" ? "Auto" : "Manual" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 capitalize">{value}</p>
                </div>
              ))}
            </div>

            {evaluation ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Rule evaluation
                </p>
                {evaluation.rules.map((rule) => (
                  <RuleRow key={rule.rule_name} rule={rule} />
                ))}
                {evaluation.blocked_on_guarantors && (
                  <div
                    className="nm-raised rounded-xl p-3.5 flex items-center gap-2"
                    style={{ borderLeft: "3px solid var(--warning)" }}
                  >
                    <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Waiting on guarantor confirmations before a decision can be made.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No rule evaluation is available for this application.
              </p>
            )}
          </div>
        )}

        {tab === "guarantors" && (
          <div className="flex flex-col gap-2">
            {application.guarantors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No guarantors were required for this product.
              </p>
            ) : (
              application.guarantors.map((g) => (
                <div
                  key={g.id}
                  className="nm-raised rounded-xl p-4 flex flex-wrap items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-primary">
                    {g.guarantor_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {g.guarantor_name}
                      </p>
                      <GuarantorStatusBadge status={g.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{g.guarantor_email}</p>
                    {g.decline_reason && (
                      <p className="text-xs text-destructive mt-1 leading-relaxed">
                        Reason: {g.decline_reason}
                      </p>
                    )}
                  </div>
                  {g.confirmed_at && (
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(g.confirmed_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "trail" && (
          <div className="flex flex-col gap-4">
            {application.approval_steps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No approval actions have been recorded yet.
              </p>
            ) : (
              application.approval_steps.map((step) => (
                <ApprovalStep key={step.id} step={step} />
              ))
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Syncing…
        </p>
      )}

      {/* Only mounted for a role that may actually decide the application —
          a read-only committee member never has a write dialog in the tree. */}
      {canDecide && (
        <ApproveLoanDialog
          open={decisionOpen}
          onClose={() => setDecisionOpen(false)}
          application={application}
        />
      )}
    </div>
  );
}