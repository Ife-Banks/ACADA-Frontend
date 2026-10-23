import type { Metadata } from "next";
import { ScheduleDetailView } from "@/components/app/schedules/ScheduleDetailView";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Schedule Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ScheduleDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <RoleGate allow={["SOCIETY_ADMIN", "EXECUTIVE"]}>
      <ScheduleDetailView scheduleId={id} />
    </RoleGate>
  );
}