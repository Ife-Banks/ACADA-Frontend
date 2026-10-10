"use client";

/**
 * LoanProductsExplorer — society-admin catalogue of loan products:
 * rates, terms, guarantor requirements and auto-approval thresholds.
 */

import { useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NmInput } from "@/components/app/shared/NmField";
import { useLoanProducts } from "@/hooks/useLoans";
import { CreateLoanProductDialog } from "./CreateLoanProductDialog";
import { ApiError } from "@/lib/api/client";
import type { LoanProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "active" | "inactive";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const money = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG")}`;

/* ─── Stat tile ─────────────────────────────────────────────────── */

function StatTile({
  label,
  value,
  inactive,
  onClick,
  index,
}: {
  label: string;
  value: string;
  inactive?: boolean;
  onClick?: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className={cn(
        "nm-raised bg-surface rounded-3xl p-5 text-left flex flex-col gap-1.5 transition-all duration-200",
        onClick && "hover:-translate-y-0.5 hover:shadow-lg",
        inactive && "opacity-50"
      )}
      style={{ animation: `var(--animate-fade-up) ${150 + index * 60}ms both` }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xl font-bold text-foreground leading-tight">{value}</span>
    </button>
  );
}

/* ─── Product row ───────────────────────────────────────────────── */

function ProductRow({ product }: { product: LoanProduct }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-muted/40 transition-colors duration-150"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="py-3.5 pr-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <span className="text-brand-primary font-bold text-sm">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[26ch]">
                {product.description}
              </p>
            </div>
          </div>
        </td>
        <td className="py-3.5 pr-4 text-sm font-semibold text-foreground whitespace-nowrap">
          {product.interest_rate}%
        </td>
        <td className="py-3.5 pr-4 text-sm text-foreground whitespace-nowrap">
          {money(product.max_amount)}
        </td>
        <td className="py-3.5 pr-4 text-sm text-foreground whitespace-nowrap">
          {product.min_term_months}–{product.max_term_months} mo
        </td>
        <td className="py-3.5 pr-4 text-sm text-foreground whitespace-nowrap">
          {product.guarantor_required_count}
        </td>
        <td className="py-3.5 pr-4">
          <span
            className={cn(
              "inline-flex items-center h-5 px-2 rounded-full text-xs font-semibold whitespace-nowrap",
              product.is_active
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            )}
          >
            {product.is_active ? "Active" : "Inactive"}
          </span>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="pb-4 pr-4">
            <div
              className="nm-inset rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3"
              style={{ animation: "var(--animate-fade-up)" }}
            >
              {[
                { label: "Description", value: product.description },
                { label: "Max multiplier", value: `${product.max_multiplier}× contributions` },
                { label: "Auto-approve ≤", value: money(product.auto_approval_threshold) },
                { label: "Min membership", value: `${product.min_membership_months} months` },
                { label: "Min contributions", value: `${product.min_contribution_months} months` },
                { label: "Created", value: new Date(product.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── Explorer ──────────────────────────────────────────────────── */

export function LoanProductsExplorer() {
  const { data, isLoading, isError, error, refetch } = useLoanProducts();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const products = useMemo(
    () => data?.results ?? [],
    [data]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? p.is_active : !p.is_active);
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [products, statusFilter, search]);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.is_active);
    const totalExposure = products.reduce(
      (sum, p) => sum + Number(p.max_amount),
      0
    );
    const avgRate = active.length
      ? active.reduce((s, p) => s + Number(p.interest_rate), 0) / active.length
      : 0;
    return {
      total: products.length,
      active: active.length,
      avgRate: avgRate.toFixed(2),
      exposure: totalExposure,
    };
  }, [products]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Loan Products</h1>
          <p className="text-muted-foreground text-sm">
            Rates, terms, guarantor requirements and auto-approval thresholds.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="nm-btn-primary flex items-center gap-2 rounded-xl bg-brand-primary text-white text-sm font-semibold px-4 py-2.5 hover:bg-brand-primary-hover transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          New product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Total products"
          value={String(stats.total)}
          index={0}
          onClick={() => setStatusFilter("all")}
          inactive={statusFilter !== "all"}
        />
        <StatTile
          label="Active"
          value={String(stats.active)}
          index={1}
          onClick={() => setStatusFilter("active")}
          inactive={statusFilter !== "active"}
        />
        <StatTile
          label="Avg interest rate"
          value={`${stats.avgRate}%`}
          index={2}
        />
        <StatTile
          label="Max exposure"
          value={money(stats.exposure)}
          index={3}
        />
      </div>

      {/* List */}
      <div className="nm-raised-lg bg-surface rounded-3xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <NmInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 nm-inset rounded-xl p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200",
                  statusFilter === f.value
                    ? "bg-brand-primary text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isError ? (
          <div className="text-center py-14 flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm">
              {error instanceof ApiError
                ? error.messages[0]
                : "Could not load loan products."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm font-semibold text-brand-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-muted-foreground text-sm">
              {products.length === 0
                ? "No loan products yet. Create your first one."
                : "No products match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="text-left border-b border-border/60">
                  {["Product", "Rate", "Max amount", "Term", "Guarantors", "Status"].map((h) => (
                    <th
                      key={h}
                      className="pb-2.5 pr-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((p) => (
                  <ProductRow key={p.id} product={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateLoanProductDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      {isLoading && (
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Syncing…
        </p>
      )}
    </div>
  );
}