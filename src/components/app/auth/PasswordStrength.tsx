"use client";

/**
 * PasswordStrength — live strength indicator for registration and password
 * change forms.
 *
 * Shows a four-segment color bar plus individual requirement checks that
 * flip from muted to green as each criterion is satisfied. The "Weak /
 * Fair / Good / Strong" label is always visible so users can see
 * their progress at a glance.
 */

interface PasswordStrengthProps {
  password: string;
}

const CHECKS = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special char", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
] as const;

const BAR_COLORS = [
  "bg-destructive/70",
  "bg-warning",
  "bg-warning",
  "bg-success/70",
  "bg-success",
];

const LABELS = ["", "Weak", "Fair", "Good", "Strong"];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const results = CHECKS.map((c) => ({ ...c, pass: c.test(password) }));
  const score = results.filter((r) => r.pass).length;

  return (
    <div className="flex flex-col gap-2 mt-1">
      {/* Segmented bar */}
      <div className="flex gap-1" role="meter" aria-label="Password strength" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? BAR_COLORS[score] : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Checklist + label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-3 flex-wrap">
          {results.map(({ label, pass }) => (
            <span
              key={label}
              className={`text-[10px] font-medium transition-colors duration-200 ${
                pass ? "text-success" : "text-muted-foreground"
              }`}
            >
              {pass ? "✓" : "·"} {label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span
            className={`text-[10px] font-bold whitespace-nowrap ${
              score >= 3 ? "text-success" : "text-warning"
            }`}
          >
            {LABELS[score]}
          </span>
        )}
      </div>
    </div>
  );
}