"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface PortalNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function PortalMobileNav({ items, subtitle }: { items: PortalNavItem[]; subtitle: string }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="portal-mobile-header">
      <div className="portal-mobile-topline">
        <Link href="/" className="portal-mobile-brand">
          <span className="portal-brand-mark">A</span>
          <span><strong>ACADA</strong><small>{subtitle}</small></span>
        </Link>
        <button
          type="button"
          className="portal-mobile-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="portal-mobile-menu" aria-label={`${subtitle} navigation`}>
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn("portal-mobile-link", pathname.startsWith(href) && "is-active")}
            >
              <Icon aria-hidden="true" />
              {label}
            </Link>
          ))}
          <button type="button" className="portal-mobile-logout" onClick={logout}>
            <LogOut aria-hidden="true" /> Sign out
          </button>
        </nav>
      )}
    </header>
  );
}
