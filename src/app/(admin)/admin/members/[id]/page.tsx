import type { Metadata } from "next";
import { MemberDetailView } from "@/components/app/members/MemberDetailView";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Member Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;

  /* Member records are the society admin's. The route prefix already
     restricts this page; the gate is the second lock. */
  return (
    <RoleGate allow={["SOCIETY_ADMIN"]}>
      <div className="flex flex-col gap-6">
        <MemberDetailView memberId={id} />
      </div>
    </RoleGate>
  );
}
