/**
 * Executive portal layout.
 * Roles: EXECUTIVE, SOCIETY_ADMIN (SOCIETY_ADMIN also sees the admin group)
 * Shows: dashboard KPIs, contribution cycles, schedules, loan approvals, ledger.
 */
import { ExecutiveSidebar } from "@/components/layouts/ExecutiveSidebar";

export default function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted">
      <ExecutiveSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
