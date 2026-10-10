import type { Metadata } from "next";
import { SchedulesExplorer } from "@/components/app/schedules/SchedulesExplorer";

export const metadata: Metadata = { title: "Deduction Schedules" };

export default function SchedulesPage() {
  return <SchedulesExplorer />;
}