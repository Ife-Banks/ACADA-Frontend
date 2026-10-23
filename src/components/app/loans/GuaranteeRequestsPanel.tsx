"use client";

/**
 * GuaranteeRequestsPanel — guarantee requests addressed to the signed-in
 * member.
 *
 * GET /loans/applications/guarantor-requests/ returns every application the
 * member was named as a guarantor on. Pending requests open the
 * GuarantorConfirmDialog, which confirms or declines the guarantee.
 */

import { useState } from "react";
import { Handshake, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGuarantorRequests } from "@/hooks/useLoans";
import { ApiError } from "@/lib/api/client";
import { GuarantorStatusBadge, LoanApplicationStatusBadge } from "./LoanBadges";
import { GuarantorConfirmDialog } from "./GuarantorConfirmDialog";

const money = (v: string) => `₦${Number(v).toLocaleString("en-NG")}`;

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function GuaranteeRequestsPanel() {
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isLoading, isError, error, refetch } = useGuarantorRequests();

  const requests = data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="nm-raised-lg bg-surface rounded-3xl p-5 text-center py-12 flex flex-col items-center gap-3">
        <p className="text-muted-foreground text-sm">
          {error instanceof ApiError
            ? error.messages[0]
            : "Could not load your guarantee requests."}
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

  if (requests.length === 0) {
    return (
      <div className="nm-raised-lg bg-surface rounded-3xl p-5 text-center py-16 flex flex-col items-center gap-3">
        <div className="nm-inset rounded-2xl w-14 h-14 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-semibold text-sm">
          No guarantee requests
        </p>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
          When a member lists you as a guarantor on a loan application, the
          request appears here so you can confirm or decline it.
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
              <TableHead className="w-[30%]">Applicant</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Application</TableHead>
              <TableHead>Your response</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {request.member_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.term_months} months
                  </p>
                </TableCell>
                <TableCell className="text-xs text-foreground truncate">
                  {request.product_name}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold text-foreground whitespace-nowrap tabular-nums">
                  {money(request.amount_requested)}
                </TableCell>
                <TableCell>
                  <LoanApplicationStatusBadge status={request.status} />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDate(request.submitted_at ?? request.created_at)}
                  </p>
                </TableCell>
                <TableCell>
                  {request.guarantor_status ? (
                    <GuarantorStatusBadge status={request.guarantor_status} />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {request.guarantor_status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => setSelected(request.id)}
                      className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-primary"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      Review
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <GuarantorConfirmDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        applicationId={selected ?? ""}
      />
    </div>
  );
}
