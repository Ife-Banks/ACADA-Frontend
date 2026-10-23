"use client";

/**
 * RollingLink — a nav link whose label rolls over on hover.
 *
 * The visible label slides up and out of view while an identical copy slides
 * in from below, so the word appears to be running on a wheel. The underline
 * grows from the left in step with it.
 *
 * Only the ghost copy is hidden from assistive technology, so the link still
 * announces a single, sensible name.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { RollLabel } from "./RollLabel";

export interface RollingLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  active?: boolean;
  "aria-current"?: "page" | undefined;
  onClick?: () => void;
}

export function RollingLink({
  href,
  children,
  className = "",
  active = false,
  ...rest
}: RollingLinkProps) {
  return (
    <Link
      href={href}
      className={`roll-link roll-link--underline${className ? ` ${className}` : ""}`}
      data-active={active ? "true" : undefined}
      aria-current={rest["aria-current"]}
      onClick={rest.onClick}
    >
      <RollLabel>{children}</RollLabel>
    </Link>
  );
}

export default RollingLink;
