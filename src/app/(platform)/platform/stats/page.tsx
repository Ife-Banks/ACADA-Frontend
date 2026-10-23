import type { Metadata } from "next";
import { PlatformStatsExplorer } from "@/components/app/platform/PlatformStatsExplorer";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Platform Stats" };

export default function PlatformStatsPage() {
  /* The platform console is SUPER_ADMIN's. The route prefix already
     restricts it; the gate is the second lock. */
  return (
    <RoleGate allow={["SUPER_ADMIN"]}>
      <PlatformStatsExplorer />
    </RoleGate>
  );
}
