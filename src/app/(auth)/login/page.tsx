import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/app/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="auth-login-page">
      <Link href="/" className="auth-mobile-brand" aria-label="ACADA Cooperative home">
        <span className="auth-brand-mark">A</span>
        <span>ACADA <small>COOPERATIVE</small></span>
      </Link>

      <h1 className="sr-only">Sign in to your cooperative account</h1>
      <LoginForm />
    </div>
  );
}
