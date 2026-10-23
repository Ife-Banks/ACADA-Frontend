import type { Metadata } from "next";
import { TenantDetailView } from "@/components/app/platform/TenantDetailView";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Tenant Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({ params }: Props) {
  const { id } = await params;

  /* The platform console is SUPER_ADMIN's. The route prefix already
     restricts it; the gate is the second lock. */
  return (
    <RoleGate allow={["SUPER_ADMIN"]}>
      <TenantDetailView id={id} />
    </RoleGate>
  );
}
