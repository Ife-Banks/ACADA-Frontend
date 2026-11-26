import type { Metadata } from "next";
import { ShareholdingsExplorer } from "@/components/app/contributions/ShareholdingsExplorer";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Share Capital" };

export default function ExecutiveSharesPage() {
  return (
    <div className="executive-page executive-shares-route">
      <header className="executive-page-heading">
        <div>
          <p className="executive-page-eyebrow">Finance</p>
          <h1>Share capital</h1>
          <p>Manage member share subscriptions and payments.</p>
        </div>
      </header>
      <RoleGate allow={["SOCIETY_ADMIN", "EXECUTIVE"]}>
        <ShareholdingsExplorer />
      </RoleGate>
    </div>
  );
}
