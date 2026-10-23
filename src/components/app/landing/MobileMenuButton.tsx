"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { LANDING_NAV } from "./landingNav";

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="relative md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="landing-menu-toggle"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="landing-mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <nav
        id="landing-mobile-navigation"
        aria-label="Mobile navigation"
        className="landing-mobile-menu"
        hidden={!open}
      >
          {LANDING_NAV.map(({ label, href }) => (
            <a className="landing-mobile-link" href={href} key={href} onClick={closeMenu}>{label}</a>
          ))}
          <div className="landing-mobile-actions">
            <Link className="landing-mobile-signin" href="/login" onClick={closeMenu}>Sign in</Link>
            <Link className="landing-mobile-cta" href="/register" onClick={closeMenu}>Join your society <ArrowRight className="h-4 w-4" /></Link>
          </div>
      </nav>
    </div>
  );
}
