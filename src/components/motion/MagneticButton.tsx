"use client";

/**
 * MagneticButton — the app's primary call-to-action.
 *
 * Combines four hover behaviours:
 *   - the button is pulled toward the cursor (mouse only)
 *   - a light sweep runs across the face
 *   - the trailing arrow slides out and back in
 *   - pressing scales it down
 *
 * Touch devices get the press scale and the sweep through `:active`, so the
 * affordance is never desktop-only.
 */

import Link from "next/link";
import { useCallback, type ReactNode } from "react";
import { useMagnetic } from "./useMagnetic";

export interface MagneticButtonProps {
  children: ReactNode;
  /** Renders an <a> when set, a <button> otherwise. */
  href?: string;
  /** Visual style. "primary" is the magnetic, sweeping one. */
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  /** Label for the custom cursor when the pointer is over the button. */
  cursorLabel?: string;
  /** How strongly the button follows the cursor, 0–1. */
  strength?: number;
  "aria-label"?: string;
}

export function MagneticButton({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  onClick,
  cursorLabel,
  strength = 1,
  ...rest
}: MagneticButtonProps) {
  const { ref, handlers } = useMagnetic<HTMLElement>(strength);

  /* A callback ref keeps the element type loose, so the same hook can drive
     either the link or the button branch below. */
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      ref.current = node;
    },
    [ref],
  );

  const classes = [
    "motion-button",
    `motion-button-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const interactive = {
    ...handlers,
    className: classes,
    ...(cursorLabel ? { "data-cursor": cursorLabel } : {}),
  };

  if (href) {
    return (
      <Link
        href={href}
        {...interactive}
        ref={setRef}
        onClick={onClick}
        aria-label={rest["aria-label"]}
        data-disabled={disabled ? "" : undefined}
      >
        <span className="motion-button-label">{children}</span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      {...interactive}
      ref={setRef}
      disabled={disabled}
      onClick={onClick}
      aria-label={rest["aria-label"]}
    >
      <span className="motion-button-label">{children}</span>
    </button>
  );
}

export default MagneticButton;
