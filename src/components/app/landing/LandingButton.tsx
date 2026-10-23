"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMagnetic } from "@/components/motion/useMagnetic";

interface LandingButtonProps {
  href: string;
  variant: "primary" | "secondary" | "light";
  children: ReactNode;
  className?: string;
  /** Label for the custom cursor when the pointer is over the button. */
  cursorLabel?: string;
}

export function LandingButton({
  href,
  variant,
  children,
  className,
  cursorLabel,
}: LandingButtonProps) {
  const { ref, handlers } = useMagnetic<HTMLAnchorElement>();

  return (
    <Link
      href={href}
      ref={ref}
      className={cn("landing-button", `landing-button-${variant}`, className)}
      data-cursor={cursorLabel}
      {...handlers}
    >
      <span className="landing-button-label">{children}</span>
    </Link>
  );
}
