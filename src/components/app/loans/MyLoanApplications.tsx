"use client";

/**
 * MyLoanApplications — member-facing application history.
 *
 * GET /loans/applications/?scope=mine returns only the applications the
 * signed-in member submitted. (Without the scope the backend also returns
 * applications where the member is a guarantor — those live in the
 * GuaranteeRequests panel.) Each row opens a detail dialog with guarantor
 * confirmations and the approval trail.
 */

import { useState } from "react";
import { ChevronRight, FileCheck2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NmDialog } from "@/components/app/shared/NmDialog";
import { NmErrorBanner } from "@/components/app/shared/NmField";
import { useLoanApplication, useMyLoanApplications } from "@/hooks/useLoans";
import { ApiError } from "@/lib/api/client";
import { LoanApplicationStatusBadge, GuarantorStatusBadge } from "./LoanBadges";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const money = (v: string) => `₦${Number(v).toLocaleString("en-NG")}`;

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─── Detail dialog ─────────────────────────────────────────────── */

function ApplicationDetailDialog({
  applicationId,
  onClose,
}: {
  applicationId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = useLoanApplication(applicationId ?? "");

  return (
    <NmDialog
      open={!!applicationId}
      onClose={onClose}
      title="Application details"
      description="Track the status and guarantor confirmations for this application."
      confirmLabel="Close"
      onConfirm={onClose}
    >
      {isError ? (
        <NmErrorBanner message="Could not load this application. It may have been removed, or you no longer have access." />
      ) : isLoading || !data ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                {data.product.name}
              </p>
              <p className="text-lg font-bold text-foreground">
                {money(data.amount_requested)}
              </p>
            </div>
            <LoanApplicationStatusBadge status={data.status} />
          </div>

          <div className="nm-inset rounded-xl p-3 flex flex-col gap-2">
            {[
              { label: "Term", value: `${data.term_months} months` },
              { label: "Purpose", value: data.purpose || "—" },
              {
                label: "Submitted",
                value: formatDate(data.submitted_at ?? data.created_at),
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-3">
                <span className="text-xs text-muted-foreground shrink-0">
                  {label}
                </span>
                <span className="text-xs font-semibold text-foreground text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {data.rejection_reason && (
            <div className="rounded-xl p-3 nm-raised border-l-4 border-destructive">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                Rejection reason
              </p>
              <p className="text-xs text-foreground mt-1 leading-relaxed">
                {data.rejection_reason}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Guarantors
            </p>
            {data.guarantors.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No guarantors recorded yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.guarantors.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between gap-3 rounded-xl nm-raised px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {g.guarantor_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {g.guarantor_email}
                      </p>
                    </div>
                    <GuarantorStatusBadge status={g.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {data.approval_steps.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Approval trail
              </p>
              <div className="flex flex-col gap-2">
                {data.approval_steps.map((step) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl nm-raised px-3 py-2.5",
                      step.decision === "reject" && "border-l-2 border-destructive"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {step.actor_name} ·{" "}
                        <span className="capitalize">{step.decision}</span>
                      </p>
                      {step.comments && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {step.comments}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDate(step.decided_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </NmDialog>
  );
}

/* ─── Explorer ──────────────────────────────────────────────────── */

export function MyLoanApplications() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isLoading, isError, error, refetch } = useMyLoanApplications(
    page,
    PAGE_SIZE
  );

  const rows = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="nm-raised-lg bg-surface rounded-3xl p-5 text-center py-14 flex flex-col items-center gap-3">
        <p className="text-muted-foreground text-sm">
          {error instanceof ApiError
            ? error.messages[0]
            : "Could not load your applications."}
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

  if (rows.length === 0) {
    return (
      <div className="nm-raised-lg bg-surface rounded-3xl p-5 text-center py-16 flex flex-col items-center gap-3">
        <div className="nm-inset rounded-2xl w-14 h-14 flex items-center justify-center">
          <FileCheck2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-semibold text-sm">
          No applications yet
        </p>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
          Applications you submit will appear here while they move through
          guarantor confirmation and approval.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="nm-raised-lg rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Product</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {app.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.term_months} months
                  </p>
                </TableCell>
                <TableCell className="text-right text-sm font-semibold text-foreground whitespace-nowrap tabular-nums">
                  {money(app.amount_requested)}
                </TableCell>
                <TableCell>
                  <LoanApplicationStatusBadge status={app.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(app.submitted_at ?? app.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(app.id)}
                    className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-primary"
                  >
                    View
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {from}–{to} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg nm-raised text-xs font-semibold disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg nm-raised text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ApplicationDetailDialog
        applicationId={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
