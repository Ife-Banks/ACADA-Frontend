import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/app/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand mark — visible on mobile where the side panel is hidden */}
      <div
        className="flex flex-col items-center mb-8 lg:hidden"
        style={{ animation: "var(--animate-fade-up)", animationDelay: "0ms" }}
      >
        <Link
          href="/"
          className="flex items-center gap-3 mb-5 group"
          aria-label="Back to home"
        >
          <div
            className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{
              boxShadow:
                "6px 6px 14px rgba(15,23,42,0.25), -4px -4px 10px rgba(255,255,255,0.6)",
            }}
          >
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            ACADA Cooperative
          </span>
        </Link>
      </div>

      {/* Desktop header — smaller, minimal */}
      <div
        className="hidden lg:flex flex-col items-start mb-8"
        style={{ animation: "var(--animate-fade-up)", animationDelay: "0ms" }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 group"
          aria-label="Back to home"
        >
          <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105" style={{ boxShadow: "4px 4px 10px rgba(15,23,42,0.18), -3px -3px 8px rgba(255,255,255,0.6)" }}>
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            ACADA Cooperative
          </span>
        </Link>

        <h1 className="text-2xl font-bold text-foreground text-left">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-left leading-relaxed">
          Sign in to manage your cooperative account.
        </p>
      </div>

      {/* Mobile heading */}
      <div
        className="lg:hidden text-center mb-6"
        style={{ animation: "var(--animate-fade-up)", animationDelay: "50ms" }}
      >
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to your cooperative society.
        </p>
      </div>

      <LoginForm />

      <p
        className="text-center text-xs text-muted-foreground mt-6"
        style={{ animation: "var(--animate-fade-in)", animationDelay: "600ms" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-brand-primary hover:underline font-semibold"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}