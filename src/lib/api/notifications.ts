/**
 * Notifications API — list, mark read, mark all read.
 */

import { api } from "./client";
import type { Notification, PaginatedResponse, PaginationParams } from "@/lib/types";

export async function getNotifications(params?: PaginationParams) {
  return api.get<PaginatedResponse<Notification>>("/notifications/", params);
}

export async function markNotificationRead(id: string) {
  return api.post<{ detail: string }>(`/notifications/${id}/read/`);
}

export async function markAllNotificationsRead() {
  return api.post<{ detail: string }>("/notifications/read-all/");
}
