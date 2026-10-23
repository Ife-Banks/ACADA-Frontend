/**
 * Society Admin (President) portal layout.
 * Role: SOCIETY_ADMIN
 * Shows: member management, role management, society settings.
 * Also has access to everything in the executive group.
 */
import { AdminSidebar } from "@/components/layouts/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="portal-shell flex min-h-screen bg-muted">
      <AdminSidebar />
      <main className="portal-main flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
