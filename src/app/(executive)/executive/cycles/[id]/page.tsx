import type { Metadata } from "next";
import { CycleDetailView } from "@/components/app/contributions/CycleDetailView";

export const metadata: Metadata = { title: "Cycle Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CycleDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-2">
      <CycleDetailView id={id} />
    </div>
  );
}