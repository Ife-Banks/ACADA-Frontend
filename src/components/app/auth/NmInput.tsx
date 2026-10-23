"use client";

/**
 * NmInput — shared auth text input with an optional leading icon.
 *
 * Standard across every form in the auth module (login, register,
 * password change). Conveys focus and error states through
 * inset shadows + a soft brand ring rather than borders.
 */

import { cn } from "@/lib/utils";

interface NmInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Leading icon (lucide component). Tints the brand color on focus. */
  icon?: React.ElementType;
  /** True to render the destructive inset shadow instead of the neutral one. */
  error?: boolean;
  /** Element rendered on the far right (e.g. a show-password toggle). */
  rightSlot?: React.ReactNode;
  /** Extra classes on the wrapper (the visual field). */
  wrapperClassName?: string;
}

export function NmInput({
  icon: Icon,
  error,
  rightSlot,
  className = "",
  wrapperClassName,
  ...props
}: NmInputProps) {
  return (
    <div
      className={cn(
        "auth-control-wrapper group/nminput flex items-center gap-3 rounded-xl px-4 py-3",
        error && "auth-control-error",
        wrapperClassName
      )}
    >
      {Icon && (
        <Icon className="auth-control-icon h-4 w-4 shrink-0 transition-colors" />
      )}
      <input
        className={cn(
          "auth-control-input min-w-0 flex-1 bg-transparent text-sm outline-none",
          className
        )}
        {...props}
      />
      {rightSlot}
    </div>
  );
}
