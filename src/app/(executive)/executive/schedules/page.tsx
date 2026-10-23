import type { Metadata } from "next";
import { SchedulesExplorer } from "@/components/app/schedules/SchedulesExplorer";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Deduction Schedules" };

export default function SchedulesPage() {
  return (
    <RoleGate allow={["SOCIETY_ADMIN", "EXECUTIVE"]}>
      <SchedulesExplorer />
    </RoleGate>
  );
}