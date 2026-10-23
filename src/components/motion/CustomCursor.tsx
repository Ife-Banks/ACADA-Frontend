"use client";

/**
 * CustomCursor — a contextual cursor disc.
 *
 * The disc follows the pointer with a short lag and shows a label that comes
 * from the element under it (`data-cursor="View"` and friends). Only fine
 * pointers get it; touch devices keep the native behaviour entirely.
 *
 * The native cursor is only hidden on elements that opt in, so the rest of
 * the app stays conventional and nothing important is hidden behind hover.
 */

import { useEffect, useRef, useState } from "react";
import { hoverConfig } from "./reveal.config";

export function CustomCursor() {
  const discRef = useRef<HTMLDivElement | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = event.clientX;
      pointerY = event.clientY;

      const target = event.target as Element | null;
      const context = target?.closest?.("[data-cursor]") as HTMLElement | null;
      const nextLabel = context?.dataset.cursor ?? null;

      setLabel((current) => (current === nextLabel ? current : nextLabel));
      setVisible(true);

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const disc = discRef.current;
        if (!disc) return;
        disc.style.setProperty("--cx", `${pointerX}px`);
        disc.style.setProperty("--cy", `${pointerY}px`);
      });
    };

    const leave = () => setVisible(false);
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const scale = label
    ? (hoverConfig.cursorScale[label as keyof typeof hoverConfig.cursorScale] ?? 1)
    : 0;

  return (
    <div
      ref={discRef}
      className="motion-cursor"
      aria-hidden="true"
      data-visible={visible ? "true" : "false"}
      data-pressed={pressed ? "true" : "false"}
      style={
        {
          "--cursor-size": `${hoverConfig.cursorSize}px`,
          "--cursor-scale": String(scale),
        } as React.CSSProperties
      }
    >
      <span className="motion-cursor-label">{label}</span>
    </div>
  );
}

export default CustomCursor;
