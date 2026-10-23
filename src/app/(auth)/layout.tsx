import { AuthBrandPanel } from "@/components/app/auth/AuthBrandPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <AuthBrandPanel />
      <main className="auth-main">
        <div className="auth-content">{children}</div>
      </main>
    </div>
  );
}
