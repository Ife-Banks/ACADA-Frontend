"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  RefreshCw,
  FileText,
  CreditCard,
  BookOpen,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RollLabel } from "@/components/motion/RollLabel";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/lib/types";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { PortalMobileNav } from "./PortalMobileNav";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** The roles that may open this screen. */
  roles: UserRole[];
}

/** Any officer, including a read-only COMMITTEE_MEMBER. */
const OFFICER: UserRole[] = ["COMMITTEE_MEMBER", "EXECUTIVE", "SOCIETY_ADMIN"];
/** Roles that may act, not just read. */
const EXECUTIVE: UserRole[] = ["EXECUTIVE", "SOCIETY_ADMIN"];

const NAV: NavItem[] = [
  { label: "Dashboard",         href: "/executive/dashboard",  icon: LayoutDashboard, roles: OFFICER },
  { label: "Cycles",            href: "/executive/cycles",     icon: RefreshCw,      roles: OFFICER },
  // The ledger is read-only, so a COMMITTEE_MEMBER may open it. Schedules
  // are generated and exported, so only an EXECUTIVE sees them. Contribution
  // plans are society configuration, so only the society admin opens them.
  { label: "Financial Ledger",  href: "/executive/ledger",     icon: BookOpen,       roles: OFFICER },
  { label: "Loan Applications", href: "/executive/loans",      icon: CreditCard,     roles: OFFICER },
  { label: "Schedules",         href: "/executive/schedules",  icon: FileText,       roles: EXECUTIVE },
  { label: "Contribution Plans", href: "/executive/plans",     icon: PiggyBank,      roles: ["SOCIETY_ADMIN"] },
];

export function ExecutiveSidebar() {
  const pathname = usePathname();
  const { isLoading, hasRole } = useAuth();

  // While the session is being read from its cookie the role is not known
  // yet. Rendering the full list for a frame would flash links the user
  // cannot open, so the list waits instead.
  const nav = isLoading ? [] : NAV.filter((item) => hasRole(item.roles));

  return (
    <div className="portal-nav-column">
      <PortalMobileNav items={nav} subtitle="EXECUTIVE" />
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar-bg text-sidebar-fg shrink-0">
      <SidebarBrand />

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => (
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
      </nav>

      <SidebarUserFooter />
    </aside>
    </div>
  );
}
