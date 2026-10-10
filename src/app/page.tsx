/**
 * Landing page — fully static Server Component.
 *
 * Neumorphic design: nm-raised / nm-raised-lg cards with hover lift,
 * hero entrance animations via CSS @keyframes (no JS dependency),
 * floating orbs, shimmer icon backgrounds, step circles, role items.
 *
 * NO scroll-reveal / IntersectionObserver — all content is always visible.
 * Animation is purely additive enhancement on the hero section only.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  PiggyBank,
  CreditCard,
  FileSpreadsheet,
  ShieldCheck,
  Users,
  Bell,
  ChevronRight,
  Building2,
  CheckCircle2,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { MobileMenuButton } from "@/components/app/landing/MobileMenuButton";

export const metadata: Metadata = {
  title: "ACADA Cooperative — Contributions, Loans & Schedules",
  description:
    "Multi-tenant cooperative society management. Track contributions, process loans, and generate payroll deduction schedules — all in one platform.",
};

/* ─── Data ──────────────────────────────────────────────────────── */

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Open a monthly cycle",
    body: "The treasurer opens a contribution cycle and entries are automatically generated for every active member.",
  },
  {
    step: "02",
    title: "Export the deduction schedule",
    body: "Generate a CSV or Excel schedule and hand it to the bursary. No bank integration needed — money moves through payroll.",
  },
  {
    step: "03",
    title: "Confirm & close",
    body: "Once the bursary deducts, the treasurer confirms receipts. Ledgers update, penalties apply where missed, and the cycle closes.",
  },
];

const FEATURES = [
  { icon: PiggyBank,     title: "Contribution tracking",  body: "Full ledger per member — every credit, debit, and adjustment is immutably recorded." },
  { icon: CreditCard,    title: "Loan lifecycle",          body: "Eligibility checks, guarantor confirmations, rule-engine evaluation, auto-approval under threshold." },
  { icon: FileSpreadsheet, title: "Deduction schedules",   body: "Export bursary-ready CSV or Excel schedules that combine contributions and loan repayments." },
  { icon: ShieldCheck,   title: "Rule engine",             body: "Per-society rules with versioned rule sets. Each member sees exactly why they qualify or don't." },
  { icon: Users,         title: "Role-based access",       body: "Five roles from platform admin down to member. Every endpoint enforces access server-side." },
  { icon: BarChart3,     title: "Executive dashboard",     body: "KPIs at a glance — active members, total savings, active loans, pending applications." },
  { icon: Bell,          title: "In-app notifications",    body: "Loan decisions, guarantor requests, cycle confirmations — all surfaced as in-app alerts." },
  { icon: Building2,     title: "Multi-tenant",            body: "Each cooperative society is its own isolated tenant. One platform, many societies." },
];

const ROLES = [
  { role: "Member",                sees: "Own contributions, loans, notifications" },
  { role: "Committee Member",      sees: "Read-only financials and loans" },
  { role: "Executive / Treasurer", sees: "Cycles, schedules, loan approvals, ledger" },
  { role: "President (Admin)",     sees: "Everything above, plus members and settings" },
  { role: "Platform Admin",        sees: "Cross-tenant management and platform statistics" },
];

const STATS = [
  { value: "₦0",   label: "Gateway fees" },
  { value: "5",    label: "Roles built-in" },
  { value: "100%", label: "Bursary-driven" },
];

/* ─── Page ──────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ══ NAV ══════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 bg-nm-bg backdrop-blur-sm border-b border-border"
        style={{ boxShadow: "0 2px 12px rgba(200,208,218,0.6), 0 1px 3px rgba(200,208,218,0.4)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ boxShadow: "3px 3px 8px rgba(15,23,42,0.25), -2px -2px 6px rgba(255,255,255,0.5)" }}
            >
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-foreground text-sm">ACADA Cooperative</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {["How it works", "Features", "Roles"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-brand-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="nm-btn-primary inline-flex items-center justify-center rounded-xl bg-brand-primary text-white text-sm font-semibold px-4 py-2 hover:bg-brand-primary-hover transition-colors duration-200"
            >
              Get started
            </Link>
            <MobileMenuButton />
          </div>
        </div>
      </header>

      <main>

        {/* ══ HERO ═════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden nm-surface pt-20 pb-28">
          {/* Floating orbs */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[-60px] right-[-80px] w-[420px] h-[420px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(26,86,219,0.18) 0%, transparent 70%)",
              animation: "var(--animate-float)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-40px] left-[-60px] w-[360px] h-[360px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(126,58,242,0.15) 0%, transparent 70%)",
              animation: "var(--animate-float-slow)",
            }}
          />
          {/* Grid pattern */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-primary mb-8 nm-pressed"
              style={{ animation: "var(--animate-scale-in)" }}
            >
              <span
                className="w-2 h-2 rounded-full bg-brand-primary shrink-0"
                style={{ animation: "var(--animate-pulse-ring)" }}
              />
              Multi-tenant cooperative management
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6"
              style={{ animation: "var(--animate-fade-up)", animationDelay: "100ms" }}
            >
              Manage contributions,{" "}
              <span className="text-brand-primary" style={{ textShadow: "0 0 40px rgba(26,86,219,0.15)" }}>
                loans,
              </span>
              <br className="hidden sm:block" />
              {" "}and deduction schedules
            </h1>

            {/* Sub-copy */}
            <p
              className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed"
              style={{ animation: "var(--animate-fade-up)", animationDelay: "200ms" }}
            >
              Built for cooperative societies that run on salary deduction. The
              bursary handles the money — ACADA handles the records, schedules,
              and rules.
            </p>

            {/* CTA row */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
              style={{ animation: "var(--animate-fade-up)", animationDelay: "300ms" }}
            >
              <Link
                href="/register"
                className="nm-btn-primary inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white font-semibold px-7 py-3.5 hover:bg-brand-primary-hover transition-colors duration-200 text-sm"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="nm-btn-ghost inline-flex items-center justify-center gap-2 rounded-xl text-foreground font-medium px-7 py-3.5 text-sm border border-border"
              >
                Sign in
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>

            {/* Stat tiles */}
            <div
              className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto"
              style={{ animation: "var(--animate-fade-up)", animationDelay: "420ms" }}
            >
              {STATS.map(({ value, label }) => (
                <div key={label} className="nm-raised rounded-2xl px-4 py-5 text-center">
                  <p className="text-2xl font-bold text-brand-primary">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ═════════════════════════════════════════ */}
        <section id="how-it-works" className="nm-surface py-24 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary mb-3">
                The monthly cycle
              </p>
              <h2 className="text-3xl font-bold text-foreground mb-4">How it works</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                Money never moves through the app. The platform keeps the records,
                generates the paperwork, and enforces the rules.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line */}
              <div
                aria-hidden
                className="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-brand-primary/20 overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-brand-primary/60 to-brand-primary/20"
                  style={{ animation: "var(--animate-slide-right)" }}
                />
              </div>

              {HOW_IT_WORKS.map(({ step, title, body }) => (
                <div
                  key={step}
                  className="nm-raised-lg group relative flex flex-col items-center text-center p-8 rounded-2xl"
                >
                  <div className="nm-step-circle w-14 h-14 rounded-full flex items-center justify-center mb-6 z-10 transition-all duration-300">
                    <span className="text-brand-primary group-hover:text-white font-bold text-base transition-colors duration-300">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-3 text-base">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-0 bg-brand-primary rounded-full transition-all duration-500 group-hover:w-16" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FEATURES ═════════════════════════════════════════════ */}
        <section id="features" className="bg-background py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary mb-3">
                What&apos;s included
              </p>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Everything a cooperative needs
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                From contribution tracking to loan lifecycle management, every
                workflow is covered out of the box.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="nm-raised group rounded-2xl p-5"
                >
                  <div className="nm-icon-shimmer w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-brand-primary" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">{title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ROLES ════════════════════════════════════════════════ */}
        <section id="roles" className="nm-surface border-y border-border py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left — copy */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary mb-3">
                  Access control
                </p>
                <h2 className="text-3xl font-bold text-foreground mb-5">
                  The right view for every role
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                  Access is enforced server-side. Members only see their own data.
                  Executives see the full picture. Admins control everything.
                  Role gates aren&apos;t just UI — they&apos;re baked into every endpoint.
                </p>

                <div className="nm-inset rounded-2xl p-4 mb-8 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-foreground font-semibold">Server-enforced.</span>{" "}
                    Every endpoint checks the role claim inside the signed JWT.
                    No client-side gate can be bypassed.
                  </p>
                </div>

                <Link
                  href="/register"
                  className="nm-btn-primary inline-flex items-center gap-2 rounded-xl bg-brand-primary text-white text-sm font-semibold px-5 py-3 hover:bg-brand-primary-hover transition-colors duration-200"
                >
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Right — role list */}
              <div className="flex flex-col gap-3">
                {ROLES.map(({ role, sees }) => (
                  <div
                    key={role}
                    className="nm-role-item rounded-xl flex items-start gap-3.5 p-4"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{role}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sees}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA BANNER ═══════════════════════════════════════════ */}
        <section className="py-24 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div
              className="relative overflow-hidden rounded-3xl bg-brand-primary px-8 py-16 text-center"
              style={{
                boxShadow:
                  "0 20px 60px rgba(26,86,219,0.35), 0 8px 24px rgba(26,86,219,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              {/* Inner glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-30"
                style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.3) 0%, transparent 70%)" }}
              />
              {/* Accent orb */}
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-15"
                style={{
                  background: "radial-gradient(circle, rgba(126,58,242,0.8) 0%, transparent 70%)",
                  animation: "var(--animate-float-slow)",
                }}
              />

              <p className="relative text-blue-200 text-xs font-semibold uppercase tracking-widest mb-4">
                Get started today
              </p>
              <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Ready to run your cooperative?
              </h2>
              <p className="relative text-blue-100 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                Create your account, enter your society&apos;s code, and get your
                first contribution cycle running in minutes.
              </p>

              <Link
                href="/register"
                className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-primary font-bold text-sm px-7 py-3.5 hover:bg-blue-50 transition-colors duration-200"
                style={{
                  boxShadow:
                    "0 4px 16px rgba(15,23,42,0.2), 0 2px 6px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                Create your account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ══ FOOTER ═══════════════════════════════════════════════ */}
      <footer className="nm-surface border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center"
              style={{ boxShadow: "2px 2px 6px rgba(15,23,42,0.2), -1px -1px 4px rgba(255,255,255,0.5)" }}
            >
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="text-sm text-muted-foreground font-medium">ACADA Cooperative</span>
          </div>
          <p className="text-xs text-muted-foreground">
            A salary-deduction cooperative management platform.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "Sign in",  href: "/login" },
              { label: "Register", href: "/register" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
