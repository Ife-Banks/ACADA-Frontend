"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarUserFooter } from "./SidebarUserFooter";

const NAV = [
  { label: "Tenants", href: "/platform/tenants", icon: Building2 },
  { label: "Platform Stats", href: "/platform/stats", icon: BarChart3 },
];

export function PlatformSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar-bg text-sidebar-fg shrink-0">
      <SidebarBrand subtitle="Platform Admin" />

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
