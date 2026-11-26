import type { Metadata } from "next";
import { MyShareholdings } from "@/components/app/contributions/MyShareholdings";
import { DividendEntitlementsPanel } from "@/components/app/contributions/DividendEntitlementsPanel";

export const metadata: Metadata = { title: "My Shares" };

export default function MySharesPage() {
  return (
    <div className="member-page member-shares-route">
      <header className="member-page-heading">
        <div>
          <p className="member-page-eyebrow">Investments</p>
          <h1>My shares</h1>
          <p>Your share subscriptions and dividend entitlements.</p>
        </div>
      </header>
      <div className="flex flex-col gap-8">
        <MyShareholdings />
        <DividendEntitlementsPanel />
      </div>
    </div>
  );
}
