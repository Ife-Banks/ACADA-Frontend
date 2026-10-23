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
    <div className="portal-shell member-portal-shell flex min-h-screen bg-muted">
      <MemberSidebar />
      <main className="portal-main member-portal-main flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
