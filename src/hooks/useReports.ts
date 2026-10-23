"use client";

/**
 * useReports — React Query hooks for reports / dashboards.
 *
 * The dashboard summary is operational (30 s, focus refetch); contribution
 * chart data is stable per year (5 min).
 */

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getContributionsChart,
  getPlatformStats,
} from "@/lib/api/reports";
import { qk } from "@/lib/query-keys";

const FIVE_MIN = 5 * 60_000;
const THIRTY_SEC = 30_000;
const SIXTY_SEC = 60_000;

export function useDashboardSummary() {
  return useQuery({
    queryKey: qk.reports.dashboardSummary,
    queryFn: getDashboardSummary,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useContributionsChart(year: number) {
  return useQuery({
    queryKey: qk.reports.contributionsChart(year),
    queryFn: () => getContributionsChart(year),
    staleTime: FIVE_MIN,
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: qk.reports.platformStats,
    queryFn: getPlatformStats,
    refetchInterval: SIXTY_SEC,
    staleTime: SIXTY_SEC,
    refetchOnWindowFocus: true,
  });
}