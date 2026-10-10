import type { Metadata } from "next";
import { LoanApplicationDetailView } from "@/components/app/loans/LoanApplicationDetailView";

export const metadata: Metadata = { title: "Loan Application Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LoanApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  return <LoanApplicationDetailView applicationId={id} />;
}