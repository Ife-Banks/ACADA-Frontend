import type { Metadata } from "next";
import { LedgerExplorer } from "@/components/app/contributions/LedgerExplorer";

export const metadata: Metadata = { title: "Financial Ledger" };

export default function LedgerPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-foreground mb-1">Financial Ledger</h1>
      <p className="text-muted-foreground text-sm">
        Immutable member financial history — contributions, loans, and adjustments.
      </p>
      <LedgerExplorer />
    </div>
  );
}