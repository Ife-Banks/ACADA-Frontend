import type { Metadata } from "next";
import { LoanProductsExplorer } from "@/components/app/loans/LoanProductsExplorer";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Loan Products" };

export default function LoanProductsPage() {
  /* Loan products are society configuration — the society admin's. The
     route prefix already restricts this page; the gate is the second lock. */
  return (
    <RoleGate allow={["SOCIETY_ADMIN"]}>
      <LoanProductsExplorer />
    </RoleGate>
  );
}
