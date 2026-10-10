import type { Metadata } from "next";
import { MyLoansExplorer } from "@/components/app/loans/MyLoansExplorer";

export const metadata: Metadata = { title: "My Loans" };

export default function MyLoansPage() {
  return <MyLoansExplorer />;
}