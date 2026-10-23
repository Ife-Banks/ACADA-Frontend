"use client";

/**
 * LoanProductsExplorer — society-admin catalogue of loan products:
 * rates, terms, guarantor requirements and auto-approval thresholds.
 */

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NmDialog } from "@/components/app/shared/NmDialog";
import { NmInput } from "@/components/app/shared/NmField";
import { useAllLoanProducts } from "@/hooks/useLoans";
import { CreateLoanProductDialog } from "./CreateLoanProductDialog";
import { updateLoanProduct } from "@/lib/api/loans";
import { qk } from "@/lib/query-keys";
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
        "loan-products-stat text-left flex flex-col gap-1.5 transition-all duration-200",
        onClick && "cursor-pointer",
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

function ProductRow({
  product,
  onEdit,
  onToggle,
}: {
  product: LoanProduct;
  onEdit: (product: LoanProduct) => void;
  onToggle: (product: LoanProduct) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-muted/40 transition-colors duration-150"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="py-3.5 pr-4">
          <div className="flex items-center gap-3">
            <div className="loan-product-mark">
              <span className="font-bold text-sm">
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
          <span className="block text-[11px] font-normal text-muted-foreground">
            {product.interest_method === "reducing" ? "reducing" : "flat"}
          </span>
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
        <td className="py-3.5 pl-2 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="loan-product-actions inline-flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:text-foreground"
              aria-label={`Actions for ${product.name}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
              >
                <Pencil className="size-4" />
                Edit product
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant={product.is_active ? "destructive" : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(product);
                }}
              >
                <Power className="size-4" />
                {product.is_active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="pb-4 pr-4">
            <div
              className="loan-products-details rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3"
              style={{ animation: "var(--animate-fade-up)" }}
            >
              {[
                { label: "Description", value: product.description },
                { label: "Interest basis", value: product.interest_method === "reducing" ? "Reducing balance (amortised)" : "Flat (simple) interest" },
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
  const { data, isLoading, isError, error, refetch } = useAllLoanProducts();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<LoanProduct | null>(null);
  const [toggleTarget, setToggleTarget] = useState<LoanProduct | null>(null);

  const toggleProduct = useMutation({
    mutationFn: (product: LoanProduct) =>
      updateLoanProduct(product.id, { is_active: !product.is_active }),
    onSuccess: (updated) => {
      toast.success(
        updated.is_active
          ? `${updated.name} activated.`
          : `${updated.name} deactivated.`
      );
      setToggleTarget(null);
      queryClient.invalidateQueries({ queryKey: qk.loans.root });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.messages[0] ?? "Could not update the product."
          : "Could not update the product."
      );
    },
  });

  const products = useMemo(() => data ?? [], [data]);

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
    <div className="loan-products-workspace flex flex-col gap-5">
      {/* Header */}
      <header className="loan-products-heading">
        <div>
          <p className="loan-products-eyebrow">Credit settings</p>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Loan Products</h1>
          <p className="text-muted-foreground text-sm">
            Set the rates, terms, and eligibility rules members can apply for.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="loan-products-add-button"
        >
          <Plus className="w-4 h-4" />
          New product
        </button>
      </header>

      {/* Stats */}
      <div className="loan-products-stats grid grid-cols-2 lg:grid-cols-4 gap-3">
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
      <div className="loan-products-panel">
        <div className="loan-products-toolbar">
          <div className="loan-products-search relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <NmInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="loan-products-search-input pl-9"
            />
          </div>
          <div className="loan-products-filters">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "loan-products-filter transition-colors duration-150",
                  statusFilter === f.value
                    ? "is-active"
                    : ""
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
                  {["Product", "Rate", "Max amount", "Term", "Guarantors", "Status", "Actions"].map((h) => (
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
                  <ProductRow
                    key={p.id}
                    product={p}
                    onEdit={(product) => setEditing(product)}
                    onToggle={(product) => setToggleTarget(product)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateLoanProductDialog
        open={createOpen || !!editing}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        product={editing}
      />

      <NmDialog
        className="loan-products-dialog"
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        title={toggleTarget?.is_active ? "Deactivate loan product" : "Activate loan product"}
        description={
          toggleTarget
            ? toggleTarget.is_active
              ? `${toggleTarget.name} will no longer be available for new loan applications. Existing loans are unaffected.`
              : `${toggleTarget.name} will become available for new loan applications.`
            : undefined
        }
        confirmLabel={toggleTarget?.is_active ? "Deactivate" : "Activate"}
        variant={toggleTarget?.is_active ? "danger" : "primary"}
        loading={toggleProduct.isPending}
        onConfirm={() => toggleTarget && toggleProduct.mutate(toggleTarget)}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          Product settings and history are kept. You can reactivate it at any
          time.
        </p>
      </NmDialog>

      {isLoading && (
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Syncing…
        </p>
      )}
    </div>
  );
}
