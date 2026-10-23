import type { Metadata } from "next";
import { PlansExplorer } from "@/components/app/contributions/PlansExplorer";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Contribution Plans" };

export default function ContributionPlansPage() {
  return (
    /* Contribution plans are society configuration — the society admin's. */
    <RoleGate allow={["SOCIETY_ADMIN"]}>
      <PlansExplorer />
    </RoleGate>
  );
}
