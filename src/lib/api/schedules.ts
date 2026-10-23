/**
 * Schedules API — generate, list, export.
 */

import { api, fetchWithAuth } from "./client";
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
  const res = await fetchWithAuth(`/schedules/${id}/export/csv/`);
  if (!res.ok) throw new Error("CSV export failed.");
  downloadBlob(await res.blob(), `schedule_${id}.csv`);
}

/**
 * Trigger an Excel export download.
 */
export async function exportScheduleExcel(id: string): Promise<void> {
  const res = await fetchWithAuth(`/schedules/${id}/export/excel/`);
  if (!res.ok) throw new Error("Excel export failed.");
  downloadBlob(await res.blob(), `schedule_${id}.xlsx`);
}

/**
 * Save a blob via a temporary anchor. The anchor must be in the document for
 * some browsers, and the object URL is revoked after the download starts.
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
