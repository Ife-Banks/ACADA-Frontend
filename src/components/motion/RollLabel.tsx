"use client";

/**
 * RollLabel — text that rolls over on hover.
 *
 * The visible label slides up and out of view while an identical copy
 * slides in from below. The link that contains it carries the `roll-link`
 * class, which is what triggers the movement.
 *
 * Only the ghost copy is hidden from assistive technology, so the link
 * still announces one sensible name.
 */

import type { ReactNode } from "react";

export function RollLabel({ children }: { children: ReactNode }) {
  return (
    <span className="roll-link-track">
      <span className="roll-link-label">{children}</span>
      <span className="roll-link-label roll-link-label--ghost" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

export default RollLabel;
