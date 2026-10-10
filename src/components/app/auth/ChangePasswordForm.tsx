"use client";

/**
 * ChangePasswordForm — account security form for authenticated users.
 *
 * Fields: old_password, new_password, new_password_confirm. Matches the
 * neumorphic language of the other auth forms and flips to a SuccessCard
 * with a "Done" button after a successful change.
 *
 * Calls POST /api/v1/auth/password/change/.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Loader2, ShieldCheck, RefreshCw, ArrowRight } from "lucide-react";
import { changePassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";
import { PasswordInput } from "./PasswordInput";
import { PasswordStrength } from "./PasswordStrength";
import { SuccessCard } from "./SuccessCard";

/* ─── Validation schema ─────────────────────────────────────────── */

const schema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    new_password_confirm: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    message: "New passwords don't match",
    path: ["new_password_confirm"],
  })
  .refine((d) => d.new_password !== d.old_password, {
    message: "New password must be different from your current password",
    path: ["new_password"],
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

export function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const newPasswordValue = watch("new_password") ?? "";

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
        new_password_confirm: values.new_password_confirm,
      });
      setChanged(true);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.messages[0] ?? "Could not update your password."
          : "Could not update your password. Please try again."
      );
    }
  }

  /* Success state — "Done" returns to a fresh form */
  if (changed) {
    return (
      <SuccessCard
        icon={ShieldCheck}
        title="Password updated"
        message="Your new password is active. Use it the next time you sign in on any device."
        steps={[
          "Current sessions stay active until you sign out",
          "Use your new password on all your devices",
          "Forgot it later? Your society admin can help",
        ]}
        ctaLabel="Done"
        onDone={() => {
          reset({ old_password: "", new_password: "", new_password_confirm: "" });
          setChanged(false);
        }}
      />
    );
  }

  return (
    <AuthCard eyebrow="Security" title="Change password" delay={100}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {serverError && <ErrorBanner message={serverError} />}

        {/* Current password */}
        <AuthField label="Current password" error={errors.old_password?.message} required>
          <PasswordInput
            icon={KeyRound}
            placeholder="Enter your current password"
            autoComplete="current-password"
            error={!!errors.old_password}
            {...register("old_password")}
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

        {/* New password */}
        <AuthField label="New password" error={errors.new_password?.message} required>
          <PasswordInput
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={!!errors.new_password}
            {...register("new_password")}
          />
          <PasswordStrength password={newPasswordValue} />
        </AuthField>

        {/* Confirm new password */}
        <AuthField
          label="Confirm new password"
          error={errors.new_password_confirm?.message}
          required
        >
          <PasswordInput
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            error={!!errors.new_password_confirm}
            {...register("new_password_confirm")}
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
              Updating password…
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Update password
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          Changing your password doesn&apos;t sign you out of your current
          session.
        </p>
      </form>
    </AuthCard>
  );
}