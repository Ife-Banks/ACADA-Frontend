"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { label: "Overview", href: "/platform/stats", icon: BarChart3 },
  { label: "Cooperative societies", href: "/platform/tenants", icon: Building2 },
];

function Brand() {
  return (
    <Link href="/platform/stats" className="platform-brand" aria-label="ACADA platform overview">
      <span className="platform-brand-mark">A</span>
      <span className="platform-brand-copy">
        <strong>ACADA</strong>
        <small>PLATFORM CONSOLE</small>
      </span>
    </Link>
  );
}

export function PlatformSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user?.full_name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "A";

  /* Close the mobile menu when the route changes. Adjusting the state
     during render is the React-recommended way to do this — an effect
     would cause a second, cascading render. */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  return (
    <>
      <aside className="platform-sidebar" aria-label="Platform navigation">
        <Brand />
        <p className="platform-nav-label">WORKSPACE</p>
        <nav className="platform-nav-list">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href === "/platform/stats"
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined}
                className={cn("platform-nav-link", active && "is-active")}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="platform-sidebar-spacer" />
        <div className="platform-user-card">
          <span className="platform-avatar">{initials}</span>
          <span className="platform-user-copy">
            <strong>{user?.full_name ?? "Platform admin"}</strong>
            <small>{user?.email ?? "Super administrator"}</small>
          </span>
          <button type="button" onClick={logout} className="platform-logout" aria-label="Sign out" title="Sign out">
            <LogOut aria-hidden="true" />
          </button>
        </div>
      </aside>

      <header className="platform-mobile-header">
        <Brand />
        <button type="button" className="platform-menu-toggle" aria-expanded={menuOpen}
          aria-controls="platform-mobile-menu" aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        {menuOpen && (
          <nav className="platform-mobile-menu" id="platform-mobile-menu" aria-label="Platform navigation">
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = href === "/platform/stats"
                ? pathname === href
                : pathname.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined}
                  className={cn("platform-nav-link", active && "is-active")}>
                  <Icon aria-hidden="true" /><span>{label}</span>
                </Link>
              );
            })}
            <button type="button" onClick={logout} className="platform-mobile-logout">
              <LogOut aria-hidden="true" /> Sign out
            </button>
          </nav>
        )}
      </header>
    </>
  );
}
