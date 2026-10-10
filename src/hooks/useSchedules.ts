"use client";

/**
 * useSchedules — React Query hooks for the schedules module.
 *
 * Summary batches change when new cycles are generated, so the list is
 * short-lived; a single batch detail keeps placeholder data while refreshing.
 */

import { useQuery } from "@tanstack/react-query";
import { getSchedules, getSchedule } from "@/lib/api/schedules";
import { qk } from "@/lib/query-keys";

const THIRTY_SEC = 30_000;
const SIXTY_SEC = 60_000;

export function useSchedules() {
  return useQuery({
    queryKey: qk.schedules.all,
    queryFn: getSchedules,
    staleTime: SIXTY_SEC,
    refetchOnWindowFocus: true,
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: qk.schedules.detail(id),
    queryFn: () => getSchedule(id),
    enabled: !!id,
    placeholderData: (prev) => prev,
    staleTime: THIRTY_SEC,
    refetchOnWindowFocus: true,
  });
}