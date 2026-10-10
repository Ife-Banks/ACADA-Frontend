import type { Metadata } from "next";
import { MembersExplorer } from "@/components/app/members/MembersExplorer";

export const metadata: Metadata = { title: "Members" };

export default function MembersPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground mb-1">Members</h1>
        <p className="text-muted-foreground text-sm">
          Manage your cooperative&apos;s members — approvals, roles, and access.
        </p>
      </header>
      <MembersExplorer />
    </div>
  );
}