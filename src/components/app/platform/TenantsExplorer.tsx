"use client";

/**
 * TenantsExplorer — platform-admin list of every cooperative society.
 *
 * GET /platform/tenants/ (all pages) + status actions. The list endpoint
 * supports `search=`, but the screen still loads every society once so the
 * text/status filters and pagination run across the whole platform rather
 * than a single API page.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Plus,
  PowerOff,
  Search,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmInput,
  NmSelect,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { useAllTenants } from "@/hooks/useTenants";
import { usePlatformStats } from "@/hooks/useReports";
import {
  activateTenant,
  deactivateTenant,
  suspendTenant,
} from "@/lib/api/tenants";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { TenantStatus, TenantSummary } from "@/lib/types";
import { CreateTenantDialog } from "./CreateTenantDialog";
import { OnboardingBadge, TenantStatusBadge } from "./PlatformBadges";

const PAGE_SIZE = 25;

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Stat({
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

interface StatusAction {
  tenant: TenantSummary;
  next: TenantStatus;
}

export function TenantsExplorer() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TenantStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);

  const queryClient = useQueryClient();
  const list = useAllTenants();
  const stats = usePlatformStats();

  /*
   * Load every society once and paginate/filter locally. This keeps search
   * working across the whole platform rather than a single API page.
   */
  const rows = useMemo(() => list.data ?? [], [list.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (!term) return true;
      return (
        t.name.toLowerCase().includes(term) ||
        t.code.toLowerCase().includes(term) ||
        (t.institution_name ?? "").toLowerCase().includes(term)
      );
    });
  }, [rows, search, status]);

  const statusMutation = useMutation({
    mutationFn: ({ tenant, next }: StatusAction) => {
      if (next === "active") return activateTenant(tenant.id);
      if (next === "suspended") return suspendTenant(tenant.id);
      return deactivateTenant(tenant.id);
    },
    onSuccess: (res) => {
      toast.success(res.detail);
      queryClient.invalidateQueries({ queryKey: qk.tenants.root });
      queryClient.invalidateQueries({ queryKey: qk.reports.platformStats });
      setStatusAction(null);
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.messages[0] ?? "Could not update the society status."
          : "Could not update the society status."
      );
    },
  });

  const filteredTotal = filtered.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const from = filteredTotal === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filteredTotal);
  const hasFilters = search.trim().length > 0 || status !== "all";

  const actionCopy = statusAction
    ? {
        active: {
          title: "Activate society",
          body: `${statusAction.tenant.name} will regain access to the platform.`,
          label: "Activate",
          variant: "primary" as const,
        },
        suspended: {
          title: "Suspend society",
          body: `${statusAction.tenant.name} will be blocked from signing in until reactivated.`,
          label: "Suspend",
          variant: "danger" as const,
        },
        deactivated: {
          title: "Deactivate society",
          body: `${statusAction.tenant.name} will be marked inactive. This is intended for offboarded societies.`,
          label: "Deactivate",
          variant: "danger" as const,
        },
      }[statusAction.next]
    : null;

  return (
    <div className="platform-page">
      {/* Header */}
      <div className="platform-page-heading">
        <div>
          <p className="platform-eyebrow">TENANT MANAGEMENT</p>
          <h1 className="platform-title">
            Cooperative Societies
          </h1>
          <p className="platform-description">
            All tenants on the platform — create, activate, suspend, or deactivate.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="platform-primary-button"
        >
          <Plus className="w-4 h-4" />
          New society
        </button>
      </div>

      {/* Stats */}
      <div className="platform-tenant-kpis">
        <Stat
          icon={Building2}
          label="Total societies"
          value={list.isLoading ? "…" : rows.length}
          hint={`Showing ${from}–${to} of ${filteredTotal}`}
          delay={0}
        />
        <Stat
          icon={CheckCircle2}
          label="Active"
          value={stats.isLoading ? "…" : stats.data?.active_tenants ?? "—"}
          hint="Operational societies"
          delay={75}
        />
        <Stat
          icon={PauseCircle}
          label="Suspended"
          value={stats.isLoading ? "…" : stats.data?.suspended_tenants ?? "—"}
          hint="Access temporarily blocked"
          delay={150}
        />
        <Stat
          icon={PowerOff}
          label="Deactivated"
          value={
            stats.isLoading || stats.isError
              ? "…"
              : Math.max(
                  0,
                  (stats.data?.total_tenants ?? 0) -
                    (stats.data?.active_tenants ?? 0) -
                    (stats.data?.suspended_tenants ?? 0)
                )
          }
          hint="Offboarded societies"
          delay={225}
        />
      </div>

      {/* Table */}
      <div className="platform-panel overflow-hidden">
        <div className="platform-filter-bar">
          <div className="platform-filter-controls">
            <NmInput
              icon={Search}
              type="search"
              placeholder="Search by name, code, or institution…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="py-2.5"
            />
            <NmSelect
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as "all" | TenantStatus);
                setPage(1);
              }}
              className="py-2.5"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </NmSelect>
          </div>
        </div>

        <div className="platform-table-wrap">
          {list.isError && (
            <div className="pt-4">
              <NmErrorBanner message="Could not load societies. Check your connection and try again." />
            </div>
          )}

          {list.isLoading ? (
            <div className="flex flex-col gap-3 pt-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="platform-empty-state">
              <div className="platform-empty-icon">
                <Inbox className="w-8 h-8" />
              </div>
              <div>
                <p className="platform-empty-title">
                  {hasFilters ? "No societies match your filters." : "No societies yet."}
                </p>
                <p className="platform-empty-copy">
                  {hasFilters
                    ? "Try a different search term or status."
                    : "Create the first cooperative society to get started."}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[34%]">Society</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((t) => (
                  <TableRow key={t.id} className="group">
                    <TableCell>
                      <Link
                        href={`/platform/tenants/${t.id}`}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-brand-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {t.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t.code}
                            {t.institution_name ? ` · ${t.institution_name}` : ""}
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl nm-chip transition-colors hover:text-foreground"
                          aria-label={`Actions for ${t.name}`}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`/platform/tenants/${t.id}`} />}>
                            <ExternalLink className="size-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {t.status !== "active" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setStatusAction({ tenant: t, next: "active" })
                              }
                            >
                              <PlayCircle className="size-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {t.status !== "suspended" && t.status !== "deactivated" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setStatusAction({ tenant: t, next: "suspended" })
                              }
                            >
                              <PauseCircle className="size-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {t.status !== "deactivated" && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setStatusAction({ tenant: t, next: "deactivated" })
                              }
                            >
                              <PowerOff className="size-4" />
                              Deactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!list.isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{from}</span>–
              <span className="font-semibold text-foreground">{to}</span> of{" "}
              <span className="font-semibold text-foreground">{filteredTotal}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateTenantDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <NmDialog
        className="platform-dialog"
        open={!!statusAction}
        onClose={() => setStatusAction(null)}
        title={actionCopy?.title ?? "Update society"}
        description={actionCopy?.body}
        confirmLabel={actionCopy?.label}
        variant={actionCopy?.variant}
        loading={statusMutation.isPending}
        onConfirm={() => statusAction && statusMutation.mutate(statusAction)}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          This action is audited and takes effect immediately. You can change the
          status again at any time.
        </p>
      </NmDialog>
    </div>
  );
}
