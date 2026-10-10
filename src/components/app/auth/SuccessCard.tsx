"use client";

/**
 * SuccessCard — animated confirmation state shown after a successful
 * auth action (account created, password changed).
 *
 * Pop-in success badge, a "what happens next" inset checklist, and a
 * primary CTA. Mirrors the neumorphic language of the auth forms.
 */

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

interface SuccessCardProps {
  /** Icon shown inside the pop-in badge (defaults to CheckCircle2). */
  icon?: React.ElementType;
  /** Heading, e.g. "Account created, Ade!" */
  title: string;
  /** Supporting message under the heading. */
  message: React.ReactNode;
  /** Ordered checklist of what the user should expect next. */
  steps?: string[];
  /** Primary CTA label. Defaults to "Go to sign in". */
  ctaLabel?: string;
  /** When provided the CTA renders as a Link (defaults to /login). */
  ctaHref?: string;
  /** When provided the CTA renders as a button instead of a link. */
  onDone?: () => void;
}

export function SuccessCard({
  icon: Icon = CheckCircle2,
  title,
  message,
  steps = [],
  ctaLabel = "Go to sign in",
  ctaHref,
  onDone,
}: SuccessCardProps) {
  return (
    <div
      className="nm-raised-lg rounded-3xl p-8 flex flex-col items-center text-center gap-5"
      style={{ animation: "var(--animate-scale-in)" }}
    >
      <div
        className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center"
        style={{ animation: "var(--animate-pop-in)", animationDelay: "150ms", boxShadow: "0 0 0 6px rgba(22,163,74,0.08)" }}
      >
        <Icon className="w-8 h-8 text-success" />
      </div>

      <div style={{ animation: "var(--animate-fade-in)", animationDelay: "250ms" }}>
        <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
        <div className="text-sm text-muted-foreground leading-relaxed">{message}</div>
      </div>

      {steps.length > 0 && (
        <div className="nm-inset w-full rounded-2xl p-4 text-left flex flex-col gap-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-brand-primary text-[10px] font-bold">{i + 1}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      )}

      {onDone ? (
        <button
          onClick={onDone}
          className="nm-btn-primary w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white font-semibold text-sm py-3.5 hover:bg-brand-primary-hover transition-colors duration-200"
          style={{ animation: "var(--animate-fade-up)", animationDelay: "350ms" }}
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <Link
          href={ctaHref ?? "/login"}
          className="nm-btn-primary w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white font-semibold text-sm py-3.5 hover:bg-brand-primary-hover transition-colors duration-200"
          style={{ animation: "var(--animate-fade-up)", animationDelay: "350ms" }}
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      <p
        className="text-[11px] text-muted-foreground flex items-center gap-1.5"
        style={{ animation: "var(--animate-fade-in)", animationDelay: "450ms" }}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Your data is managed by your cooperative society.
      </p>
    </div>
  );
}