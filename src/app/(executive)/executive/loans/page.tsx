import type { Metadata } from "next";
import { LoanApplicationsExplorer } from "@/components/app/loans/LoanApplicationsExplorer";

export const metadata: Metadata = { title: "Loan Applications" };

export default function ExecutiveLoansPage() {
  return <LoanApplicationsExplorer />;
}