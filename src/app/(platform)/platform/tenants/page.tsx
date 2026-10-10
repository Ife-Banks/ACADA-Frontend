import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tenants" };

export default function TenantsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Cooperative Societies</h1>
      <p className="text-muted-foreground text-sm">
        All tenants on the platform — create, activate, suspend, or deactivate.
      </p>
    </div>
  );
}
