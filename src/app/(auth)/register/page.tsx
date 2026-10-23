import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/app/auth/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="auth-login-page">
      <Link href="/" className="auth-mobile-brand" aria-label="ACADA Cooperative home">
        <span className="auth-brand-mark">A</span>
        <span>ACADA <small>COOPERATIVE</small></span>
      </Link>

      <h1 className="sr-only">Create an account for your cooperative</h1>
      <RegisterForm />

      <p className="auth-register-prompt">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
