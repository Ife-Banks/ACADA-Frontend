"use client";

/**
 * NmInput — neumorphic text input with optional leading icon.
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
        "group/nminput flex items-center gap-3 rounded-xl px-4 py-3",
        "transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-primary/25",
        wrapperClassName
      )}
      style={{
        boxShadow: error
          ? "inset 3px 3px 8px rgba(220,38,38,0.12), inset -3px -3px 8px rgba(255,255,255,0.8)"
          : "inset 3px 3px 8px var(--nm-shadow-dark), inset -3px -3px 8px var(--nm-shadow-light)",
        background: "var(--nm-bg)",
      }}
    >
      {Icon && (
        <Icon className="w-4 h-4 text-muted-foreground group-focus-within/nminput:text-brand-primary shrink-0 transition-colors" />
      )}
      <input
        className={cn(
          "flex-1 bg-transparent text-sm text-foreground",
          "placeholder:text-muted-foreground/80 outline-none min-w-0",
          className
        )}
        {...props}
      />
      {rightSlot}
    </div>
  );
}