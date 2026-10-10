"use client";

import { LogOut, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SidebarUserFooter() {
  const { user, logout } = useAuth();

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="px-3 py-4 border-t border-white/10">
      <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-hover-bg transition-colors">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-brand-primary text-white text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {user?.full_name ?? "Loading…"}
          </p>
          <p className="text-sidebar-fg/60 text-xs truncate">
            {user?.email ?? ""}
          </p>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1 rounded text-sidebar-fg/60 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
