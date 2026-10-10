import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tenant Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Tenant Detail</h1>
      <p className="text-muted-foreground text-sm">Tenant ID: {id}</p>
      <p className="text-muted-foreground text-sm mt-1">
        Branding, settings, rule sets, and status management.
      </p>
    </div>
  );
}
