import type { Metadata } from "next";
import { CyclesExplorer } from "@/components/app/contributions/CyclesExplorer";

export const metadata: Metadata = { title: "Contribution Cycles" };

export default function CyclesPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-foreground mb-1">Contribution Cycles</h1>
      <p className="text-muted-foreground text-sm">
        Open, manage, and close monthly contribution cycles.
      </p>
      <CyclesExplorer />
    </div>
  );
}