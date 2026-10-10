import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Notifications</h1>
      <p className="text-muted-foreground text-sm">Your in-app alerts and updates.</p>
    </div>
  );
}
