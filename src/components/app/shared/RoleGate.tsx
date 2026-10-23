"use client";

/**
 * RoleGate — client-side guard for pages whose API is restricted to a
 * narrower role than the route group (e.g. schedules/ledger are EXECUTIVE+,
 * but COMMITTEE_MEMBER can enter /executive/*).
 *
 * The route prefix in `src/proxy.ts` is the first lock; this is the second.
 * The API is the real boundary — it re-checks every call.
 */

import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/lib/types";

interface Props {
  allow: UserRole[];
  children: React.ReactNode;
  /** Overrides the default explanation. */
  message?: string;
}

/** The heading that fits the roles being allowed. */
function headingFor(allow: UserRole[]): string {
  if (allow.length === 1 && allow[0] === "SOCIETY_ADMIN") {
    return "Society admin access required";
  }
  if (allow.length === 1 && allow[0] === "SUPER_ADMIN") {
    return "Platform admin access required";
  }
  return "Executive access required";
}

/** The explanation that fits the roles being allowed. */
function messageFor(allow: UserRole[]): string {
  if (allow.length === 1 && allow[0] === "SOCIETY_ADMIN") {
    return "Managing members, roles and society settings is reserved for the society admin.";
  }
  if (allow.length === 1 && allow[0] === "SUPER_ADMIN") {
    return "The platform console is reserved for platform administrators.";
  }
  return "Your role can review cycles and loan applications, but this screen is limited to executives and the society admin.";
}

export function RoleGate({ allow, children, message }: Props) {
  const { isLoading, session, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="nm-raised-lg rounded-3xl p-8">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  if (!session || !hasRole(allow)) {
    return (
      <div className="nm-raised-lg rounded-3xl p-8 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl nm-inset flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-warning" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">
            {headingFor(allow)}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm leading-relaxed">
            {message ?? messageFor(allow)}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
