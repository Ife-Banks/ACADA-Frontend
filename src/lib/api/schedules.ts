/**
 * Schedules API — generate, list, export.
 */

import { api, getAccessToken } from "./client";
import type {
  ScheduleBatch,
  ScheduleBatchDetail,
  GenerateSchedulePayload,
  PaginatedResponse,
} from "@/lib/types";

export async function getSchedules() {
  return api.get<PaginatedResponse<ScheduleBatch>>("/schedules/");
}

export async function getSchedule(id: string) {
  return api.get<ScheduleBatchDetail>(`/schedules/${id}/`);
}

export async function generateSchedule(payload: GenerateSchedulePayload) {
  return api.post<ScheduleBatchDetail>("/schedules/generate/", payload);
}

/**
 * Trigger a CSV export download. Returns the blob URL.
 * The view streams the file directly, so we use a native fetch here.
 */
export async function exportScheduleCsv(id: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/schedules/${id}/export/csv/`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("CSV export failed.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `schedule_${id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Trigger an Excel export download.
 */
export async function exportScheduleExcel(id: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/schedules/${id}/export/excel/`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Excel export failed.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `schedule_${id}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
