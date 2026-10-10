"use client";

/**
 * ProfileSummary — the authenticated user's identity + memberships,
 * hydrated from GET /auth/me/ via useCurrentUser and the session cookie.
 *
 * Renders two neumorphic cards: an identity card (avatar, name, role,
 * tenant, dates, memberships) and a session info card. The security /
 * password change surface lives beside it on the page.
 */

import { useMemo } from "react";
import {
  Mail,
  Phone,
  CalendarDays,
  Clock3,
  Building2,
  Layers,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/* ─── Helpers ───────────────────────────────────────────────────── */

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success",
  suspended: "bg-warning/10 text-warning",
  deactivated: "bg-destructive/10 text-destructive",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-brand-primary/8 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm text-foreground font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

/* ─── Card shell ────────────────────────────────────────────────── */

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("nm-raised-lg rounded-3xl p-6", className)}
      style={{ animation: "var(--animate-fade-up)", animationDelay: "100ms" }}
    >
      {children}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */

export function ProfileSummary() {
  const { user, role, tenant, isPlatformAdmin } = useAuth();
  const { data: me, isLoading } = useCurrentUser();

  const initials = useMemo(
    () =>
      (user?.full_name ?? "?")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [user?.full_name]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Identity card ── */}
      <Card className="lg:col-span-3 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 shrink-0">
            <AvatarFallback className="bg-brand-primary text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-foreground truncate">
              {user?.full_name ?? "—"}
            </h2>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <span className="nm-chip rounded-full px-3 py-1 text-[11px] font-bold text-brand-primary">
                {role ?? "No role"}
              </span>
              {tenant && (
                <span className="nm-chip rounded-full px-3 py-1 text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {tenant.code}
                </span>
              )}
              {me?.status && (
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-bold",
                    STATUS_STYLES[me.status] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {me.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detail rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Row icon={Mail} label="Email" value={user?.email ?? "—"} />
          <Row icon={Phone} label="Phone" value={me?.phone || "—"} />
          <Row icon={Layers} label="Account type" value={isPlatformAdmin ? "Platform administrator" : "Society member"} />
          <Row icon={CalendarDays} label="Member since" value={formatDate(me?.date_joined)} />
        </div>

        {/* Memberships */}
        {me && me.memberships.length > 0 && (
          <div className="nm-inset rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Cooperatives you belong to
            </p>
            <div className="flex flex-col gap-2">
              {me.memberships.map((m) => (
                <div
                  key={m.tenant_id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-white/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {m.tenant_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Code · {m.tenant_code}</p>
                  </div>
                  <span className="nm-chip rounded-full px-2.5 py-1 text-[10px] font-bold text-brand-primary shrink-0">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── Session info card ── */}
      <Card className="lg:col-span-2 flex flex-col gap-4" >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/8 flex items-center justify-center">
            <Clock3 className="w-4 h-4 text-brand-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Session details</h3>
            <p className="text-[11px] text-muted-foreground">Access · refresh · activity</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading session information…
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            <Row icon={CalendarDays} label="Last sign-in" value={formatDate(me?.last_login)} />
            <Row
              icon={Clock3}
              label="Access token"
              value={me?.last_login ? "Rotates every 30 minutes" : "—"}
            />
            <Row
              icon={ShieldCheck}
              label="Refresh token"
              value="Valid for 7 days · rotates on use"
            />
          </div>
        )}

        <div className="nm-inset rounded-2xl p-3.5 mt-auto">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Need a different society? Sign out and sign back in with that
            society&apos;s code — your account is shared across societies.
          </p>
        </div>
      </Card>
    </div>
  );
}