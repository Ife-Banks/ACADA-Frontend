import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  BellRing,
  Check,
  CircleDollarSign,
  FileSpreadsheet,
  Landmark,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { LandingButton } from "@/components/app/landing/LandingButton";
import { LandingBrand } from "@/components/app/landing/LandingBrand";
import { LandingHeader } from "@/components/app/landing/LandingHeader";
import { LandingSectionTitle } from "@/components/app/landing/LandingSectionTitle";
import { Reveal, RevealText } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

export const metadata: Metadata = {
  title: "ACADA Cooperative — A clearer way to run your cooperative",
  description:
    "Keep cooperative contributions, loan applications, and payroll deduction schedules organized in one place with ACADA.",
};

const WORKFLOW = [
  {
    number: "01",
    title: "Set up the monthly cycle",
    description:
      "Create a contribution cycle and prepare each member’s expected deduction in a few steps.",
    icon: PiggyBank,
  },
  {
    number: "02",
    title: "Prepare the schedule",
    description:
      "Bring contributions and loan repayments together in a clear file for your bursary team.",
    icon: FileSpreadsheet,
  },
  {
    number: "03",
    title: "Confirm what came in",
    description:
      "Record confirmed deductions, follow up on missed entries, and keep member ledgers current.",
    icon: Check,
  },
];

const FEATURES = [
  {
    title: "Every contribution accounted for",
    description:
      "Keep a reliable ledger of credits, deductions, and adjustments for each member.",
    icon: CircleDollarSign,
  },
  {
    title: "Loans with clear next steps",
    description:
      "Review eligibility, guarantor confirmations, and application decisions in one workflow.",
    icon: Landmark,
  },
  {
    title: "Schedules ready for payroll",
    description:
      "Prepare downloadable deduction schedules that bring monthly obligations together.",
    icon: ArrowDownToLine,
  },
  {
    title: "The right access for each role",
    description:
      "Give members, committee officers, executives, and administrators a view that fits their work.",
    icon: LockKeyhole,
  },
  {
    title: "Updates people can act on",
    description:
      "Surface loan decisions, guarantor requests, and cycle activity as in-app notifications.",
    icon: BellRing,
  },
  {
    title: "Separate spaces for each society",
    description:
      "Manage cooperative societies as distinct organizations on one platform.",
    icon: UsersRound,
  },
];

const ROLES = [
  ["Members", "Personal contributions, loans, and notifications"],
  ["Committee", "Read-only financial and loan information"],
  ["Executives", "Cycles, schedules, loan reviews, and ledgers"],
  ["Society admins", "Member records, society settings, and operations"],
  ["Platform admins", "Cross-society management and platform statistics"],
];

function ProductPreview() {
  return (
    <div className="landing-preview-wrap" role="group" aria-label="Illustrative ACADA dashboard preview">
      <div className="landing-preview-glow" aria-hidden="true" />
      <div className="landing-preview-card">
        <div className="flex items-center justify-between border-b border-landing-line px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="landing-mini-mark" aria-hidden="true">A</div>
            <div>
              <p className="text-sm font-semibold text-landing-ink">Good morning, Ada</p>
              <p className="mt-0.5 text-xs text-landing-muted">Your cooperative overview</p>
            </div>
          </div>
          <span className="landing-preview-status"><span /> Active</span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-landing-muted">Savings balance</p>
              <Reveal variant="blur-sharp" className="inline-block">
                <p className="mt-2 text-3xl font-semibold tracking-tight text-landing-ink sm:text-4xl">₦128,500</p>
              </Reveal>
              <p className="mt-2 text-xs text-landing-muted">Across your confirmed contributions</p>
            </div>
            <span className="landing-growth"><ArrowRight className="h-3.5 w-3.5 -rotate-45" /> 8.4%</span>
          </div>

          <div className="mt-7 rounded-2xl bg-landing-wash px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-landing-ink">Contribution activity</p>
                <p className="mt-1 text-[11px] text-landing-muted">January — June</p>
              </div>
              <span className="text-[11px] font-medium text-landing-muted">This year</span>
            </div>
            <div className="landing-chart" aria-hidden="true">
              {[38, 57, 46, 75, 62, 92].map((height, index) => (
                <div className="landing-chart-column" key={index}>
                  <span style={{ height: `${height}%` }} />
                  <small>{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-landing-line bg-white px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="landing-preview-icon"><FileSpreadsheet className="h-4 w-4" /></span>
              <div>
                <p className="text-xs font-semibold text-landing-ink">June deduction</p>
                <p className="mt-0.5 text-[11px] text-landing-muted">Confirmed · 24 June</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-landing-ink">₦15,000</span>
          </div>
        </div>
      </div>

      <div className="landing-preview-note">
        <span className="landing-note-icon"><Check className="h-4 w-4" /></span>
        <span><strong>Payroll-ready</strong><small>Schedules in a few clicks</small></span>
      </div>
      <p className="landing-preview-caption">Illustrative product preview</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-shell min-h-screen bg-landing-bg text-landing-ink">
      <LandingHeader />

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="landing-hero relative overflow-hidden">
          <div className="landing-hero-grid" aria-hidden="true" />
          <div className="landing-container relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1fr_0.94fr] lg:gap-10 lg:py-24 xl:py-28">
            <div className="relative z-10 max-w-2xl">
              <Reveal variant="fade-down" direction="center" once={false} delay={0.06}>
                <p className="landing-eyebrow">
                  Cooperative finances, made clearer
                </p>
              </Reveal>

              <h1 className="landing-hero-title">
                <RevealText
                  as="span"
                  parts={[
                    "Run your cooperative with",
                    { text: "confidence.", className: "landing-hero-accent" },
                  ]}
                  delay={0.13}
                  wordDelay={0.07}
                  once={false}
                />
              </h1>

              <Reveal variant="appear" direction="center" once={false} delay={0.21}>
                <p className="landing-hero-copy">
                  Keep contributions, loan activity, and payroll schedules organized in one place. Your team stays in control; every member can see their own records.
                </p>
              </Reveal>

              <Reveal variant="fade-up" direction="center" once={false} delay={0.29}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <LandingButton href="/register" variant="primary" cursorLabel="Join">Join your cooperative <ArrowRight className="h-4 w-4" /></LandingButton>
                  <LandingButton href="#workflow" variant="secondary" cursorLabel="View">See how it works</LandingButton>
                </div>
              </Reveal>

              <Reveal variant="zoom-in" direction="center" once={false} delay={0.38}>
                <div className="landing-hero-proof">
                  <div className="landing-proof-avatars" aria-hidden="true"><span>M</span><span>E</span><span>T</span></div>
                  <p><strong>Built for the way cooperatives work</strong><span>Member records · payroll deductions · clear approvals</span></p>
                </div>
              </Reveal>
            </div>

            <Reveal variant="zoom-settle" direction="right" once={false} delay={0.22} parallax className="lg:pl-2">
              <ProductPreview />
            </Reveal>
          </div>
          <div className="landing-hero-bottom" aria-hidden="true" />
        </section>

        {/* ── Workflow ─────────────────────────────────────────── */}
        <section id="workflow" className="landing-section bg-white">
          <div className="landing-container">
            <LandingSectionTitle
              eyebrow="A simple monthly rhythm"
              title="From deduction plan to a clear record"
              description="Keep the work your cooperative already does connected, from the monthly schedule through to each member’s ledger."
              variant="fade-up"
            />

            <Reveal variant="draw" className="landing-workflow-connector" aria-hidden="true">
              <svg viewBox="0 0 600 20" fill="none" preserveAspectRatio="none">
                <path pathLength="1" d="M0 10 H600" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-3 lg:mt-16" data-reveal-grid>
              {WORKFLOW.map(({ number, title, description, icon: Icon }) => (
                <Reveal
                  variant="cascade"
                  direction="auto"
                  once
                  key={number}
                  as="article"
                  className="landing-card-cell"
                >
                  <TiltCard className="landing-step-card" cursorLabel="View">
                    <div className="flex items-center justify-between">
                      <span className="landing-step-number">{number}</span>
                      <Reveal variant="flip-in" direction="center" once>
                        <span className="landing-step-icon"><Icon className="h-5 w-5" /></span>
                      </Reveal>
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section id="features" className="landing-section landing-features">
          <div className="landing-container">
            <LandingSectionTitle
              eyebrow="Everything in one place"
              title="Less chasing. More clarity."
              description="Give your team a shared view of the records and decisions that keep your cooperative moving."
              variant="slide-right"
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3" data-reveal-grid>
              {FEATURES.map(({ title, description, icon: Icon }) => (
                <Reveal
                  variant="tilt-rise"
                  direction="auto"
                  tilt
                  once
                  key={title}
                  as="article"
                  className="landing-card-cell"
                >
                  <TiltCard className="landing-feature-card h-full" cursorLabel="View">
                    <span className="landing-feature-icon"><Icon className="h-5 w-5" /></span>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Roles ────────────────────────────────────────────── */}
        <section id="roles" className="landing-section bg-white">
          <div className="landing-container grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            <Reveal variant="slide-left" direction="left" once={false}>
              <p className="landing-section-eyebrow">Clear roles. Shared trust.</p>
              <h2 className="landing-section-title text-left">Everyone sees what they need to do their part.</h2>
              <p className="landing-section-copy text-left">Members can follow their own finances. Officers can manage the work they are responsible for. Access is based on role and enforced by the platform.</p>
              <div className="landing-security-note"><ShieldCheck className="h-5 w-5 shrink-0" /><span>Member information stays within the right cooperative and role.</span></div>
              <LandingButton href="/register" variant="primary" className="mt-7" cursorLabel="Join">Get started <ArrowRight className="h-4 w-4" /></LandingButton>
            </Reveal>

            <Reveal variant="clip-wipe" direction="right" once={false}>
              <div className="landing-role-list">
                {ROLES.map(([role, access], index) => (
                  <Reveal
                    variant="spotlight"
                    direction="center"
                    once
                    key={role}
                    className="landing-role-row"
                  >
                    <span className="landing-role-index">0{index + 1}</span>
                    <strong>{role}</strong>
                    <span>{access}</span>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Call to action ───────────────────────────────────── */}
        <section className="landing-cta-section">
          <div className="landing-container">
            <Reveal variant="fade-up" direction="center" once>
              <div className="landing-cta-panel">
                <div className="landing-cta-orbit" aria-hidden="true" />
                <div className="relative z-10 max-w-2xl">
                  <p className="landing-cta-eyebrow">Bring your cooperative together</p>
                  <h2>Make every contribution easier to follow.</h2>
                  <p>Join your society on ACADA and keep your cooperative’s records moving with the people who rely on them.</p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <LandingButton href="/register" variant="light" cursorLabel="Join">Create your account <ArrowRight className="h-4 w-4" /></LandingButton>
                    <Link href="/login" className="landing-cta-signin">Already have an account? <span>Sign in</span></Link>
                  </div>
                </div>
                <div className="landing-cta-mark" aria-hidden="true"><PiggyBank className="h-24 w-24" strokeWidth={1} /></div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <Reveal variant="appear" direction="center" once>
          <div className="landing-container flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
            <LandingBrand footer />
            <p>Cooperative records, contributions, and schedules in one place.</p>
            <div className="flex items-center gap-5"><Link href="/login">Sign in</Link><Link href="/register">Create account</Link></div>
          </div>
        </Reveal>
      </footer>
    </div>
  );
}
