"use client";

/**
 * LoginForm — sign-in form using the shared auth field and surface components.
 *
 * Fields: email, password (show/hide), tenant_code (optional — platform
 * admins leave it blank). Built from the shared auth kit so it stays
 * visually identical to RegisterForm and ChangePasswordForm.
 *
 * Calls POST /api/v1/auth/login/ via the auth context, which redirects to
 * the role-appropriate portal on success.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Mail, ArrowRight, Loader2, LifeBuoy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";
import { NmInput } from "./NmInput";
import { PasswordInput } from "./PasswordInput";

/* ─── Validation schema ─────────────────────────────────────────── */

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  tenant_code: z.string().trim().toLowerCase().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ─── Error banner ──────────────────────────────────────────────── */

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="auth-error flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      <span className="shrink-0 mt-0.5" aria-hidden>
        ⚠
      </span>
      <span>{message}</span>
    </div>
  );
}

/* ─── Form ──────────────────────────────────────────────────────── */

export function LoginForm() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await login({
        email: values.email,
        password: values.password,
        tenant_code: values.tenant_code || undefined,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.messages[0] ?? "Sign in failed. Please try again.");
      } else if (err instanceof Error && err.message) {
        setServerError(err.message);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    }
  }

  return (
    <AuthCard eyebrow="Member access" title="Welcome back" subtitle="Sign in to your cooperative account." delay={100}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && <ErrorBanner message={serverError} />}

        {/* Email */}
        <AuthField label="Email address" error={errors.email?.message} required>
          <NmInput
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            error={!!errors.email}
            {...register("email")}
          />
        </AuthField>

        {/* Password */}
        <AuthField label="Password" error={errors.password?.message} required>
          <PasswordInput
            placeholder="Enter your password"
            autoComplete="current-password"
            error={!!errors.password}
            {...register("password")}
          />
        </AuthField>

        {/* Society code */}
        <AuthField
          label="Society code"
          error={errors.tenant_code?.message}
          hint="Your cooperative's short code, e.g. acada. Leave blank if you're a platform admin."
        >
          <NmInput
            icon={Building2}
            type="text"
            placeholder="e.g. acada"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            {...register("tenant_code")}
          />
        </AuthField>

        {/* Divider */}
        <div className="auth-divider" aria-hidden="true" />

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm py-3.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Help line */}
        <p className="auth-help text-center flex items-center justify-center gap-1.5">
          <LifeBuoy className="w-3.5 h-3.5" />
          Trouble signing in? Contact your society administrator.
        </p>
      </form>
    </AuthCard>
  );
}
