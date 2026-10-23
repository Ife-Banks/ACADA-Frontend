"use client";

/**
 * TenantRulesPanel — versioned business-rule sets for a society.
 *
 * GET  /platform/tenants/{id}/rules/  → every version
 * POST /platform/tenants/{id}/rules/  → new version (backend archives the
 *                                       previously open-ended version)
 *
 * The backend stores rules as an arbitrary JSON object, so the editor is a
 * validated JSON textarea seeded with the currently active rules.
 */

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileJson,
  History,
  Plus,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { NmSheet } from "@/components/app/shared/NmSheet";
import {
  NmField,
  NmInput,
  NmTextarea,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { useTenantRules } from "@/hooks/useTenants";
import { createTenantRuleSet } from "@/lib/api/tenants";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { TenantRuleSet } from "@/lib/types";
import { cn, localTodayIso } from "@/lib/utils";
import { RuleStatusBadge } from "./PlatformBadges";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function prettyRules(rules: Record<string, unknown>) {
  return JSON.stringify(rules, null, 2);
}

/**
 * The keys the platform actually reads out of a rule set.
 *
 * The editor is a raw JSON textarea, so the contract between the society and
 * the backend has to be written down — here, and in the backend README.
 */
const RULE_SCHEMA: { section: string; keys: string[] }[] = [
  {
    section: "penalty",
    keys: [
      "missed_payment_flat — flat penalty for a missed contribution",
      "missed_payment_rate — penalty as a share of the amount due; used when it is above 0",
    ],
  },
  {
    section: "loan",
    keys: [
      "escalation_threshold — amounts above this are always escalated to the executives",
      "default_interest_rate — pre-fills the rate on newly created loan products",
      'default_interest_method — "flat" or "reducing" — pre-fills newly created loan products',
      "max_term_months — society-wide ceiling on the repayment term",
    ],
  },
];

interface RuleCardProps {
  rule: TenantRuleSet;
  expanded: boolean;
  onToggle: () => void;
}

function RuleCard({ rule, expanded, onToggle }: RuleCardProps) {
  return (
    <div className="nm-raised rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <div className="w-9 h-9 rounded-xl nm-inset flex items-center justify-center shrink-0">
          <History className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-foreground">
              Version {rule.version}
            </p>
            <RuleStatusBadge active={rule.is_active} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(rule.active_from)} →{" "}
            {rule.active_to ? formatDate(rule.active_to) : "present"}
          </p>
          {rule.notes && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {rule.notes}
            </p>
          )}
        </div>
        <span className="text-muted-foreground shrink-0 mt-1">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
      </button>

      {expanded && (
        <div
          className="px-4 pb-4"
          style={{ animation: "var(--animate-fade-up)" }}
        >
          <div className="nm-inset rounded-xl p-3 overflow-x-auto">
            <pre className="text-[11px] leading-relaxed font-mono text-foreground whitespace-pre-wrap break-words">
              {prettyRules(rule.rules ?? {})}
            </pre>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Created {formatDate(rule.created_at.slice(0, 10))}
          </p>
        </div>
      )}
    </div>
  );
}

interface Props {
  tenantId: string;
}

export function TenantRulesPanel({ tenantId }: Props) {
  const rules = useTenantRules(tenantId);
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFrom, setActiveFrom] = useState(localTodayIso());
  const [notes, setNotes] = useState("");
  const [rulesText, setRulesText] = useState("{}");
  const [dateError, setDateError] = useState<string | null>(null);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...(rules.data ?? [])].sort((a, b) => b.version - a.version);
  }, [rules.data]);

  const activeRule = useMemo(
    () => sorted.find((r) => r.is_active) ?? null,
    [sorted]
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: {
      active_from: string;
      notes: string;
      rules: Record<string, unknown>;
    }) => createTenantRuleSet(tenantId, payload),
    onSuccess: (created) => {
      toast.success(`Rule version ${created.version} published.`);
      queryClient.invalidateQueries({ queryKey: qk.tenants.rules(tenantId) });
      queryClient.invalidateQueries({ queryKey: qk.tenants.detail(tenantId) });
      closeEditor();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages.join(" ")
          : "Could not publish the rule version. Please try again."
      );
    },
  });

  function openEditor() {
    setActiveFrom(localTodayIso());
    setNotes("");
    setRulesText(prettyRules(activeRule?.rules ?? {}));
    setDateError(null);
    setRulesError(null);
    setServerError(null);
    setCreateOpen(true);
  }

  function closeEditor() {
    setCreateOpen(false);
    setDateError(null);
    setRulesError(null);
    setServerError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setDateError(null);
    setRulesError(null);
    setServerError(null);

    if (!activeFrom) {
      setDateError("Choose the date this version takes effect.");
      return;
    }

    /*
     * The backend archives the current version as soon as a new version is
     * posted, even if the new one starts later. A future date would therefore
     * leave the society with no active rules until that date, so only allow
     * versions that take effect today or earlier.
     */
    if (activeFrom > localTodayIso()) {
      setDateError(
        "Choose today or an earlier date. Future-dated versions would archive the current rules immediately."
      );
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rulesText || "{}");
    } catch {
      setRulesError("Rules must be valid JSON.");
      return;
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      setRulesError("Rules must be a JSON object.");
      return;
    }

    mutate({
      active_from: activeFrom,
      notes: notes.trim(),
      rules: parsed as Record<string, unknown>,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Business rules</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Versioned contribution, penalty and loan rules. Publishing a new
            version archives the current one.
          </p>
          {activeRule && (
            <p className="text-xs text-brand-primary font-semibold mt-1.5">
              Active: version {activeRule.version} · since{" "}
              {formatDate(activeRule.active_from)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={openEditor}
          className="nm-btn-primary inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          New version
        </button>
      </div>

      {rules.isError && (
        <NmErrorBanner message="Could not load rule versions. Try again." />
      )}

      {rules.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="nm-raised rounded-2xl flex flex-col items-center justify-center text-center py-14 gap-3">
          <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center">
            <Inbox className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">No rule versions yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
              Publish the first version to define contribution amounts, penalty
              structures and loan thresholds.
            </p>
          </div>
          <button
            type="button"
            onClick={openEditor}
            className="nm-chip rounded-xl px-3 py-2 text-xs font-semibold text-brand-primary"
          >
            Create version 1
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              expanded={expandedId === rule.id}
              onToggle={() =>
                setExpandedId((current) => (current === rule.id ? null : rule.id))
              }
            />
          ))}
        </div>
      )}

      <NmSheet
        className="platform-dialog platform-sheet"
        open={createOpen}
        onClose={closeEditor}
        title="Publish rule version"
        description="Rules are evaluated against the version that was active at the time of a decision."
        width="sm:max-w-2xl"
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={closeEditor}
              disabled={isPending}
              className="nm-btn-ghost flex-1 rounded-xl py-2.5 text-sm font-semibold text-foreground border border-border disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="rule-version-form"
              disabled={isPending}
              className="nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              <FileJson className="w-4 h-4" />
              {isPending ? "Publishing…" : "Publish version"}
            </button>
          </div>
        }
      >
        <form
          id="rule-version-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <NmField
            label="Effective from"
            error={dateError ?? undefined}
            required
          >
            <NmInput
              icon={CalendarDays}
              type="date"
              max={localTodayIso()}
              value={activeFrom}
              onChange={(e) => setActiveFrom(e.target.value)}
            />
          </NmField>

          <NmField
            label="Rules (JSON object)"
            error={rulesError ?? undefined}
            hint="The active version is pre-filled. Adjust values and publish."
            required
          >
            <NmTextarea
              rows={16}
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              spellCheck={false}
              className={cn("font-mono text-xs", rulesError && "border-destructive")}
            />
          </NmField>

          {/* Schema reference — the JSON editor is only useful if the keys
              it understands are written down somewhere. */}
          <details className="nm-inset rounded-xl px-4 py-3">
            <summary className="text-xs font-semibold text-foreground cursor-pointer">
              What can go in here?
            </summary>
            <div className="flex flex-col gap-3 mt-3">
              {RULE_SCHEMA.map(({ section, keys }) => (
                <div key={section}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-brand-primary">
                    {section}
                  </p>
                  <ul className="flex flex-col gap-1 mt-1">
                    {keys.map((key) => (
                      <li
                        key={key}
                        className="text-[11px] text-muted-foreground leading-relaxed font-mono"
                      >
                        {key}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Every key is optional. A key you leave out keeps the loan
                product&apos;s own setting.
              </p>
            </div>
          </details>

          <NmField label="Notes" hint="Optional — what changed in this version?">
            <NmTextarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Raised the monthly contribution and late-payment penalty."
            />
          </NmField>

          {serverError && <NmErrorBanner message={serverError} />}
        </form>
      </NmSheet>
    </div>
  );
}
