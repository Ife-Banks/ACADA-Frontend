"use client";

/**
 * TiltCard — a card that tilts toward the pointer.
 *
 * Three things happen on hover:
 *   - the card rotates up to 8° toward the cursor
 *   - a glare follows the pointer across the surface
 *   - an accent border draws itself around the edge
 *
 * The rotation is transform-only, so it stays on the compositor.
 * Touch devices get a press scale instead of a tilt.
 */

import type { ElementType, ReactNode } from "react";
import { useTilt } from "./useTilt";

export interface TiltCardProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Maximum rotation in degrees. */
  max?: number;
  /** Label for the custom cursor when the pointer is over the card. */
  cursorLabel?: string;
  style?: React.CSSProperties;
}

export function TiltCard({
  children,
  as: Tag = "div",
  className = "",
  max,
  cursorLabel,
  style,
}: TiltCardProps) {
  const { ref, handlers } = useTilt<HTMLElement>(max);
  const Component = Tag as ElementType;

  return (
    <Component
      ref={ref}
      className={`tilt-card${className ? ` ${className}` : ""}`}
      style={style}
      data-cursor={cursorLabel}
      {...handlers}
    >
      <div className="tilt-surface">
        {children}
        <span className="tilt-glare" aria-hidden="true" />
      </div>
      <span className="tilt-border" aria-hidden="true" />
    </Component>
  );
}

export default TiltCard;
