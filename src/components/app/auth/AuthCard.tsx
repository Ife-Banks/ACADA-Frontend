"use client";

/**
 * AuthCard — the shared, bordered surface used by auth forms.
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
      className={cn("auth-card auth-card-enter", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {(eyebrow ?? title) && (
        <header className="auth-card-header">
          {eyebrow && (
            <p className="auth-card-eyebrow"><span />{eyebrow}</p>
          )}
          {title && (
            <h2 className="auth-card-title">{title}</h2>
          )}
          {subtitle && (
            <p className="auth-card-subtitle">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </div>
  );
}
