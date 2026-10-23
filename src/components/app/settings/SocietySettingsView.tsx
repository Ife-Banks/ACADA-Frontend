"use client";

/**
 * SocietySettingsView — the society-admin view of their own society.
 *
 * The backend lets a SOCIETY_ADMIN read and configure *their own* tenant
 * (branding, settings and versioned rules) even though the routes live under
 * /platform/. The forms are shared with the platform console — only the
 * lifecycle actions (activate / suspend / deactivate) stay platform-only.
 */

import { useState } from "react";
import { Building2, FileJson, Palette, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NmErrorBanner } from "@/components/app/shared/NmField";
import { TenantBrandingForm } from "@/components/app/platform/TenantBrandingForm";
import { TenantRulesPanel } from "@/components/app/platform/TenantRulesPanel";
import { TenantSettingsForm } from "@/components/app/platform/TenantSettingsForm";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenants";
import { ApiError } from "@/lib/api/client";

export function SocietySettingsView() {
  const { tenant } = useAuth();
  const [tab, setTab] = useState("branding");

  const tenantId = tenant?.id ?? "";
  const detail = useTenant(tenantId);

  if (!tenantId) {
    return (
      <div className="society-settings-empty text-center py-14 flex flex-col items-center gap-3">
        <div className="society-settings-empty-icon rounded-2xl w-14 h-14 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-semibold text-sm">No society attached</p>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
          Your account is not attached to a society, so there are no settings to
          manage. Sign in with a society administrator account, or ask the
          platform administrator to add your membership.
        </p>
      </div>
    );
  }

  if (detail.isError) {
    return (
      <div className="society-settings-empty text-center py-14 flex flex-col items-center gap-3">
        <p className="text-muted-foreground text-sm">
          {detail.error instanceof ApiError
            ? detail.error.messages[0]
            : "Could not load your society settings."}
        </p>
        <button
          type="button"
          onClick={() => detail.refetch()}
          className="text-sm font-semibold text-brand-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (detail.isLoading || !detail.data) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    );
  }

  const t = detail.data;

  return (
    <div className="society-settings-workspace flex flex-col gap-5">
      {/* Header */}
      <header className="society-settings-heading">
        <div>
          <p className="society-settings-eyebrow">President portal</p>
          <h1>Society settings</h1>
          <p>Manage the identity, financial calendar, and operating rules for your cooperative.</p>
        </div>
      </header>

      <div className="society-settings-identity">
        <span className="society-settings-identity-icon"><Building2 aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="society-settings-identity-label">Current society</p>
          <p className="society-settings-identity-name">{t.name}</p>
        </div>
        <span className="society-settings-code">Code <strong>{tenant?.code ?? "—"}</strong></span>
      </div>

      {!t.settings && (
        <NmErrorBanner message="This society has no settings record yet. Save one from the Settings tab to create it." />
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="society-settings-tabs">
        <TabsList variant="line" className="society-settings-tab-list">
          <TabsTrigger value="branding" className="society-settings-tab">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="settings" className="society-settings-tab">
            <SlidersHorizontal className="w-4 h-4" />
            Financial settings
          </TabsTrigger>
          <TabsTrigger value="rules" className="society-settings-tab">
            <FileJson className="w-4 h-4" />
            Business rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="society-settings-content">
          <div className="society-settings-panel">
            <TenantBrandingForm tenantId={t.id} branding={t.branding} />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="society-settings-content">
          <div className="society-settings-panel">
            <TenantSettingsForm tenantId={t.id} settings={t.settings} />
          </div>
        </TabsContent>

        <TabsContent value="rules" className="society-settings-content">
          <div className="society-settings-panel society-settings-rules">
            <TenantRulesPanel tenantId={t.id} />
          </div>
        </TabsContent>
      </Tabs>

      <p className="society-settings-footnote">
        <Building2 aria-hidden="true" />
        Rule sets apply to new contribution cycles and loan evaluations only.
      </p>
    </div>
  );
}
