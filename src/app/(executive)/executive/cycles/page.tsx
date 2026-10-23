import type { Metadata } from "next";
import { CyclesExplorer } from "@/components/app/contributions/CyclesExplorer";

export const metadata: Metadata = { title: "Contribution Cycles" };

export default function CyclesPage() {
  return (
    <div className="executive-page executive-cycles-route">
      <header className="executive-page-heading">
        <div>
          <p className="executive-page-eyebrow">Contributions</p>
          <h1>Contribution cycles</h1>
          <p>Open, manage, and close monthly contribution cycles.</p>
        </div>
      </header>
      <CyclesExplorer />
    </div>
  );
}
