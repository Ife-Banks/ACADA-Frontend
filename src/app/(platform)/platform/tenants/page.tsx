import type { Metadata } from "next";
import { TenantsExplorer } from "@/components/app/platform/TenantsExplorer";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Tenants" };

export default function TenantsPage() {
  /* The platform console is SUPER_ADMIN's. The route prefix already
     restricts it; the gate is the second lock. */
  return (
    <RoleGate allow={["SUPER_ADMIN"]}>
      <TenantsExplorer />
    </RoleGate>
  );
}
