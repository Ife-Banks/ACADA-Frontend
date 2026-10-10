/**
 * Reports API — executive dashboard summary + contribution chart data.
 */

import { api } from "./client";
import type {
  DashboardSummary,
  ContributionChartPoint,
  PlatformStats,
} from "@/lib/types";

export async function getDashboardSummary() {
  return api.get<DashboardSummary>("/reports/dashboard/summary/");
}

export async function getContributionsChart(year?: number) {
  return api.get<ContributionChartPoint[]>(
    "/reports/dashboard/contributions_chart/",
    year ? { year } : undefined
  );
}

/** Platform-level stats — SUPER_ADMIN only */
export async function getPlatformStats() {
  return api.get<PlatformStats>("/platform/stats/");
}
