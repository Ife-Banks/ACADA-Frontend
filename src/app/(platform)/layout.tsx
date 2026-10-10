/**
 * Platform Admin layout (SUPER_ADMIN only).
 * Completely separate surface — manages all tenants cross-platform.
 */
import { PlatformSidebar } from "@/components/layouts/PlatformSidebar";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted">
      <PlatformSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
