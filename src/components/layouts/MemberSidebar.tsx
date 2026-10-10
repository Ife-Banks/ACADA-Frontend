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
import { SidebarBrand } from "./SidebarBrand";
import { SidebarUserFooter } from "./SidebarUserFooter";

const NAV = [
  { label: "Dashboard",     href: "/member/dashboard",     icon: LayoutDashboard },
  { label: "Contributions", href: "/member/contributions", icon: PiggyBank },
  { label: "Loans",         href: "/member/loans",         icon: CreditCard },
  { label: "Notifications", href: "/member/notifications", icon: Bell },
  { label: "My Profile",    href: "/member/profile",       icon: UserCircle },
];

export function MemberSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar-bg text-sidebar-fg shrink-0">
      <SidebarBrand />

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-sidebar-active-bg text-sidebar-active-fg"
                : "text-sidebar-fg hover:bg-sidebar-hover-bg"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <SidebarUserFooter />
    </aside>
  );
}
