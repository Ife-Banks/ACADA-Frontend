import type { Metadata } from "next";
import { MemberDetailView } from "@/components/app/members/MemberDetailView";

export const metadata: Metadata = { title: "Member Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <MemberDetailView memberId={id} />
    </div>
  );
}