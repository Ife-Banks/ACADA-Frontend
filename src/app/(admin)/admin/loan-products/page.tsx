import type { Metadata } from "next";
import { LoanProductsExplorer } from "@/components/app/loans/LoanProductsExplorer";

export const metadata: Metadata = { title: "Loan Products" };

export default function LoanProductsPage() {
  return <LoanProductsExplorer />;
}