import type { Metadata } from "next";
import { MembersExplorer } from "@/components/app/members/MembersExplorer";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Members" };

export default function MembersPage() {
  /* Member records are the society admin's. The route prefix already
     restricts this page; the gate is the second lock. */
  return (
    <RoleGate allow={["SOCIETY_ADMIN"]}>
      <MembersExplorer />
    </RoleGate>
  );
}
