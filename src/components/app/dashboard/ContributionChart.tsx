"use client";

/**
 * ContributionChart — lightweight grouped bar chart (expected vs actual
 * monthly contributions) rendered with plain markup, no chart dependency.
 */

import { cn } from "@/lib/utils";
import type { ContributionChartPoint } from "@/lib/types";

const money = (v: string) => `₦${Number(v).toLocaleString("en-NG")}`;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface Props {
  data: ContributionChartPoint[];
  year: number;
}

export function ContributionChart({ data, year }: Props) {
  const points = [...data].sort((a, b) => a.month - b.month);

  const values = points.flatMap((p) => [Number(p.expected), Number(p.actual)]);
  const max = Math.max(1, ...values);

  const totalExpected = points.reduce((s, p) => s + Number(p.expected), 0);
  const totalActual = points.reduce((s, p) => s + Number(p.actual), 0);
  const avgRate = points.length
    ? Math.round(points.reduce((s, p) => s + p.collection_rate, 0) / points.length)
    : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Expected", value: money(String(totalExpected)) },
          { label: "Collected", value: money(String(totalActual)) },
          { label: "Collection rate", value: `${avgRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="nm-inset rounded-xl px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              {label}
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {points.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          No contribution data for {year}.
        </p>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-foreground">
              Monthly contributions · {year}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-border" />
                Expected
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-gradient-to-t from-brand-primary to-brand-primary-dark" />
                Collected
              </span>
            </div>
          </div>

          <div className="flex items-stretch gap-2">
            {points.map((p) => {
              const expected = Number(p.expected);
              const actual = Number(p.actual);
              const expectedH = Math.round((expected / max) * 100);
              const actualH = Math.round((actual / max) * 100);
              return (
                <div
                  key={p.month}
                  className="flex-1 min-w-0 flex flex-col items-center gap-2"
                  title={`${MONTHS[p.month - 1]} ${year} — expected ${money(p.expected)}, collected ${money(p.actual)} (${p.collection_rate}%)`}
                >
                  <div className="w-full h-36 flex items-end justify-center gap-1">
                    <div
                      className="w-[42%] max-w-5 rounded-t-md bg-border transition-all duration-500"
                      style={{ height: `${expectedH}%` }}
                    />
                    <div
                      className="w-[42%] max-w-5 rounded-t-md bg-gradient-to-t from-brand-primary to-brand-primary-dark transition-all duration-500"
                      style={{ height: `${actualH}%` }}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {MONTHS[p.month - 1]}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-bold",
                        p.collection_rate >= 100
                          ? "text-success"
                          : p.collection_rate >= 60
                          ? "text-warning"
                          : "text-destructive"
                      )}
                    >
                      {p.collection_rate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}