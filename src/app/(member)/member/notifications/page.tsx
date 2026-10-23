import type { Metadata } from "next";
import { NotificationsExplorer } from "@/components/app/notifications/NotificationsExplorer";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return <NotificationsExplorer />;
}
