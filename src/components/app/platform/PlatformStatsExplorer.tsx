"use client";

/**
 * PlatformStatsExplorer — cross-tenant KPIs for the platform super admin.
 *
 * GET /platform/stats/ + the five most recently onboarded tenants.
 */

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  PauseCircle,
  UserCheck,
  Users,
  Inbox,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NmErrorBanner } from "@/components/app/shared/NmField";
import { usePlatformStats } from "@/hooks/useReports";
import { useAllTenants } from "@/hooks/useTenants";
import { OnboardingBadge, TenantStatusBadge } from "./PlatformBadges";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  hint?: string;
  delay: number;
}) {
  return (
    <div
      className="platform-stat-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="platform-stat-icon">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{label}</p>
        {hint && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

export function PlatformStatsExplorer() {
  const stats = usePlatformStats();
  const recent = useAllTenants();

  const s = stats.data;

  /*
   * The tenants list is ordered by name, not creation date, so sort the full
   * list ourselves before taking the five newest.
   */
  const rows = useMemo(() => {
    return [...(recent.data ?? [])]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [recent.data]);

  return (
    <div className="platform-page">
      <div>
        <p className="platform-eyebrow">PLATFORM OVERVIEW</p>
        <h1 className="platform-title">
          Platform Statistics
        </h1>
        <p className="platform-description">
          Cross-tenant overview — total societies, users, and memberships.
        </p>
      </div>

      {stats.isError && (
        <NmErrorBanner message="Could not load platform statistics. Try again." />
      )}

      {stats.isLoading ? (
        <div className="platform-kpi-grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="platform-kpi-grid">
          <StatCard
            icon={Building2}
            label="Total societies"
            value={s?.total_tenants ?? "—"}
            hint="All tenants"
            delay={0}
          />
          <StatCard
            icon={CheckCircle2}
            label="Active societies"
            value={s?.active_tenants ?? "—"}
            hint="Operational"
            delay={60}
          />
          <StatCard
            icon={PauseCircle}
            label="Suspended"
            value={s?.suspended_tenants ?? "—"}
            hint="Access blocked"
            delay={120}
          />
          <StatCard
            icon={Users}
            label="Users"
            value={s?.total_users ?? "—"}
            hint="Across all societies"
            delay={180}
          />
          <StatCard
            icon={UserCheck}
            label="Active memberships"
            value={s?.total_memberships ?? "—"}
            hint="Approved members"
            delay={240}
          />
        </div>
      )}

      {/* Recent societies */}
      <div className="platform-panel overflow-hidden">
        <div className="platform-panel-heading">
          <div>
            <h2 className="platform-panel-title">
              Recently onboarded
            </h2>
            <p className="platform-panel-subtitle">
              The five newest societies on the platform.
            </p>
          </div>
          <Link
            href="/platform/tenants"
            className="platform-text-link inline-flex items-center gap-1 whitespace-nowrap"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="platform-table-wrap">
          {recent.isLoading ? (
            <div className="flex flex-col gap-3 pt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : recent.isError ? (
            <div className="pt-4">
              <NmErrorBanner message="Could not load recent societies." />
            </div>
          ) : rows.length === 0 ? (
            <div className="platform-empty-state">
              <div className="platform-empty-icon">
                <Inbox className="w-7 h-7" />
              </div>
              <p className="platform-empty-title">
                No societies onboarded yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[38%]">Society</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link
                        href={`/platform/tenants/${t.id}`}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-brand-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {t.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t.code}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <TenantStatusBadge status={t.status} />
                    </TableCell>
                    <TableCell>
                      <OnboardingBadge state={t.onboarding_state} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(t.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <p className="platform-footnote">
        Membership counts include only active memberships. Statistics refresh
        every minute and on window focus.
      </p>
    </div>
  );
}
