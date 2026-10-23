"use client";

/**
 * useMagnetic — pulls an element toward the cursor.
 *
 * The offset is written to `--mag-x` / `--mag-y` so the movement stays on
 * the compositor (transform only) and the CSS owns the easing.
 *
 * Only mouse pointers trigger it. Touch devices get the `:active` press
 * scale instead, and reduced-motion users get nothing at all.
 */

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { hoverConfig } from "./reveal.config";

export interface MagneticHandlers<T extends HTMLElement> {
  onPointerMove: (event: ReactPointerEvent<T>) => void;
  onPointerLeave: () => void;
}

export function useMagnetic<T extends HTMLElement = HTMLElement>(
  strength: number = 1,
): { ref: React.RefObject<T | null>; handlers: MagneticHandlers<T> } {
  const ref = useRef<T | null>(null);
  const frame = useRef(0);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      const element = ref.current;
      if (!element) return;
      if (event.pointerType !== "mouse") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const pull = hoverConfig.magneticPull * strength;
        const x = Math.max(
          -hoverConfig.magneticMax,
          Math.min(hoverConfig.magneticMax, dx * pull),
        );
        const y = Math.max(
          -hoverConfig.magneticMax,
          Math.min(hoverConfig.magneticMax, dy * pull),
        );
        element.style.setProperty("--mag-x", `${x}px`);
        element.style.setProperty("--mag-y", `${y}px`);
      });
    },
    [strength],
  );

  const onPointerLeave = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    cancelAnimationFrame(frame.current);
    element.style.setProperty("--mag-x", "0px");
    element.style.setProperty("--mag-y", "0px");
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return { ref, handlers: { onPointerMove, onPointerLeave } };
}
