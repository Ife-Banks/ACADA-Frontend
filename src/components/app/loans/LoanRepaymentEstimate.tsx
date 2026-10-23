"use client";

/**
 * LoanRepaymentEstimate — what the loan will actually cost.
 *
 * The figures come from POST /loans/quote/, which runs the same calculator
 * the backend uses to write the loan contract. So this is the real number
 * the member will be charged, not an estimate that might drift.
 *
 * The basis matters as much as the rate: a flat product charges interest on
 * the original amount for the whole term, a reducing-balance product charges
 * interest on what is still owed — and the two cost the member very
 * different amounts over the same term.
 */

import { useState } from "react";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";
import type { RepaymentQuote } from "@/lib/types";
import { cn } from "@/lib/utils";

const money = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface Props {
  quote?: RepaymentQuote;
  isLoading?: boolean;
  error?: string | null;
  /** Shown while there is nothing to quote yet. */
  prompt?: string;
  className?: string;
}

export function LoanRepaymentEstimate({
  quote,
  isLoading = false,
  error = null,
  prompt = "Enter an amount and a term to see what this loan will cost.",
  className,
}: Props) {
  const [showSchedule, setShowSchedule] = useState(false);

  if (error) {
    return (
      <div
        className={cn(
          "nm-inset rounded-xl px-4 py-3 text-xs font-medium text-destructive",
          className
        )}
      >
        {error}
      </div>
    );
  }

  if (!quote) {
    return (
      <div
        className={cn(
          "nm-inset rounded-xl px-4 py-3 flex items-center gap-2",
          className
        )}
      >
        <Calculator className="w-4 h-4 text-brand-primary shrink-0" />
        <p className="text-xs text-muted-foreground">
          {isLoading ? "Working out the repayment…" : prompt}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("nm-inset rounded-xl p-4 flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <Calculator className="w-4 h-4 text-brand-primary shrink-0" />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Repayment estimate
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total interest", value: money(quote.total_interest) },
          { label: "Total repayable", value: money(quote.total_repayable) },
          {
            label: "Monthly instalment",
            value: `${money(quote.monthly_installment)}/mo`,
            highlight: true,
          },
          { label: "Interest", value: `${quote.annual_rate}% ${basisLabel(quote)}` },
        ].map(({ label, value, highlight }) => (
          <div key={label}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              {label}
            </p>
            <p
              className={cn(
                "text-sm font-bold text-foreground leading-tight",
                highlight && "text-brand-primary"
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {quote.interest_method === "reducing"
          ? "Interest is charged on the balance still owed, so it falls as you repay."
          : "Interest is charged on the original amount for the whole term."}{" "}
        Over {quote.term_months} months. The final instalment absorbs any rounding.
      </p>

      <button
        type="button"
        onClick={() => setShowSchedule((s) => !s)}
        className="self-start inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-primary hover:underline"
      >
        {showSchedule ? (
          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        )}
        {showSchedule ? "Hide instalment breakdown" : "Show instalment breakdown"}
      </button>

      {showSchedule && (
        <div className="max-h-52 overflow-y-auto rounded-lg border border-border/60">
          <table className="w-full text-[11px]">
            <thead className="bg-muted/40 sticky top-0">
              <tr>
                <th className="text-left font-semibold text-muted-foreground px-2.5 py-1.5">
                  #
                </th>
                <th className="text-right font-semibold text-muted-foreground px-2.5 py-1.5">
                  Principal
                </th>
                <th className="text-right font-semibold text-muted-foreground px-2.5 py-1.5">
                  Interest
                </th>
                <th className="text-right font-semibold text-muted-foreground px-2.5 py-1.5">
                  Due
                </th>
              </tr>
            </thead>
            <tbody>
              {quote.schedule.map((row) => (
                <tr key={row.installment_no} className="border-t border-border/40">
                  <td className="px-2.5 py-1.5 text-muted-foreground">
                    {row.installment_no}
                  </td>
                  <td className="px-2.5 py-1.5 text-right text-foreground">
                    {money(row.principal_component)}
                  </td>
                  <td className="px-2.5 py-1.5 text-right text-foreground">
                    {money(row.interest_component)}
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-semibold text-foreground">
                    {money(row.amount_due)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** "flat" / "reducing" → the short label shown beside the rate. */
export function basisLabel(quote: RepaymentQuote): string {
  return quote.interest_method === "reducing" ? "reducing balance" : "flat";
}
