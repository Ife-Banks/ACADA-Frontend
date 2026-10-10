"use client";

/**
 * useNotifications — fetches unread notifications for the bell icon.
 *
 * Polls every 60 seconds so the count stays reasonably fresh without
 * hammering the API.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api/notifications";
import { useAuth } from "./useAuth";
import { qk } from "@/lib/query-keys";

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: qk.notifications.root,
    queryFn: () => getNotifications({ page_size: 20 }),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.notifications.root }),
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.notifications.root }),
  });

  const unreadCount = query.data?.results.filter((n) => !n.is_read).length ?? 0;

  return {
    notifications: query.data?.results ?? [],
    unreadCount,
    isLoading: query.isLoading,
    markRead: (id: string) => markRead.mutate(id),
    markAllRead: () => markAllRead.mutate(),
  };
}
