"use client";

/**
 * MobileMenuButton — the only interactive piece on the landing page.
 * Isolated as a Client Component so the page stays a Server Component.
 */

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features",     href: "#features" },
  { label: "Roles",        href: "#roles" },
];

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          {/* Close button top-right */}
          <button
            className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          <nav
            className="flex flex-col gap-1 px-6 pt-24"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="py-3.5 text-lg font-medium text-foreground border-b border-border hover:text-brand-primary transition-colors"
              >
                {label}
              </a>
            ))}

            <div className="mt-8 flex flex-col gap-3">
              {/* Sign in — ghost */}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl border border-border text-foreground font-semibold py-3.5 text-sm hover:bg-muted transition-colors"
                style={{ boxShadow: "var(--nm-raised)" }}
              >
                Sign in
              </Link>
              {/* Get started — primary */}
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl bg-brand-primary text-white font-semibold py-3.5 text-sm hover:bg-brand-primary-hover transition-colors"
                style={{
                  boxShadow:
                    "4px 4px 10px rgba(15,23,42,0.25), -2px -2px 8px rgba(255,255,255,0.15)",
                }}
              >
                Get started free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
