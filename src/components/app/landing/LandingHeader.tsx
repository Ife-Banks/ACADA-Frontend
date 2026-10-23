"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LandingBrand } from "./LandingBrand";
import { MobileMenuButton } from "./MobileMenuButton";
import { LANDING_NAV } from "./landingNav";
import { RollingLink } from "@/components/motion/RollingLink";
import { useMagnetic } from "@/components/motion/useMagnetic";

export function LandingHeader() {
  const { ref, handlers } = useMagnetic<HTMLAnchorElement>();

  return (
    <header className="landing-header">
      <div className="landing-container flex h-[76px] items-center justify-between gap-5">
        <LandingBrand />
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {LANDING_NAV.map(({ label, href }) => (
            <RollingLink key={href} href={href} className="landing-nav-link">
              {label}
            </RollingLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link className="landing-signin hidden md:inline-flex" href="/login">Sign in</Link>
          <Link
            ref={ref}
            className="landing-header-cta hidden md:inline-flex"
            href="/register"
            data-cursor="Join"
            {...handlers}
          >
            <span className="landing-button-label">Join your society <ArrowUpRight className="h-4 w-4" /></span>
          </Link>
          <MobileMenuButton />
        </div>
      </div>
    </header>
  );
}
