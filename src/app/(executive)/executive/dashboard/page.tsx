import type { Metadata } from "next";
import { ExecutiveDashboard } from "@/components/app/dashboard/ExecutiveDashboard";

export const metadata: Metadata = { title: "Executive Dashboard" };

export default function ExecutiveDashboardPage() {
  return <ExecutiveDashboard />;
}