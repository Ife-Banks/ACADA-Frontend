"use client";

/**
 * AuthCard — the standard neumorphic card used by every auth form.
 *
 * Raised surface with a staggered fade-up entrance animation. Optionally
 * renders an eyebrow badge, a title, and a subtitle header above the
 * children so all auth screens share the same visual rhythm.
 */

import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  /** Small uppercase tag above the title (e.g. "Member area"). */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Entrance delay in ms (default 100, matching the page header rhythm). */
  delay?: number;
  className?: string;
}

export function AuthCard({
  children,
  eyebrow,
  title,
  subtitle,
  delay = 100,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn("nm-raised-lg rounded-3xl p-6 sm:p-8", className)}
      style={{ animation: "var(--animate-fade-up)", animationDelay: `${delay}ms` }}
    >
      {(eyebrow ?? title) && (
        <header className="mb-6">
          {eyebrow && (
            <div
              className="inline-flex items-center gap-1.5 nm-chip rounded-full px-3 py-1 mb-3"
              style={{ animation: "var(--animate-fade-in)", animationDelay: "120ms" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary nm-live-dot" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                {eyebrow}
              </span>
            </div>
          )}
          {title && (
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </div>
  );
}