/**
 * Reports / dashboard types.
 */

export interface DashboardSummary {
  membership: {
    active_members: number;
    pending_approvals: number;
  };
  financials: {
    total_savings: string;
    total_loans_disbursed: string;
  };
  loans: {
    active_loan_count: number;
    pending_applications: number;
  };
}

export interface ContributionChartPoint {
  month: number;
  expected: string;
  actual: string;
  collection_rate: number;
}

export interface PlatformStats {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  total_users: number;
  total_memberships: number;
}
