"use client";

/**
 * MemberDashboard — personal landing page: savings hero, quick actions,
 * active-loan snapshot and recent notifications.
 */

import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Coins,
  CreditCard,
  Info,
  User,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMyBalance } from "@/hooks/useContributions";
import { useActiveLoans } from "@/hooks/useLoans";
import { useNotifications } from "@/hooks/useNotifications";
import { LoanStatusBadge } from "@/components/app/loans/LoanBadges";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/lib/types";

const money = (v: string) => `₦${Number(v).toLocaleString("en-NG")}`;

/* ─── Stat tile ─────────────────────────────────────────────────── */

function StatTile({
  label,
  value,
  hint,
  index,
}: {
  label: string;
  value: string;
  hint?: string;
  index: number;
}) {
  return (
    <div
      className="nm-raised bg-surface rounded-3xl p-5 flex flex-col gap-1"
      style={{ animation: `var(--animate-fade-up) ${150 + index * 60}ms both` }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xl font-bold text-foreground leading-tight">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

/* ─── Quick action ──────────────────────────────────────────────── */

function QuickAction({
  href,
  icon,
  label,
  index,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  index: number;
}) {
  const Icon = icon;
  return (
    <Link
      href={href}
      className="nm-raised rounded-2xl p-3.5 flex items-center gap-3 hover:bg-muted/50 transition-colors duration-200"
      style={{ animation: `var(--animate-fade-up) ${150 + index * 60}ms both` }}
    >
      <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-primary" />
      </div>
      <span className="text-sm font-semibold text-foreground flex-1">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}

/* ─── Notification row ──────────────────────────────────────────── */

const NOTIFY_ICON: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  info:    { icon: Info, color: "text-brand-primary" },
  warning: { icon: AlertTriangle, color: "text-warning" },
  success: { icon: CheckCircle2, color: "text-success" },
  error:   { icon: XCircle, color: "text-destructive" },
};

function NotificationRow({ n }: { n: Notification }) {
  const { icon: Icon, color } = NOTIFY_ICON[n.notification_type] ?? NOTIFY_ICON.info;
  return (
    <div className="flex items-start gap-3 py-2.5 rounded-xl px-1">
      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", color)} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm truncate", n.is_read ? "text-muted-foreground" : "text-foreground font-semibold")}>
          {n.title}
        </p>
        {n.message && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
            {n.message}
          </p>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
        {new Date(n.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
      </span>
    </div>
  );
}

/* ─── Dashboard ─────────────────────────────────────────────────── */

export function MemberDashboard() {
  const { data: me } = useCurrentUser();
  const { data: balance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useMyBalance();
  const { data: loansData, isLoading: loansLoading } = useActiveLoans(1, 3);
  const { notifications, isLoading: notificationsLoading } = useNotifications();

  const firstName = me?.full_name?.split(" ")[0] ?? "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeLoans = loansData?.results ?? [];
  const outstanding = activeLoans.reduce((s, l) => s + Number(l.outstanding_balance), 0);
  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          {greeting}{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Hero + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {balanceLoading ? (
            <Skeleton className="h-44 w-full rounded-3xl" />
          ) : balanceError ? (
            <div className="nm-raised-lg bg-surface rounded-3xl p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
              {balanceError instanceof ApiError
                ? balanceError.messages[0]
                : "Could not load your balance."}
              <button
                type="button"
                onClick={() => refetchBalance()}
                className="text-sm font-semibold text-brand-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div
              className="nm-raised-lg bg-surface rounded-3xl p-6 relative overflow-hidden"
              style={{ animation: "var(--animate-fade-up) 200ms both" }}
            >
              <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-primary to-brand-primary-dark" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Current balance
                  </p>
                  <p className="text-4xl font-bold text-foreground mt-1.5 tabular-nums">
                    {balance ? money(balance.current_balance) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Lifetime received:{" "}
                    <span className="font-semibold text-foreground">
                      {balance ? money(balance.total_received) : "—"}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="nm-chip text-xs font-semibold text-brand-primary px-3 py-1 rounded-full">
                    {balance?.total_cycles ?? 0} cycles
                  </span>
                  <span className="nm-chip text-xs font-semibold text-success px-3 py-1 rounded-full">
                    {balance?.confirmed_count ?? 0} confirmed
                  </span>
                  {balance && balance.missed_count > 0 && (
                    <span className="nm-chip text-xs font-semibold text-destructive px-3 py-1 rounded-full">
                      {balance.missed_count} missed
                    </span>
                  )}
                </div>
              </div>
              {balance && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">Savings progress</span>
                    <span className="text-muted-foreground">
                      {money(balance.total_received)} of {money(balance.total_due)} due
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-border/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-dark transition-all duration-500"
                      style={{
                        width: `${Number(balance.total_due) > 0 ? Math.min(100, (Number(balance.total_received) / Number(balance.total_due)) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Quick actions
          </p>
          <QuickAction href="/member/contributions" icon={Coins} label="My contributions" index={0} />
          <QuickAction href="/member/loans" icon={CreditCard} label="Loans & eligibility" index={1} />
          <QuickAction href="/member/notifications" icon={Bell} label="Notifications" index={2} />
          <QuickAction href="/member/profile" icon={User} label="My profile" index={3} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Current balance" value={balance ? money(balance.current_balance) : "—"} index={0} />
        <StatTile label="Total received" value={balance ? money(balance.total_received) : "—"} index={1} />
        <StatTile
          label="Confirmed entries"
          value={String(balance?.confirmed_count ?? 0)}
          hint={balance?.missed_count ? `${balance.missed_count} missed` : "No missed entries"}
          index={2}
        />
        <StatTile label="Total due" value={balance ? money(balance.total_due) : "—"} index={3} />
      </div>

      {/* Loan snapshot + notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="nm-raised-lg bg-surface rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-primary" />
              <p className="text-sm font-bold text-foreground">Active loans</p>
            </div>
            <Link
              href="/member/loans"
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {loansLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : activeLoans.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">No active loans.</p>
              <Link
                href="/member/loans"
                className="text-xs font-semibold text-brand-primary hover:underline"
              >
                Check eligibility and apply
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between nm-inset rounded-xl px-4 py-3 mb-3">
                <span className="text-xs text-muted-foreground">Total outstanding</span>
                <span className="text-base font-bold text-foreground tabular-nums">
                  {money(String(outstanding))}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {activeLoans.slice(0, 3).map((loan) => (
                  <Link
                    key={loan.id}
                    href="/member/loans"
                    className="nm-raised rounded-xl px-4 py-3 flex flex-wrap items-center gap-2 hover:bg-muted/50 transition-colors duration-200"
                  >
                    <span className="text-sm font-semibold text-foreground flex-1 min-w-0 truncate">
                      {money(loan.approved_amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {money(loan.outstanding_balance)} left
                    </span>
                    <LoanStatusBadge status={loan.status} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="nm-raised-lg bg-surface rounded-3xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-primary" />
              <p className="text-sm font-bold text-foreground">Recent activity</p>
            </div>
            {unread > 0 && (
              <span className="h-5 min-w-5 px-1.5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </div>
          <Link
            href="/member/notifications"
            className="text-xs font-semibold text-brand-primary hover:underline inline-block mb-2"
          >
            Go to notifications
          </Link>
          {notificationsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications yet.
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.slice(0, 4).map((n) => (
                <NotificationRow key={n.id} n={n} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}