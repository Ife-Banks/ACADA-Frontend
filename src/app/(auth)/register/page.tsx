import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/app/auth/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="w-full max-w-lg mx-auto">
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
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-left leading-relaxed">
          Join your cooperative society. Your admin approves each membership
          before you can sign in.
        </p>
      </div>

      {/* Mobile heading */}
      <div
        className="lg:hidden text-center mb-6"
        style={{ animation: "var(--animate-fade-up)", animationDelay: "50ms" }}
      >
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
          Join your cooperative society. Your admin approves each membership.
        </p>
      </div>

      <RegisterForm />

      <p
        className="text-center text-xs text-muted-foreground mt-6"
        style={{ animation: "var(--animate-fade-in)", animationDelay: "600ms" }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-primary hover:underline font-semibold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}