/**
 * Notification types.
 */

export type NotificationType = "info" | "warning" | "success" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  context_data: Record<string, unknown> | null;
  created_at: string;
}
