import type { Metadata } from "next";
import { MyContributionsExplorer } from "@/components/app/contributions/MyContributionsExplorer";

export const metadata: Metadata = { title: "My Contributions" };

export default function MyContributionsPage() {
  return (
    <div className="member-page member-contributions-route">
      <header className="member-page-heading">
        <div>
          <p className="member-page-eyebrow">Savings</p>
          <h1>My contributions</h1>
          <p>Your balance, contribution plan, and full history.</p>
        </div>
      </header>
      <MyContributionsExplorer />
    </div>
  );
}
