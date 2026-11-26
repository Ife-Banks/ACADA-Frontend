import type { Metadata } from "next";
import { ExitPageContent } from "./ExitPageContent";

export const metadata: Metadata = { title: "Exit Cooperative" };

export default function ExitPage() {
  return <ExitPageContent />;
}
