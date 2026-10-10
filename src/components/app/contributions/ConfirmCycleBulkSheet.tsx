"use client";

/**
 * Screen 29 — Confirm Cycle Entries (Bulk)
 *
 * Slide-over panel on the Cycle Detail page.
 * Loads all pending entries for a cycle, lets the treasurer enter
 * the amount received per member, then bulk-confirms in one call.
 *
 * Calls POST /contributions/cycles/{id}/confirm/
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { NmSheet } from "@/components/app/shared/NmSheet";
import { NmErrorBanner } from "@/components/app/shared/NmField";
import { getCycleEntries, confirmCycle } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import type { ContributionEntry } from "@/lib/types";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  cycleId: string;
  cycleDisplay: string;
}

export function ConfirmCycleBulkSheet({
  open,
  onClose,
  cycleId,
  cycleDisplay,
}: Props) {
  /** Map of member_profile_id → amount_received string */
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: qk.contributions.cycleEntries(cycleId, 1, 200, "pending"),
    queryFn: () => getCycleEntries(cycleId, { page_size: 200, status: "pending" }),
    enabled: open && !!cycleId,
  });

  const entries: ContributionEntry[] = data?.results ?? [];

  /* Pre-fill amounts with amount_due when data loads */
  const initialised = Object.keys(amounts).length > 0;
  if (!initialised && entries.length > 0) {
    const pre: Record<string, string> = {};
    entries.forEach((e) => { pre[e.member_profile] = e.amount_due; });
    setAmounts(pre);
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      confirmCycle(
        cycleId,
        entries.map((e) => ({
          member_profile_id: e.member_profile,
          amount_received: amounts[e.member_profile] ?? "0",
        }))
      ),
    onSuccess: (res) => {
      toast.success(`${res.confirmed_count} entries confirmed.`);
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError ? err.messages[0] : "Confirmation failed."
      );
    },
  });

  function handleClose() {
    setAmounts({});
    setServerError(null);
    onClose();
  }

  const totalReceived = Object.values(amounts).reduce(
    (sum, v) => sum + (parseFloat(v) || 0),
    0
  );
  const totalDue = entries.reduce(
    (sum, e) => sum + parseFloat(e.amount_due),
    0
  );
  const allFilled = entries.every(
    (e) => amounts[e.member_profile] !== undefined && amounts[e.member_profile] !== ""
  );

  return (
    <NmSheet
      open={open}
      onClose={handleClose}
      title="Bulk Confirm Entries"
      description={`Confirm received amounts for ${cycleDisplay}`}
      width="sm:max-w-2xl"
      footer={
        <div className="flex flex-col gap-3">
          {/* Totals */}
          <div className="nm-inset rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Total due:{" "}
              <span className="font-bold text-foreground">
                ₦{totalDue.toLocaleString("en-NG")}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Total entered:{" "}
              <span
                className={cn(
                  "font-bold",
                  totalReceived === totalDue ? "text-success" : "text-warning"
                )}
              >
                ₦{totalReceived.toLocaleString("en-NG")}
              </span>
            </div>
          </div>

          {serverError && <NmErrorBanner message={serverError} />}

          <button
            type="button"
            onClick={() => mutate()}
            disabled={isPending || !allFilled || entries.length === 0}
            className="nm-btn-primary w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white font-semibold text-sm py-3.5 hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm {entries.length} entries
              </>
            )}
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <CheckCircle2 className="w-10 h-10 text-success" />
          <p className="text-sm font-semibold text-foreground">All entries confirmed</p>
          <p className="text-xs text-muted-foreground">No pending entries remain for this cycle.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_120px_120px] gap-3 px-3 pb-1">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              Member
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold text-right">
              Amount due
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold text-right">
              Received
            </span>
          </div>

          {entries.map((entry) => {
            const val = amounts[entry.member_profile] ?? "";
            const due = parseFloat(entry.amount_due);
            const recv = parseFloat(val) || 0;
            const isMissed = recv === 0;
            const isPartial = recv > 0 && recv < due;
            const isFull = recv >= due;

            return (
              <div
                key={entry.id}
                className="grid grid-cols-[1fr_120px_120px] gap-3 items-center nm-raised rounded-xl px-3 py-3"
              >
                {/* Member */}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {entry.member_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {entry.member_payroll_no}
                  </p>
                </div>

                {/* Amount due */}
                <p className="text-xs font-semibold text-foreground text-right">
                  ₦{parseFloat(entry.amount_due).toLocaleString("en-NG")}
                </p>

                {/* Editable received amount */}
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={val}
                    onChange={(e) =>
                      setAmounts((prev) => ({
                        ...prev,
                        [entry.member_profile]: e.target.value,
                      }))
                    }
                    className={cn(
                      "w-full rounded-lg px-2 py-1.5 text-xs font-semibold text-right outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-primary/30",
                      isFull
                        ? "text-success"
                        : isPartial
                        ? "text-warning"
                        : "text-foreground"
                    )}
                    style={{
                      boxShadow: isFull
                        ? "inset 2px 2px 5px rgba(22,163,74,0.12), inset -2px -2px 5px rgba(255,255,255,0.8)"
                        : "inset 2px 2px 5px var(--nm-shadow-dark), inset -2px -2px 5px var(--nm-shadow-light)",
                      background: "var(--nm-bg)",
                    }}
                  />
                  {/* Status dot */}
                  <span
                    className={cn(
                      "absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full",
                      isFull ? "bg-success" : isPartial ? "bg-warning" : isMissed && val !== "" ? "bg-destructive" : "bg-border"
                    )}
                  />
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="flex items-center gap-4 pt-1 px-1">
            {[
              { color: "bg-success",     label: "Full" },
              { color: "bg-warning",     label: "Partial" },
              { color: "bg-destructive", label: "Missed" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </NmSheet>
  );
}
