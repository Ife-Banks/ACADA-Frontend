import Link from "next/link";
import { cn } from "@/lib/utils";

export function LandingBrand({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(footer ? "landing-footer-brand" : "landing-brand")}
      aria-label="ACADA Cooperative home"
    >
      <span className="landing-logo-mark" aria-hidden="true">A</span>
      <span>ACADA <small>COOPERATIVE</small></span>
    </Link>
  );
}
