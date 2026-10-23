"use client";

/**
 * PlansExplorer — contribution-plan catalogue for EXECUTIVE+.
 *
 * The monthly cycle generator reads the active `is_default` plan, so a
 * society with no default plan produces zero entries. This screen makes that
 * configuration reachable and editable.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  PiggyBank,
  Plus,
  PowerOff,
  Star,
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
import { NmErrorBanner } from "@/components/app/shared/NmField";
import { useAllPlans } from "@/hooks/useContributions";
import { useAuth } from "@/hooks/useAuth";
import { getAllPlans, updatePlan } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import { localTodayIso } from "@/lib/utils";
import type { ContributionPlan } from "@/lib/types";
import { PlanDialog } from "./PlanDialog";

const money = (v: string | number) => `₦${Number(v).toLocaleString("en-NG")}`;

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-NG", {
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
      className="plans-stat-card flex flex-col gap-3"
      style={{ animation: "var(--animate-fade-up)", animationDelay: `${delay}ms` }}
    >
      <div className="plans-stat-icon">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="plans-stat-value">{value}</p>
        <p className="plans-stat-label">{label}</p>
        {hint && <p className="plans-stat-hint">{hint}</p>}
      </div>
    </div>
  );
}

export function PlansExplorer() {
  const { isExecutiveOrAbove } = useAuth();
  const queryClient = useQueryClient();
  const plans = useAllPlans();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ContributionPlan | null>(null);
  const [ending, setEnding] = useState<ContributionPlan | null>(null);

  const rows = useMemo(() => plans.data ?? [], [plans.data]);

  const activePlans = rows.filter((p) => p.is_active);
  // Cycles only consume a default plan that has no end date.
  const defaultPlan = rows.find(
    (p) => p.is_default && p.is_active && !p.effective_to
  );
  const hasDefault = !!defaultPlan;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qk.contributions.plans });
    queryClient.invalidateQueries({ queryKey: qk.contributions.root });
  };

  const makeDefault = useMutation({
    mutationFn: async (plan: ContributionPlan) => {
      const current = await getAllPlans();
      await Promise.all(
        current
          .filter((p) => p.id !== plan.id && p.is_default)
          .map((p) => updatePlan(p.id, { is_default: false }))
      );
      return updatePlan(plan.id, { is_default: true });
    },
    onSuccess: (plan) => {
      toast.success(`${plan.plan_name} is now the default plan.`);
      invalidate();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.messages[0] ?? "Could not update the default plan."
          : "Could not update the default plan."
      );
    },
  });

  const endPlan = useMutation({
    mutationFn: (plan: ContributionPlan) =>
      updatePlan(plan.id, {
        effective_to: localTodayIso(),
        // An ended plan can no longer generate cycles, so it must not remain
        // flagged as the default.
        ...(plan.is_default ? { is_default: false } : {}),
      }),
    onSuccess: () => {
      toast.success("Plan ended. It will no longer be used for new cycles.");
      setEnding(null);
      invalidate();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.messages[0] ?? "Could not end the plan."
          : "Could not end the plan."
      );
    },
  });

  return (
    <div className="plans-workspace flex flex-col gap-5">
      {/* Header */}
      <header className="plans-heading">
        <div>
          <p className="plans-eyebrow">Contribution setup</p>
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Contribution Plans
          </h1>
          <p className="text-muted-foreground text-sm">
            Set monthly contributions and the default plan used to generate cycle entries.
          </p>
        </div>
        {isExecutiveOrAbove && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="plans-add-button"
          >
            <Plus className="w-4 h-4" />
            New plan
          </button>
        )}
      </header>

      {/* Default-plan warning */}
      {!plans.isLoading && !plans.isError && !hasDefault && (
        <div
          className="plans-warning flex items-start gap-3"
          style={{ borderLeft: "4px solid var(--warning)" }}
        >
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              No active default plan
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              New contribution cycles will be created with zero entries. Create
              a plan and mark it as default before opening a cycle.
            </p>
            {isExecutiveOrAbove && (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="text-xs font-semibold text-brand-primary hover:underline mt-2"
              >
                Create a default plan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="plans-stats grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat
          icon={PiggyBank}
          label="Total plans"
          value={plans.isLoading ? "…" : rows.length}
          hint="All versions and tiers"
          delay={0}
        />
        <Stat
          icon={CheckCircle2}
          label="Active plans"
          value={plans.isLoading ? "…" : activePlans.length}
          hint="Currently in effect"
          delay={75}
        />
        <Stat
          icon={Star}
          label="Default plan"
          value={
            plans.isLoading
              ? "…"
              : defaultPlan
              ? money(defaultPlan.amount_fixed)
              : "None"
          }
          hint={defaultPlan?.plan_name ?? "Cycles need a default"}
          delay={150}
        />
      </div>

      {/* Table */}
      <div className="plans-panel overflow-hidden">
        <div className="px-4 pb-4 pt-4">
          {plans.isError && (
            <NmErrorBanner message="Could not load contribution plans. Check your connection and try again." />
          )}

          {plans.isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14 gap-3">
              <div className="plans-empty-icon flex items-center justify-center">
                <Inbox className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  No contribution plans yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                  Create a plan before opening a cycle so every active member
                  receives an entry.
                </p>
              </div>
            </div>
          ) : (
            <Table className="plans-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Plan</TableHead>
                  <TableHead className="text-right">Monthly amount</TableHead>
                  <TableHead>Extra</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Effective</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id} className="group">
                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {p.plan_name}
                        </p>
                        {p.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[32ch]">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground whitespace-nowrap tabular-nums">
                      {money(p.amount_fixed)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.allows_extra ? "Allowed" : "No"}
                    </TableCell>
                    <TableCell>
                      {p.is_default ? (
                        <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary">
                          <Star className="w-3 h-3" />
                          Default
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          p.is_active
                            ? "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold bg-success/10 text-success"
                            : "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold bg-muted text-muted-foreground"
                        }
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(p.effective_from)} →{" "}
                      {p.effective_to ? formatDate(p.effective_to) : "open"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isExecutiveOrAbove ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="plans-actions inline-flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:text-foreground"
                            aria-label={`Actions for ${p.plan_name}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditing(p)}>
                              <Pencil className="size-4" />
                              Edit plan
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={
                                p.is_default || !p.is_active || !!p.effective_to
                              }
                              onClick={() => makeDefault.mutate(p)}
                            >
                              <Star className="size-4" />
                              Make default
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={!p.is_active}
                              onClick={() => setEnding(p)}
                            >
                              <PowerOff className="size-4" />
                              End plan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="plans-footnote">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Cycle entries use the active default plan with no end date.{" "}
            <Link
              href="/executive/cycles"
              className="font-semibold text-brand-primary hover:underline"
            >
              Go to cycles
            </Link>
          </p>
        </div>
      </div>

      <PlanDialog
        open={createOpen || !!editing}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        plan={editing}
      />

      <NmDialog
        className="plans-dialog"
        open={!!ending}
        onClose={() => setEnding(null)}
        title="End contribution plan"
        description={
          ending
            ? `${ending.plan_name} will stop applying to new cycles.`
            : undefined
        }
        confirmLabel="End plan"
        variant="danger"
        loading={endPlan.isPending}
        onConfirm={() => ending && endPlan.mutate(ending)}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          The plan record and its history are kept. If this is the default plan,
          choose a new default before opening another cycle.
        </p>
      </NmDialog>
    </div>
  );
}
