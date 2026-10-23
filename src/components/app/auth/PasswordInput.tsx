"use client";

/**
 * PasswordInput — NmInput specialized for passwords.
 *
 * Bundles the show/hide toggle button so the right slot logic
 * lives in one place instead of being duplicated per form.
 */

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { NmInput } from "./NmInput";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Custom leading icon (defaults to Lock). */
  icon?: React.ElementType;
  /** True to render the destructive inset shadow. */
  error?: boolean;
  /** Placeholder text (defaults to bullets). */
  placeholder?: string;
  /** Extra classes applied to the visual field wrapper. */
  wrapperClassName?: string;
}

export function PasswordInput({
  icon = Lock,
  error,
  placeholder = "••••••••",
  wrapperClassName,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <NmInput
      icon={icon}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      error={error}
      wrapperClassName={wrapperClassName}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="auth-password-toggle shrink-0 transition-colors"
        >
          {visible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      }
      {...props}
    />
  );
}
