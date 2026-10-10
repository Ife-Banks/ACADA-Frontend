import type { Metadata } from "next";

export const metadata: Metadata = { title: "Platform Stats" };

export default function PlatformStatsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Platform Statistics</h1>
      <p className="text-muted-foreground text-sm">
        Cross-tenant overview — total societies, users, and memberships.
      </p>
    </div>
  );
}
