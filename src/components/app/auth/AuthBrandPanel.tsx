import Link from "next/link";
import { ArrowDownToLine, CircleDollarSign, FileSpreadsheet, PiggyBank } from "lucide-react";

const BENEFITS = [
  {
    icon: PiggyBank,
    title: "Contribution records",
    body: "Keep expected and confirmed deductions easy to follow.",
  },
  {
    icon: CircleDollarSign,
    title: "Loan activity",
    body: "See applications, guarantors, decisions, and repayments together.",
  },
  {
    icon: FileSpreadsheet,
    title: "Payroll schedules",
    body: "Prepare a clear deduction file for your bursary team.",
  },
];

export function AuthBrandPanel() {
  return (
    <aside className="auth-brand-panel" aria-label="About ACADA Cooperative">
      <div className="auth-brand-decoration auth-brand-decoration-top" aria-hidden="true" />
      <div className="auth-brand-decoration auth-brand-decoration-bottom" aria-hidden="true" />
      <div className="auth-brand-grid" aria-hidden="true" />

      <Link href="/" className="auth-brand-lockup" aria-label="ACADA Cooperative home">
        <span className="auth-brand-mark">A</span>
        <span>ACADA <small>COOPERATIVE</small></span>
      </Link>

      <div className="auth-brand-content">
        <p className="auth-brand-eyebrow"><span /> Your cooperative, in clear view</p>
        <h2>Make the work behind every contribution easier.</h2>
        <p className="auth-brand-description">
          ACADA brings member records, loan activity, and payroll deductions into one organized workspace.
        </p>

        <div className="auth-benefit-list">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div className="auth-benefit" key={title}>
              <span className="auth-benefit-icon"><Icon className="h-[18px] w-[18px]" /></span>
              <span><strong>{title}</strong><small>{body}</small></span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-brand-footnote">
        <span className="auth-brand-footnote-icon"><ArrowDownToLine className="h-4 w-4" /></span>
        Built around the salary-deduction model
      </div>
    </aside>
  );
}
