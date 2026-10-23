import { cn } from "@/lib/utils";
import { Reveal, type RevealVariant } from "@/components/motion/Reveal";

interface LandingSectionTitleProps {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  /** The entrance style for the whole block. */
  variant?: RevealVariant;
}

export function LandingSectionTitle({
  eyebrow,
  title,
  description,
  className,
  variant = "fade-up",
}: LandingSectionTitleProps) {
  return (
    <Reveal
      variant={variant}
      direction="center"
      once={false}
      className={cn("mx-auto max-w-2xl text-center", className)}
    >
      <p className="landing-section-eyebrow">{eyebrow}</p>
      <h2 className="landing-section-title">{title}</h2>
      <p className="landing-section-copy">{description}</p>
    </Reveal>
  );
}
