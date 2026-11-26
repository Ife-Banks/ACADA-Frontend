import type { Metadata } from "next";
import { ContributionAgreementsPanel } from "@/components/app/contributions/ContributionAgreementsPanel";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Contribution Agreements" };

export default function ExecutiveAgreementsPage() {
  return (
    <div className="executive-page executive-agreements-route">
      <header className="executive-page-heading">
        <div>
          <p className="executive-page-eyebrow">Finance</p>
          <h1>Contribution agreements</h1>
          <p>Member-specific contribution amounts and terms.</p>
        </div>
      </header>
      <RoleGate allow={["SOCIETY_ADMIN"]}>
        <ContributionAgreementsPanel />
      </RoleGate>
    </div>
  );
}
