import type { Metadata } from "next";
import { ExitRequestsExplorer } from "@/components/app/contributions/ExitRequestsExplorer";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Exit Requests" };

export default function ExecutiveExitRequestsPage() {
  return (
    <div className="executive-page executive-exit-requests-route">
      <header className="executive-page-heading">
        <div>
          <p className="executive-page-eyebrow">Membership</p>
          <h1>Exit requests</h1>
          <p>Review and process member exit requests.</p>
        </div>
      </header>
      <RoleGate allow={["SOCIETY_ADMIN", "EXECUTIVE"]}>
        <ExitRequestsExplorer />
      </RoleGate>
    </div>
  );
}
