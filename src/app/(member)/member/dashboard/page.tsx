import type { Metadata } from "next";
import { MemberDashboard } from "@/components/app/dashboard/MemberDashboard";

export const metadata: Metadata = { title: "My Dashboard" };

export default function MemberDashboardPage() {
  return <MemberDashboard />;
}