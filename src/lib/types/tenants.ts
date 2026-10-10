/**
 * Tenant / platform admin types.
 */

export type TenantStatus = "active" | "suspended" | "deactivated";
export type OnboardingState = "pending" | "configuring" | "importing" | "active";

export interface TenantBranding {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  app_name_override: string;
}

export interface TenantSettings {
  currency: string;
  timezone: string;
  locale: string;
  financial_year_start_month: number;
  notification_policy: Record<string, unknown>;
}

export interface TenantRuleSet {
  id: string;
  version: number;
  active_from: string;
  active_to: string | null;
  rules: Record<string, unknown>;
  notes: string;
  is_active: boolean;
  created_at: string;
}

export interface TenantSummary {
  id: string;
  code: string;
  name: string;
  status: TenantStatus;
  onboarding_state: OnboardingState;
  institution_name: string;
  created_at: string;
}

export interface TenantDetail extends TenantSummary {
  description: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  address: string;
  branding: TenantBranding | null;
  settings: TenantSettings | null;
  active_rule_set: TenantRuleSet | null;
  updated_at: string;
}

export interface CreateTenantPayload {
  code: string;
  name: string;
  description?: string;
  primary_contact_email: string;
  primary_contact_phone?: string;
  institution_name?: string;
  address?: string;
}
