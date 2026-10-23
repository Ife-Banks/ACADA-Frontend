"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Settings,
  LayoutDashboard,
  RefreshCw,
  FileText,
  CreditCard,
  BookOpen,
  Package,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RollLabel } from "@/components/motion/RollLabel";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { PortalMobileNav } from "./PortalMobileNav";

const NAV = [
  // Admin-specific
  { label: "Members",           href: "/admin/members",       icon: Users,          group: "Society Admin" },
  { label: "Loan Products",     href: "/admin/loan-products", icon: Package,        group: "Society Admin" },
  { label: "Contribution Plans", href: "/executive/plans",    icon: PiggyBank,      group: "Society Admin" },
  { label: "Settings",          href: "/admin/settings",      icon: Settings,       group: "Society Admin" },
  // Executive features also available
  { label: "Dashboard",         href: "/executive/dashboard", icon: LayoutDashboard, group: "Executive" },
  { label: "Cycles",            href: "/executive/cycles",    icon: RefreshCw,      group: "Executive" },
  { label: "Schedules",         href: "/executive/schedules", icon: FileText,       group: "Executive" },
  { label: "Loan Applications", href: "/executive/loans",     icon: CreditCard,     group: "Executive" },
  { label: "Financial Ledger",  href: "/executive/ledger",    icon: BookOpen,       group: "Executive" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const groups = [...new Set(NAV.map((n) => n.group))];

  return (
    <div className="portal-nav-column">
    <PortalMobileNav items={NAV.map(({ label, href, icon }) => ({ label, href, icon }))} subtitle="SOCIETY ADMIN" />
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar-bg text-sidebar-fg shrink-0">
      <SidebarBrand subtitle="PRESIDENT PORTAL" />

      <nav className="flex-1 px-3 py-4 space-y-4">
        {groups.map((group) => (
          <div key={group}>
            <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-fg/50">
              {group}
            </p>
            <div className="space-y-0.5">
              {NAV.filter((n) => n.group === group).map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "roll-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname.startsWith(href)
                      ? "bg-sidebar-active-bg text-sidebar-active-fg"
                      : "text-sidebar-fg hover:bg-sidebar-hover-bg"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <RollLabel>{label}</RollLabel>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <SidebarUserFooter />
    </aside>
    </div>
  );
}
