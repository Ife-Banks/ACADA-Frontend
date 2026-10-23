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
    <div className="platform-shell">
      <PlatformSidebar />
      <main className="platform-main">
        <div className="platform-content">{children}</div>
      </main>
    </div>
  );
}
