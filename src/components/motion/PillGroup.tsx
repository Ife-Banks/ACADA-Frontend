"use client";

/**
 * PillGroup — a row of filter chips with a morphing active pill.
 *
 * This is the `layoutId` effect: the active background is a single element
 * that slides and resizes from chip to chip, so the pill appears to be the
 * same object moving rather than one pill fading out and another in.
 *
 * The pill is measured from the active chip, so it works with any chip
 * width, and it is positioned with transforms only.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface PillOption {
  value: string;
  label: string;
}

export interface PillGroupProps {
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Accessible name for the group. */
  label?: string;
}

export function PillGroup({
  options,
  value,
  onChange,
  className = "",
  label = "Filter",
}: PillGroupProps) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const [position, setPosition] = useState({ left: 0, width: 0, ready: false });

  const measure = useCallback(() => {
    const group = groupRef.current;
    const pill = pillRef.current;
    if (!group || !pill) return;

    const active = group.querySelector<HTMLElement>('[data-pill-active="true"]');
    if (!active) {
      setPosition((current) => ({ ...current, ready: false }));
      return;
    }

    const groupRect = group.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    setPosition({
      left: activeRect.left - groupRect.left,
      width: activeRect.width,
      ready: true,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, value, options]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(group);

    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div
      ref={groupRef}
      className={`pill-group${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label}
    >
      <span
        ref={pillRef}
        className="pill-group-pill"
        aria-hidden="true"
        data-ready={position.ready ? "true" : "false"}
        style={
          {
            "--pill-left": `${position.left}px`,
            "--pill-width": `${position.width}px`,
          } as React.CSSProperties
        }
      />
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className="pill-group-chip"
            data-pill-active={active ? "true" : "false"}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default PillGroup;
