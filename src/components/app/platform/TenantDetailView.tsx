"use client";

/**
 * TenantDetailView — platform-admin workspace for one society.
 *
 * Tabs: overview, branding, settings, versioned rules. Status changes call
 * the activate/suspend/deactivate actions on /platform/tenants/{id}/.
 */

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Coins,
  FileJson,
  Mail,
  MapPin,
  PauseCircle,
  Phone,
  PlayCircle,
  PowerOff,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NmDialog } from "@/components/app/shared/NmDialog";
import { NmErrorBanner } from "@/components/app/shared/NmField";
import { useTenant } from "@/hooks/useTenants";
import {
  activateTenant,
  deactivateTenant,
  suspendTenant,
} from "@/lib/api/tenants";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { TenantStatus } from "@/lib/types";
import { OnboardingBadge, TenantStatusBadge } from "./PlatformBadges";
import { TenantBrandingForm } from "./TenantBrandingForm";
import { TenantSettingsForm } from "./TenantSettingsForm";
import { TenantRulesPanel } from "./TenantRulesPanel";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Info({
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
      <span className="w-9 h-9 rounded-xl nm-inset flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5 break-words">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export function TenantDetailView({ id }: { id: string }) {
  const [tab, setTab] = useState("overview");
  const [action, setAction] = useState<TenantStatus | null>(null);
  const queryClient = useQueryClient();
  const tenant = useTenant(id);

  const statusMutation = useMutation({
    mutationFn: (next: TenantStatus) => {
      if (next === "active") return activateTenant(id);
      if (next === "suspended") return suspendTenant(id);
      return deactivateTenant(id);
    },
    onSuccess: (res) => {
      toast.success(res.detail);
      setAction(null);
      queryClient.invalidateQueries({ queryKey: qk.tenants.root });
      queryClient.invalidateQueries({ queryKey: qk.tenants.detail(id) });
      queryClient.invalidateQueries({ queryKey: qk.reports.platformStats });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.messages[0] ?? "Could not update the society status."
          : "Could not update the society status."
      );
    },
  });

  if (tenant.isError) {
    return (
      <div className="nm-raised-lg bg-surface rounded-3xl p-5 text-center py-14 flex flex-col items-center gap-3">
        <p className="text-muted-foreground text-sm">
          {tenant.error instanceof ApiError
            ? tenant.error.messages[0]
            : "Could not load this society."}
        </p>
        <button
          type="button"
          onClick={() => tenant.refetch()}
          className="text-sm font-semibold text-brand-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (tenant.isLoading || !tenant.data) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    );
  }

  const t = tenant.data;

  const actionCopy = action
    ? {
        active: {
          title: "Activate society",
          body: `${t.name} will regain access to the platform.`,
          label: "Activate",
          variant: "primary" as const,
        },
        suspended: {
          title: "Suspend society",
          body: `${t.name} will be blocked from signing in until reactivated.`,
          label: "Suspend",
          variant: "danger" as const,
        },
        deactivated: {
          title: "Deactivate society",
          body: `${t.name} will be marked inactive. Intended for offboarded societies.`,
          label: "Deactivate",
          variant: "danger" as const,
        },
      }[action]
    : null;

  return (
    <div className="platform-page">
      <Link
        href="/platform/tenants"
        className="platform-back-link"
      >
        <ArrowLeft className="w-4 h-4" />
        All societies
      </Link>

      {/* Header */}
      <div className="platform-tenant-hero">
        <div className="platform-tenant-hero-main">
          <div className="flex items-start gap-4 min-w-0">
            <div className="platform-tenant-avatar">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="platform-tenant-title">
                  {t.name}
                </h1>
                <TenantStatusBadge status={t.status} />
                <OnboardingBadge state={t.onboarding_state} />
              </div>
              <p className="platform-tenant-meta">
                {t.code}
                {t.institution_name ? ` · ${t.institution_name}` : ""}
              </p>
              {t.description && (
                <p className="platform-tenant-summary">
                  {t.description}
                </p>
              )}
            </div>
          </div>

          <div className="platform-tenant-actions">
            {t.status !== "active" && (
              <button
                type="button"
                onClick={() => setAction("active")}
                className="platform-action-button is-positive"
              >
                <PlayCircle className="w-4 h-4" />
                Activate
              </button>
            )}
            {t.status === "active" && (
              <button
                type="button"
                onClick={() => setAction("suspended")}
                className="platform-action-button is-warning"
              >
                <PauseCircle className="w-4 h-4" />
                Suspend
              </button>
            )}
            {t.status !== "deactivated" && (
              <button
                type="button"
                onClick={() => setAction("deactivated")}
                className="platform-action-button is-danger"
              >
                <PowerOff className="w-4 h-4" />
                Deactivate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="platform-tenant-tabs">
        <TabsList variant="line" className="platform-tabs-list">
          <TabsTrigger value="overview" className="platform-tab-trigger">
            Overview
          </TabsTrigger>
          <TabsTrigger value="branding" className="platform-tab-trigger">
            Branding
          </TabsTrigger>
          <TabsTrigger value="settings" className="platform-tab-trigger">
            Settings
          </TabsTrigger>
          <TabsTrigger value="rules" className="platform-tab-trigger">
            Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="platform-panel platform-overview-panel">
            <div className="platform-detail-grid">
              <Info icon={Building2} label="Society code" value={t.code} />
              <Info
                icon={Building2}
                label="Institution"
                value={t.institution_name}
              />
              <Info icon={Mail} label="Contact email" value={t.primary_contact_email} />
              <Info icon={Phone} label="Contact phone" value={t.primary_contact_phone} />
              <Info
                icon={Coins}
                label="Currency"
                value={t.settings?.currency ?? "—"}
              />
              <Info
                icon={SlidersHorizontal}
                label="Financial year starts"
                value={
                  t.settings
                    ? new Date(
                        2000,
                        t.settings.financial_year_start_month - 1,
                        1
                      ).toLocaleString("en", { month: "long" })
                    : "—"
                }
              />
              <Info
                icon={ShieldCheck}
                label="Active rule version"
                value={
                  t.active_rule_set
                    ? `Version ${t.active_rule_set.version}`
                    : "No active rules"
                }
              />
              <Info
                icon={CalendarDays}
                label="Created"
                value={formatDate(t.created_at)}
              />
              <Info
                icon={CalendarDays}
                label="Last updated"
                value={formatDate(t.updated_at)}
              />
            </div>

            {t.address && (
              <div className="platform-address-panel">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                  Address
                </p>
                <p className="text-sm text-foreground leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  {t.address}
                </p>
              </div>
            )}

            {!t.settings && (
              <NmErrorBanner message="This society has no settings record yet. Add one from the Settings tab." />
            )}
          </div>
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <div className="platform-panel platform-detail-panel">
            <TenantBrandingForm tenantId={t.id} branding={t.branding} />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="platform-panel platform-detail-panel">
            <TenantSettingsForm tenantId={t.id} settings={t.settings} />
          </div>
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <div className="platform-panel platform-detail-panel">
            <TenantRulesPanel tenantId={t.id} />
          </div>
        </TabsContent>
      </Tabs>

      <p className="platform-footnote inline-flex items-center gap-1.5">
        <FileJson className="w-3.5 h-3.5" />
        Rule sets apply to new contribution cycles and loan evaluations only.
      </p>

      <NmDialog
        className="platform-dialog"
        open={!!action}
        onClose={() => setAction(null)}
        title={actionCopy?.title ?? "Update society"}
        description={actionCopy?.body}
        confirmLabel={actionCopy?.label}
        variant={actionCopy?.variant}
        loading={statusMutation.isPending}
        onConfirm={() => action && statusMutation.mutate(action)}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          This action is audited and takes effect immediately. You can reverse it
          at any time.
        </p>
      </NmDialog>
    </div>
  );
}
