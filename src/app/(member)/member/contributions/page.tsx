import type { Metadata } from "next";
import { MyContributionsExplorer } from "@/components/app/contributions/MyContributionsExplorer";

export const metadata: Metadata = { title: "My Contributions" };

export default function MyContributionsPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-foreground mb-1">My Contributions</h1>
      <p className="text-muted-foreground text-sm">
        Your balance, contribution plan, and full history.
      </p>
      <MyContributionsExplorer />
    </div>
  );
}