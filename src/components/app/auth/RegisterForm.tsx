"use client";

/**
 * RegisterForm — full registration form.
 *
 * Fields: first_name, last_name, email, phone (optional), tenant_code
 * (required), password, password_confirm. Built from the shared auth kit.
 *
 * On success shows the shared SuccessCard: the account is created with
 * a pending membership that the society admin must approve.
 *
 * Calls POST /api/v1/auth/register/.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Mail, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { register as apiRegister } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";
import { NmInput } from "./NmInput";
import { PasswordInput } from "./PasswordInput";
import { PasswordStrength } from "./PasswordStrength";
import { SuccessCard } from "./SuccessCard";

/* ─── Validation schema ─────────────────────────────────────────── */

const schema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: z.string().optional(),
    tenant_code: z
      .string()
      .min(1, "Society code is required")
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, hyphens and underscores"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    password_confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Passwords don't match",
    path: ["password_confirm"],
  });

type FormValues = z.infer<typeof schema>;

/* ─── Error banner ──────────────────────────────────────────────── */

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm text-destructive"
      role="alert"
      style={{
        background: "var(--destructive-bg)",
        boxShadow:
          "inset 2px 2px 6px rgba(220,38,38,0.08), inset -2px -2px 6px rgba(255,255,255,0.6)",
        animation: "var(--animate-fade-in)",
      }}
    >
      <span className="shrink-0 mt-0.5" aria-hidden>
        ⚠
      </span>
      <span>{message}</span>
    </div>
  );
}

/* ─── Form ──────────────────────────────────────────────────────── */

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; email: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const passwordValue = watch("password") ?? "";

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await apiRegister({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone?.trim() || undefined,
        tenant_code: values.tenant_code,
        password: values.password,
        password_confirm: values.password_confirm,
      });
      setSuccess({ name: values.first_name, email: values.email });
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.messages.join(" ")
          : "Registration failed. Please try again."
      );
    }
  }

  /* Success state */
  if (success) {
    return (
      <SuccessCard
        title={`Account created, ${success.name}!`}
        message={
          <>
            We sent a confirmation to{" "}
            <span className="font-semibold text-foreground">{success.email}</span>.
            Your membership is{" "}
            <span className="font-semibold text-foreground">pending approval</span>{" "}
            — your society admin will activate your account.
          </>
        }
        steps={[
          "Your admin will review and approve your membership",
          "Once approved, sign in with your society code",
          "You'll land on your personal dashboard",
        ]}
      />
    );
  }

  return (
    <AuthCard eyebrow="Join your cooperative" title="Create your account" delay={100}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {serverError && <ErrorBanner message={serverError} />}

        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthField label="First name" error={errors.first_name?.message} required>
            <NmInput
              icon={User}
              type="text"
              placeholder="Ade"
              autoComplete="given-name"
              error={!!errors.first_name}
              {...register("first_name")}
            />
          </AuthField>
          <AuthField label="Last name" error={errors.last_name?.message} required>
            <NmInput
              icon={User}
              type="text"
              placeholder="Balogun"
              autoComplete="family-name"
              error={!!errors.last_name}
              {...register("last_name")}
            />
          </AuthField>
        </div>

        {/* Email */}
        <AuthField label="Email address" error={errors.email?.message} required>
          <NmInput
            icon={Mail}
            type="email"
            placeholder="ade.balogun@university.edu.ng"
            autoComplete="email"
            inputMode="email"
            error={!!errors.email}
            {...register("email")}
          />
        </AuthField>

        {/* Phone (optional) */}
        <AuthField
          label="Phone number"
          error={errors.phone?.message}
          hint="Optional — used for SMS alerts."
        >
          <NmInput
            icon={Phone}
            type="tel"
            placeholder="+234 801 234 5678"
            autoComplete="tel"
            {...register("phone")}
          />
        </AuthField>

        {/* Society code */}
        <AuthField
          label="Society code"
          error={errors.tenant_code?.message}
          hint="Your cooperative's short code, e.g. acada. Ask your admin if unsure."
          required
        >
          <NmInput
            icon={Building2}
            type="text"
            placeholder="e.g. acada"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            error={!!errors.tenant_code}
            {...register("tenant_code")}
          />
        </AuthField>

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{
            boxShadow:
              "0 1px 0 var(--nm-shadow-light), 0 -1px 0 var(--nm-shadow-dark)",
          }}
        />

        {/* Password */}
        <AuthField label="Password" error={errors.password?.message} required>
          <PasswordInput
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={!!errors.password}
            {...register("password")}
          />
          <PasswordStrength password={passwordValue} />
        </AuthField>

        {/* Confirm password */}
        <AuthField label="Confirm password" error={errors.password_confirm?.message} required>
          <PasswordInput
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={!!errors.password_confirm}
            {...register("password_confirm")}
          />
        </AuthField>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="nm-btn-primary w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white font-semibold text-sm py-3.5 hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Terms note */}
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          By creating an account you agree that your data will be managed by
          your cooperative society administrator.
        </p>
      </form>
    </AuthCard>
  );
}