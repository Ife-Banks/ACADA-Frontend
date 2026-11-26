import type { Metadata } from "next";
import { DividendDeclarationsExplorer } from "@/components/app/contributions/DividendDeclarationsExplorer";
import { DividendEntitlementsExplorer } from "@/components/app/contributions/DividendEntitlementsExplorer";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Dividends" };

export default function ExecutiveDividendsPage() {
  return (
    <div className="executive-page executive-dividends-route">
      <header className="executive-page-heading">
        <div>
          <p className="executive-page-eyebrow">Finance</p>
          <h1>Dividends</h1>
          <p>Declare and manage member dividends from share capital.</p>
        </div>
      </header>
      <RoleGate allow={["SOCIETY_ADMIN", "EXECUTIVE"]}>
        <div className="flex flex-col gap-8">
          <DividendDeclarationsExplorer />
          <DividendEntitlementsExplorer />
        </div>
      </RoleGate>
    </div>
  );
}
