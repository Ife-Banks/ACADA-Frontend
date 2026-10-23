"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PiggyBank,
  CreditCard,
  Bell,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RollLabel } from "@/components/motion/RollLabel";
import { useAuth } from "@/hooks/useAuth";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { PortalMobileNav } from "./PortalMobileNav";

const NAV = [
  { label: "Dashboard",     href: "/member/dashboard",     icon: LayoutDashboard },
  { label: "Contributions", href: "/member/contributions", icon: PiggyBank },
  { label: "Loans",         href: "/member/loans",         icon: CreditCard },
  { label: "Notifications", href: "/member/notifications", icon: Bell },
  { label: "My Profile",    href: "/member/profile",       icon: UserCircle },
];

export function MemberSidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  /* Every society role may open /member/* — it is where a member sees
     their own records — so the sidebar is shared. The subtitle names the
     role the person actually holds, rather than calling every one of them
     a member. */
  const subtitle = role ? role.replace(/_/g, " ") : "MEMBER";

  return (
    <div className="portal-nav-column">
      <PortalMobileNav items={NAV} subtitle={subtitle} />
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar-bg text-sidebar-fg shrink-0">
        <SidebarBrand />

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => (
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
