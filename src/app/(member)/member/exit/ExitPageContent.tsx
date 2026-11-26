"use client";

import { ExitRequestSheet } from "@/components/app/contributions/ExitRequestSheet";
import { useMyExitRequests } from "@/hooks/useContributions";
import { useState } from "react";

export function ExitPageContent() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: exitRequests } = useMyExitRequests();

  const hasPendingRequest = exitRequests?.some(
    (r) => r.status === "submitted" || r.status === "in_review"
  );

  return (
    <div className="member-page member-exit-route">
      <header className="member-page-heading">
        <div>
          <p className="member-page-eyebrow">Membership</p>
          <h1>Exit cooperative</h1>
          <p>Request to leave the cooperative and settle your contributions.</p>
        </div>
      </header>

      <div className="nm-raised-lg rounded-3xl p-6 max-w-2xl">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Exit process</h2>
            <p className="text-sm text-muted-foreground mt-1">
              When you exit, your contribution balance will be reviewed and any applicable
              deductions (loans, penalties) will be settled before payment.
            </p>
          </div>

          {hasPendingRequest ? (
            <div className="nm-raised rounded-2xl p-4 border border-yellow-500/30 bg-yellow-500/5">
              <p className="text-sm font-semibold text-foreground">Request pending</p>
              <p className="text-xs text-muted-foreground mt-1">
                You already have an exit request under review. Please wait for the decision.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setSheetOpen(true)}
              className="nm-btn-primary rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Submit exit request
            </button>
          )}

          {exitRequests && exitRequests.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Your requests</p>
              <div className="flex flex-col gap-2">
                {exitRequests.map((r) => (
                  <div
                    key={r.id}
                    className="nm-raised rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(r.requested_exit_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.reason.substring(0, 50)}...
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        r.status === "approved"
                          ? "bg-green-500/10 text-green-600"
                          : r.status === "rejected"
                          ? "bg-red-500/10 text-red-600"
                          : r.status === "settled"
                          ? "bg-purple-500/10 text-purple-600"
                          : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ExitRequestSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
