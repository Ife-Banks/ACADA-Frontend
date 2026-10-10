"use client";

/**
 * AuthBrandPanel — the left brand side of the auth split-screen.
 *
 * Dark, animated gradient panel that orients the user before they sign in:
 * brand mark, value prop, a compact feature list drawn from the platform's
 * pitch, and a small stat strip. Hidden on small screens where the form is
 * the whole page.
 */

import Link from "next/link";
import { PiggyBank, CreditCard, FileSpreadsheet, BadgeCheck } from "lucide-react";

const FEATURES = [
  {
    icon: PiggyBank,
    title: "Salary-deducted savings",
    body: "Monthly contributions collected at payroll, not from you.",
  },
  {
    icon: CreditCard,
    title: "Loans that make sense",
    body: "Auto-approved under threshold, guaranteed by your peers.",
  },
  {
    icon: FileSpreadsheet,
    title: "Bursary-ready schedules",
    body: "Exportable deduction reports your payroll office understands.",
  },
];

const STATS = [
  { value: "100%", label: "transparent ledgers" },
  { value: "24h", label: "fast approvals" },
  { value: "1Δ", label: "single source of truth" },
];

export function AuthBrandPanel() {
  return (
    <aside
      aria-hidden
      className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 min-h-screen text-white"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1a3a8f 45%, #1a56db 80%, #7e3af2 130%)",
        backgroundSize: "180% 180%",
        animation: "var(--animate-gradient-shift)",
      }}
    >
      {/* Grid + glow overlays */}
      <div className="absolute inset-0 nm-grid-pattern" />
      <div
        className="pointer-events-none absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(126,58,242,0.35) 0%, transparent 65%)",
          animation: "var(--animate-float)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 -left-32 w-[26rem] h-[26rem] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(26,86,219,0.45) 0%, transparent 65%)",
          animation: "var(--animate-float-slow)",
        }}
      />

      {/* Brand row */}
      <div className="relative flex items-center gap-3.5">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="ACADA Cooperative home"
        >
          <div
            className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/15 transition-transform duration-300 group-hover:scale-105"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
          >
            <span className="font-bold text-xl">A</span>
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">ACADA Cooperative</p>
            <p className="text-white/60 text-[11px]">Society Management Platform</p>
          </div>
        </Link>
      </div>

      {/* Middle: headline + features */}
      <div className="relative my-10">
        <h2
          className="text-3xl leading-tight font-bold max-w-sm"
          style={{ animation: "var(--animate-fade-left)", animationDelay: "150ms" }}
        >
          Run your cooperative with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-secondary/70">
            transparency and trust.
          </span>
        </h2>
        <p
          className="text-white/70 text-sm mt-4 max-w-sm leading-relaxed"
          style={{ animation: "var(--animate-fade-left)", animationDelay: "260ms" }}
        >
          Contributions, loans, reports and deduction schedules — one
          clean system for the whole society, built for the salary
          source-deduction model.
        </p>

        <div className="flex flex-col gap-4 mt-9">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="flex items-start gap-3.5 group"
              style={{ animation: "var(--animate-fade-left)", animationDelay: `${360 + i * 110}ms` }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-white/15">
                <f.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: stat strip */}
      <div
        className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-7"
        style={{ animation: "var(--animate-fade-left)", animationDelay: "700ms" }}
      >
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="text-lg font-bold flex items-center gap-1">
              {s.value}
            </p>
            <p className="text-white/55 text-[11px] leading-snug mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Trust chip */}
      <div
        className="absolute bottom-10 right-10 inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur border border-white/10 px-3 py-1.5"
        style={{ animation: "var(--animate-fade-in)", animationDelay: "800ms" }}
      >
        <BadgeCheck className="w-3.5 h-3.5 text-brand-secondary" />
        <span className="text-[11px] text-white/80 font-medium">
          Trusted by cooperative societies across Nigeria
        </span>
      </div>
    </aside>
  );
}