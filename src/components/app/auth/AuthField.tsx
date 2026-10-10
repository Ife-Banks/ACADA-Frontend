"use client";

/**
 * AuthField — labeled field wrapper shared by all auth forms.
 *
 * Renders the uppercase label (with required marker), the control via
 * `children`, an optional hint, and an inline error message. Consistent
 * spacing and typography keep the module visually standard.
 */

interface AuthFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function AuthField({
  label,
  error,
  hint,
  required,
  children,
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
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
        <p className="text-xs text-destructive font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}