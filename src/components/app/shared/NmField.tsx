"use client";

/**
 * NmField — neumorphic form field wrapper.
 *
 * Wraps a label, a flat input/select/textarea, and an
 * optional error message. Used by every form across all portals.
 *
 * Usage:
 *   <NmField label="Email" error={errors.email?.message}>
 *     <NmInput icon={Mail} type="email" {...register("email")} />
 *   </NmField>
 */

import React from "react";
import { cn } from "@/lib/utils";

/* ─── Field wrapper ────────────────────────────────────────────── */

interface NmFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function NmField({
  label,
  error,
  hint,
  required,
  className,
  children,
}: NmFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}

/* ─── Neumorphic text input ────────────────────────────────────── */

interface NmInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ElementType;
  rightSlot?: React.ReactNode;
  error?: boolean;
}

export const NmInput = React.forwardRef<HTMLInputElement, NmInputProps>(
  ({ icon: Icon, rightSlot, error, className, ...props }, ref) => (
    <div
      className={cn(
        "nm-field-control flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
        error && "nm-field-control-error",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
      <input
        ref={ref}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0 disabled:opacity-50"
        {...props}
      />
      {rightSlot}
    </div>
  )
);
NmInput.displayName = "NmInput";

/* ─── Neumorphic textarea ──────────────────────────────────────── */

interface NmTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const NmTextarea = React.forwardRef<
  HTMLTextAreaElement,
  NmTextareaProps
>(({ error, className, ...props }, ref) => (
  <div
    className={cn(
      "nm-field-control rounded-xl px-4 py-3 transition-all duration-200",
      error && "nm-field-control-error",
      className
    )}
  >
    <textarea
      ref={ref}
      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none disabled:opacity-50"
      rows={3}
      {...props}
    />
  </div>
));
NmTextarea.displayName = "NmTextarea";

/* ─── Neumorphic select ────────────────────────────────────────── */

interface NmSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ElementType;
  error?: boolean;
}

export const NmSelect = React.forwardRef<HTMLSelectElement, NmSelectProps>(
  ({ icon: Icon, error, className, children, ...props }, ref) => (
    <div
      className={cn(
        "nm-field-control flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
        error && "nm-field-control-error",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
      <select
        ref={ref}
        className="flex-1 bg-transparent text-sm text-foreground outline-none appearance-none cursor-pointer disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
    </div>
  )
);
NmSelect.displayName = "NmSelect";

/* ─── Error banner ─────────────────────────────────────────────── */

export function NmErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm text-destructive"
      style={{
        background: "var(--destructive-bg)",
        boxShadow:
          "inset 2px 2px 6px rgba(220,38,38,0.08), inset -2px -2px 6px rgba(255,255,255,0.6)",
      }}
    >
      <span className="shrink-0 mt-0.5">⚠</span>
      <span>{message}</span>
    </div>
  );
}

/* ─── Submit button ────────────────────────────────────────────── */

import { Loader2 } from "lucide-react";

interface NmSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "danger";
}

export function NmSubmitButton({
  loading,
  loadingText = "Saving…",
  variant = "primary",
  children,
  className,
  ...props
}: NmSubmitProps) {
  const bg =
    variant === "danger"
      ? "bg-destructive hover:bg-red-700"
      : "bg-brand-primary hover:bg-brand-primary-hover";

  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "nm-btn-primary w-full flex items-center justify-center gap-2 rounded-xl text-white font-semibold text-sm py-3.5 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
        bg,
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* ─── Divider ──────────────────────────────────────────────────── */

export function NmDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px w-full", className)}
      style={{
        boxShadow:
          "0 1px 0 var(--nm-shadow-light), 0 -1px 0 var(--nm-shadow-dark)",
      }}
    />
  );
}
