"use client";

/**
 * Reveal — ACADA's single entrance-animation system.
 *
 * Every scroll reveal on every page is driven by this component, and every
 * variant's numbers live in `components/motion/reveal.config.ts`. Nothing
 * else in the app should hand-roll an IntersectionObserver or a fade-in.
 *
 *   <Reveal variant="slide-left" distance={120} duration={0.9} once>
 *     …
 *   </Reveal>
 *
 * `useReveal()` is exported for components that need the raw in-view state.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { revealConfig, type RevealVariant } from "./reveal.config";

export type { RevealVariant } from "./reveal.config";

export type RevealDirection = "left" | "right" | "center" | "auto";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Heuristic for a low-end device: few cores and little memory. The heavy
 * variants (3D flip, spotlight) are downgraded to a simple fade-up so the
 * page still feels alive without melting the frame rate.
 */
function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 && memory <= 4;
}

const LOW_END_FALLBACK: Partial<Record<RevealVariant, RevealVariant>> = {
  "flip-in": "zoom-in",
  spotlight: "fade-up",
  "zoom-settle": "zoom-in",
  "blur-sharp": "appear",
};

/* The device check is a browser-only value, so it is read through
   useSyncExternalStore: the server snapshot is "not low end", and the
   client corrects it on the first client render without a hydration
   mismatch and without a setState-in-effect. */
const subscribeToNothing = () => () => {};
const getLowEndSnapshot = () => isLowEndDevice();
const getServerSnapshot = () => false;

/* ── Hook ─────────────────────────────────────────────────────────────────── */

export interface UseRevealOptions {
  /** Play once and stop observing. Use for long lists and grids. */
  once?: boolean;
  /** Trigger point as a fraction of viewport height, 0–1. Default 0.85. */
  start?: number;
  /** Add a light scroll-linked vertical drift to the child image. */
  parallax?: boolean;
  /** The variant, so variant-specific behaviour can be enabled. */
  variant?: RevealVariant;
}

export function useReveal({
  once = false,
  start = revealConfig.start,
  parallax = false,
  variant,
}: UseRevealOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [fullyInView, setFullyInView] = useState(false);
  const [order, setOrder] = useState(0);
  const [resolvedDirection, setResolvedDirection] = useState<
    Exclude<RevealDirection, "auto">
  >("left");

  /* Reveal trigger ------------------------------------------------------- */
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (once && entry.isIntersecting) observer.unobserve(element);
      },
      {
        threshold: 0,
        rootMargin: `0px 0px -${Math.round((1 - start) * 100)}% 0px`,
      },
    );
    observer.observe(element);

    /* Videos only play once the whole frame is on screen. */
    const videoObserver = element.querySelector("video")
      ? new IntersectionObserver(
          ([entry]) => {
            setFullyInView(
              entry.isIntersecting && entry.intersectionRatio >= 0.999
            );
          },
          { threshold: [0, 0.999] },
        )
      : null;
    videoObserver?.observe(element);

    /* Sibling order, so a grid can stagger itself. */
    const grid = element.closest<HTMLElement>("[data-reveal-grid]");
    const siblings = grid
      ? Array.from(grid.children).filter((child) =>
          child.hasAttribute("data-reveal-item"),
        )
      : Array.from(element.parentElement?.children ?? []).filter((child) =>
          child.hasAttribute("data-reveal-item"),
        );
    const index = Math.max(0, siblings.indexOf(element));
    setOrder(index);

    if (grid) {
      const columns = Math.max(
        1,
        getComputedStyle(grid).gridTemplateColumns.split(/\s+/).length,
      );
      const col = index % columns;
      /* Alternate left/right by column; a lone centre column enters head on. */
      setResolvedDirection(
        columns > 1 && columns % 2 === 1 && col === Math.floor(columns / 2)
          ? "center"
          : col % 2 === 0
          ? "left"
          : "right",
      );
    } else {
      setResolvedDirection(index % 2 === 0 ? "left" : "right");
    }

    return () => {
      observer.disconnect();
      videoObserver?.disconnect();
    };
  }, [once, start]);

  /* Video playback ------------------------------------------------------- */
  useEffect(() => {
    const videos = ref.current?.querySelectorAll("video");
    videos?.forEach((video) => {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = false;
      if (fullyInView) void video.play().catch(() => undefined);
      else video.pause();
    });
  }, [fullyInView]);

  /* Light parallax drift -------------------------------------------------- */
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const drift =
          (window.innerHeight / 2 - (rect.top + rect.height / 2)) * -0.035;
        element.style.setProperty(
          "--parallax-y",
          `${Math.max(-12, Math.min(12, drift))}px`,
        );
      });
    };

    if (
      parallax &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [parallax]);

  /* Spotlight ------------------------------------------------------------ */
  /* The element stays dim while it is away from the viewport centre and
     brightens as it arrives. */
  useEffect(() => {
    if (variant !== "spotlight") return;
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.style.setProperty("--reveal-brightness", "1");
      return;
    }

    let frame = 0;
    const { dim, bright, band } = revealConfig.spotlight;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const centre = rect.top + rect.height / 2;
        const distance = Math.abs(centre - window.innerHeight / 2);
        const reach = window.innerHeight * band;
        const t = clamp(1 - distance / reach, 0, 1);
        element.style.setProperty(
          "--reveal-brightness",
          String(dim + (bright - dim) * t),
        );
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [variant]);

  return { ref, inView, fullyInView, order, resolvedDirection };
}

/* ── Component ────────────────────────────────────────────────────────────── */

export interface RevealProps {
  children: ReactNode;
  /** The entrance style. See `reveal.config.ts`. */
  variant?: RevealVariant;
  /** Horizontal direction, or "auto" to alternate inside a grid. */
  direction?: RevealDirection;
  /** Delay in seconds. Overrides the automatic stagger. */
  delay?: number;
  /** Duration in seconds. */
  duration?: number;
  /** Travel distance in px. */
  distance?: number;
  /** Play once (long lists) or replay on every pass (hero, features). */
  once?: boolean;
  /** Trigger point as a fraction of viewport height. */
  start?: number;
  className?: string;
  /** Render as a different element. */
  as?: ElementType;
  /** Participate in the parent's cascade stagger. */
  gridItem?: boolean;
  /** Add a small entrance rotation. */
  tilt?: boolean;
  /** Add a scroll-linked drift to the child image. */
  parallax?: boolean;
  style?: CSSProperties;
}

export function Reveal({
  children,
  variant = "cascade",
  direction = "auto",
  delay,
  duration = revealConfig.duration,
  distance = revealConfig.distance,
  once = false,
  start = revealConfig.start,
  className = "",
  as: Tag = "div",
  gridItem = direction === "auto",
  tilt = false,
  parallax = false,
  style: customStyle,
}: RevealProps) {
  /* Heavy variants step down on low-end hardware. */
  const lowEnd = useSyncExternalStore(
    subscribeToNothing,
    getLowEndSnapshot,
    getServerSnapshot,
  );
  const effectiveVariant = lowEnd
    ? (LOW_END_FALLBACK[variant] ?? variant)
    : variant;

  const { ref, inView, order, resolvedDirection } = useReveal({
    once,
    start,
    parallax,
    variant: effectiveVariant,
  });

  const chosenDirection = direction === "auto" ? resolvedDirection : direction;
  const motion = revealConfig.motion[effectiveVariant];

  const cssVars = {
    "--reveal-distance": `${distance}px`,
    "--reveal-delay": `${delay ?? (gridItem ? order * revealConfig.stagger : 0)}s`,
    "--reveal-duration": `${duration}s`,
    "--reveal-direction": chosenDirection,
    "--reveal-rotation": tilt
      ? chosenDirection === "right"
        ? "4deg"
        : "-4deg"
      : "0deg",
    "--reveal-x": `${
      effectiveVariant === "cascade"
        ? chosenDirection === "left"
          ? -1
          : chosenDirection === "right"
          ? 1
          : 0
        : motion.x
    }`,
    "--reveal-y": `${
      effectiveVariant === "cascade" && chosenDirection === "center" ? 24 : motion.y
    }px`,
    "--reveal-scale": `${motion.scale}`,
    "--reveal-blur": `${motion.blur}px`,
    "--reveal-rotate-x": `${motion.rotateX}deg`,
    "--reveal-rotate-z": `${motion.rotateZ}deg`,
    "--reveal-brightness": `${motion.brightness}`,
  } as CSSProperties;

  const Component = Tag as ElementType;

  return (
    <Component
      ref={ref}
      className={`reveal${tilt ? " reveal-tilt" : ""}${
        parallax ? " reveal-parallax" : ""
      }${className ? ` ${className}` : ""}`}
      data-reveal-variant={effectiveVariant}
      data-reveal-direction={chosenDirection}
      data-reveal-item={gridItem ? "" : undefined}
      data-visible={inView ? "true" : "false"}
      style={{ ...cssVars, ...customStyle }}
    >
      {children}
    </Component>
  );
}

/* ── Mask text ────────────────────────────────────────────────────────────── */

export interface RevealTextProps {
  /**
   * The headline, split into parts. A part is either a plain string or a
   * `{ text, className }` pair, so a single word can carry its own styling
   * while still being masked word by word.
   */
  parts: Array<string | { text: string; className?: string }>;
  /** Render as a different element (h1, h2, span…). */
  as?: ElementType;
  className?: string;
  /** Delay before the first word, seconds. */
  delay?: number;
  /** Seconds between words. */
  wordDelay?: number;
  /** Duration of a single word, seconds. */
  duration?: number;
  once?: boolean;
  start?: number;
}

/**
 * RevealText — a headline that slides up word by word from behind an
 * overflow-hidden mask. Each word sits in its own clipping box, so the text
 * looks like it is being pulled up from underneath the line.
 */
export function RevealText({
  parts,
  as: Tag = "span",
  className = "",
  delay = 0,
  wordDelay = 0.06,
  duration = revealConfig.duration,
  once = true,
  start = revealConfig.start,
}: RevealTextProps) {
  const { ref, inView } = useReveal({ once, start });

  const words = useMemo(
    () =>
      parts.flatMap((part) => {
        const text = typeof part === "string" ? part : part.text;
        const className = typeof part === "string" ? undefined : part.className;
        return text
          .split(" ")
          .filter((word) => word.length > 0)
          .map((word) => ({ word, className }));
      }),
    [parts],
  );

  const Component = Tag as ElementType;

  return (
    <Component
      ref={ref}
      className={`reveal-text${className ? ` ${className}` : ""}`}
      data-visible={inView ? "true" : "false"}
      style={
        {
          "--reveal-duration": `${duration}s`,
          "--reveal-delay": `${delay}s`,
        } as CSSProperties
      }
    >
      {words.map(({ word, className: wordClass }, index) => (
        <span className="reveal-word" key={`${word}-${index}`}>
          <span
            className={`reveal-word-inner${wordClass ? ` ${wordClass}` : ""}`}
            style={
              {
                transitionDelay: `${delay + index * wordDelay}s`,
              } as CSSProperties
            }
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Component>
  );
}

export default Reveal;
