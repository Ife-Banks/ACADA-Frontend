import type { Metadata } from "next";
import { LedgerExplorer } from "@/components/app/contributions/LedgerExplorer";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Financial Ledger" };

export default function LedgerPage() {
  return (
    <div className="executive-page executive-ledger-route">
      <header className="executive-page-heading">
        <div>
          <p className="executive-page-eyebrow">Finance</p>
          <h1>Financial ledger</h1>
          <p>Immutable member financial history — contributions, loans, and adjustments.</p>
        </div>
      </header>
      {/* The ledger is read-only, so a COMMITTEE_MEMBER may open it too —
          the same "read-only financials" the role grants. */}
      <RoleGate allow={["SOCIETY_ADMIN", "EXECUTIVE", "COMMITTEE_MEMBER"]}>
        <LedgerExplorer />
      </RoleGate>
    </div>
  );
}
