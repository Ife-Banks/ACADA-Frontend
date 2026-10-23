"use client";

import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "./AdminSidebar";
import { ExecutiveSidebar } from "./ExecutiveSidebar";

/** Keep society administrators in their full president portal across both route groups. */
export function SocietyPortalSidebar() {
  const { isLoading, isSocietyAdmin } = useAuth();

  /* The role is read from a cookie on mount, so for the first frame it is
     not known yet. Rendering the executive sidebar for a society admin and
     then swapping it flashes the wrong navigation — so wait for it. */
  if (isLoading) {
    return <div className="portal-nav-column" aria-hidden="true" />;
  }

  return isSocietyAdmin ? <AdminSidebar /> : <ExecutiveSidebar />;
}
