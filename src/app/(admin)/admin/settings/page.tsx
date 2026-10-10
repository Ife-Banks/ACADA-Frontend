import type { Metadata } from "next";

export const metadata: Metadata = { title: "Society Settings" };

export default function SocietySettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Society Settings</h1>
      <p className="text-muted-foreground text-sm">
        Manage branding, contribution rules, and notification policies.
      </p>
    </div>
  );
}
