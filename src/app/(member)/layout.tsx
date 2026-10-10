/**
 * Member portal layout.
 * Roles: MEMBER
 * Shows: own contributions, own loan, notifications.
 */
import { MemberSidebar } from "@/components/layouts/MemberSidebar";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted">
      <MemberSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
