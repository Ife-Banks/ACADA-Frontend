/**
 * reveal.config.ts — the single source of truth for ACADA's motion system.
 *
 * Every entrance style and every hover behaviour reads its numbers from here,
 * so the feel of the app can be retuned globally without touching a page.
 *
 *   - `variants`   the 15 entrance styles exposed by <Reveal>
 *   - `motion`     the per-variant from/to values
 *   - `hover`      tokens for the pointer-driven effects
 *   - `easing`     the shared curves
 *
 * The colour tokens live in CSS (`--motion-accent` and friends) so the same
 * component picks up the brass accent on the landing page and the blue accent
 * inside the portals.
 */

export const revealVariants = [
  "slide-left",
  "slide-right",
  "appear",
  "fade-up",
  "fade-down",
  "zoom-in",
  "zoom-settle",
  "clip-wipe",
  "blur-sharp",
  "flip-in",
  "tilt-rise",
  "cascade",
  "mask-text",
  "draw",
  "spotlight",
] as const;

export type RevealVariant = (typeof revealVariants)[number];

export const easing = {
  /** power3.out — entrances. Fast out of the gate, long settle. */
  entrance: "cubic-bezier(0.215, 0.61, 0.355, 1)",
  /** power2.inOut — scrubbed and looping effects. */
  scrub: "cubic-bezier(0.65, 0.05, 0.36, 1)",
  /** Soft curve for hover feedback. */
  hover: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
} as const;

export const revealConfig = {
  /** Trigger point: "top 85%" of the viewport. */
  start: 0.85,
  /** Entrance duration, seconds. */
  duration: 0.9,
  /** Horizontal travel, px. Reduced to 40px under 768px. */
  distance: 120,
  /** Stagger between siblings in a cascade, seconds. */
  stagger: 0.1,
  /** Longest stagger we ever apply. */
  maxStagger: 0.15,
  easing,
  variants: revealVariants,

  /**
   * The *from* state of each variant. The visible state is always identity.
   *
   *   x          horizontal direction as a multiplier of `distance`
   *   y          vertical offset in px
   *   scale      starting scale
   *   blur       starting blur in px
   *   rotateX    starting X rotation in degrees
   *   rotateZ    starting Z rotation in degrees
   *   brightness starting brightness (spotlight only)
   */
  motion: {
    "slide-left": { x: -1, y: 0, scale: 1, blur: 8, rotateX: 0, rotateZ: 0, brightness: 1 },
    "slide-right": { x: 1, y: 0, scale: 1, blur: 8, rotateX: 0, rotateZ: 0, brightness: 1 },
    appear: { x: 0, y: 0, scale: 1, blur: 0, rotateX: 0, rotateZ: 0, brightness: 1 },
    "fade-up": { x: 0, y: 40, scale: 1, blur: 4, rotateX: 0, rotateZ: 0, brightness: 1 },
    "fade-down": { x: 0, y: -40, scale: 1, blur: 4, rotateX: 0, rotateZ: 0, brightness: 1 },
    "zoom-in": { x: 0, y: 0, scale: 0.85, blur: 4, rotateX: 0, rotateZ: 0, brightness: 1 },
    "zoom-settle": { x: 0, y: 0, scale: 1.12, blur: 8, rotateX: 0, rotateZ: 0, brightness: 1 },
    "clip-wipe": { x: 0, y: 0, scale: 1, blur: 0, rotateX: 0, rotateZ: 0, brightness: 1 },
    "blur-sharp": { x: 0, y: 0, scale: 0.98, blur: 16, rotateX: 0, rotateZ: 0, brightness: 1 },
    "flip-in": { x: 0, y: 0, scale: 1, blur: 4, rotateX: 70, rotateZ: 0, brightness: 1 },
    "tilt-rise": { x: 0, y: 60, scale: 1, blur: 4, rotateX: 0, rotateZ: 4, brightness: 1 },
    cascade: { x: 0, y: 0, scale: 1, blur: 8, rotateX: 0, rotateZ: 0, brightness: 1 },
    "mask-text": { x: 0, y: 24, scale: 1, blur: 0, rotateX: 0, rotateZ: 0, brightness: 1 },
    draw: { x: 0, y: 0, scale: 1, blur: 0, rotateX: 0, rotateZ: 0, brightness: 1 },
    spotlight: { x: 0, y: 0, scale: 1, blur: 0, rotateX: 0, rotateZ: 0, brightness: 0.35 },
  } satisfies Record<
    RevealVariant,
    {
      x: number;
      y: number;
      scale: number;
      blur: number;
      rotateX: number;
      rotateZ: number;
      brightness: number;
    }
  >,

  /** Spotlight brightens as the element nears the viewport centre. */
  spotlight: {
    dim: 0.35,
    bright: 1,
    band: 0.55,
  },
} as const;

/** Pointer-driven hover tokens. */
export const hoverConfig = {
  /** Maximum pointer-driven rotation, degrees. */
  tiltMax: 8,
  /** How fast a card catches up with the pointer, seconds. */
  tiltEase: 0.18,

  /** Magnetic pull toward the cursor, as a fraction of the offset. */
  magneticPull: 0.28,
  /** Magnetic pull ceiling, px. */
  magneticMax: 14,

  /** Custom cursor disc size, px. */
  cursorSize: 72,
  /** Disc scale per context label. */
  cursorScale: {
    View: 1,
    Play: 1.15,
    Book: 1.05,
    Drag: 0.9,
    Open: 1,
  },

  /** Image zoom on hover. */
  imageZoom: 1.08,
  /** Card lift on hover, px. */
  cardLift: 8,
} as const;

export type CursorLabel = keyof typeof hoverConfig.cursorScale;
