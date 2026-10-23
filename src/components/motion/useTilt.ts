"use client";

/**
 * useTilt — 3D mouse-follow tilt for a card.
 *
 * Writes the rotation and the glare position to custom properties so the
 * browser only ever composites a transform:
 *
 *   --tilt-x   rotateY, degrees
 *   --tilt-y   rotateX, degrees
 *   --gx / --gy   glare centre, percentages
 *
 * Only mouse pointers trigger it. Touch devices fall back to the CSS
 * `:active` press, and reduced-motion users get a flat card.
 */

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { hoverConfig } from "./reveal.config";

export interface TiltHandlers<T extends HTMLElement> {
  onPointerMove: (event: ReactPointerEvent<T>) => void;
  onPointerEnter: (event: ReactPointerEvent<T>) => void;
  onPointerLeave: () => void;
}

export function useTilt<T extends HTMLElement = HTMLElement>(
  max: number = hoverConfig.tiltMax,
): { ref: React.RefObject<T | null>; handlers: TiltHandlers<T> } {
  const ref = useRef<T | null>(null);
  const frame = useRef(0);

  const write = useCallback(
    (event: ReactPointerEvent<T>) => {
      const element = ref.current;
      if (!element) return;
      if (event.pointerType !== "mouse") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        const rotateY = (px - 0.5) * max * 2;
        const rotateX = (0.5 - py) * max * 2;

        element.style.setProperty("--tilt-x", `${rotateY.toFixed(2)}deg`);
        element.style.setProperty("--tilt-y", `${rotateX.toFixed(2)}deg`);
        element.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        element.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      });
    },
    [max],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<T>) => write(event),
    [write],
  );

  const onPointerEnter = useCallback(
    (event: ReactPointerEvent<T>) => write(event),
    [write],
  );

  const onPointerLeave = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    cancelAnimationFrame(frame.current);
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--gx", "50%");
    element.style.setProperty("--gy", "50%");
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return { ref, handlers: { onPointerMove, onPointerEnter, onPointerLeave } };
}
