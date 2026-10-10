/**
 * Auth layout — split-screen neumorphic shell for /login and /register.
 *
 * Left: animated brand panel (desktop only).
 * Right: soft neumorphic surface with floating orbs where each page
 * renders its centered form column.
 *
 * The pages keep their own width constraints (max-w-md / max-w-lg) so the
 * layout only provides centering + atmosphere.
 */

import { AuthBrandPanel } from "@/components/app/auth/AuthBrandPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <AuthBrandPanel />

      {/* Form column */}
      <main className="relative nm-surface min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
        {/* Decorative orbs — same language as the brand panel */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(26,86,219,0.18) 0%, transparent 70%)",
            animation: "var(--animate-float)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(126,58,242,0.15) 0%, transparent 70%)",
            animation: "var(--animate-float-slow)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(26,86,219,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative w-full">{children}</div>
      </main>
    </div>
  );
}