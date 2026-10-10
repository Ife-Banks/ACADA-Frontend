/**
 * Global query error toaster.
 *
 * Surfacing strategy — avoid double-notifying:
 *  - Initial-load failures are rendered inline by components (error banners),
 *    so they are NOT toasted here.
 *  - Background refetch failures (the query already had data) often happen
 *    off-screen with no component in view, so those ARE toasted.
 *
 * Failures are briefly buffered and aggregated into one toast so a page
 * refresh that trips several queries at once still only produces a single
 * notification. A query is only toasted again after it later succeeds.
 */

import type { Query, QueryCacheConfig } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

/** Friendly label for the leading segment of a query key */
const LABELS: Record<string, string> = {
  members: "member data",
  contributions: "contribution data",
  loans: "loan data",
  schedules: "schedule data",
  reports: "dashboard data",
  tenants: "tenant data",
  session: "your profile",
  notifications: "notifications",
};

const MAX_BUFFERED = 8;

/** Query hashes already toasted while their data is still stale */
const toasted = new Set<string>();

interface BufferedError {
  label: string;
  message: string;
}

const buffer = new Map<string, BufferedError>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function labelFor(query: Query<unknown, unknown>): string {
  const head = query.queryKey[0];
  return typeof head === "string" ? (LABELS[head] ?? "data") : "data";
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.messages[0] ?? error.message;
  return error instanceof Error ? error.message : "Something went wrong.";
}

function flush() {
  flushTimer = null;
  const failures = [...buffer.values()];
  buffer.clear();

  if (failures.length === 0) return;

  const labels = [...new Set(failures.map((f) => f.label))];
  toast.error("Couldn't refresh data", {
    description:
      labels.length === 1
        ? `Showing cached ${labels[0]} — ${failures[0].message}`
        : `Showing cached data — couldn't refresh ${labels.join(", ")}.`,
  });
}

function queue(label: string, message: string) {
  const existing = buffer.get(label);
  if (existing) return; // one message per label per flush
  buffer.set(label, { label, message });

  if (flushTimer === null) {
    flushTimer = setTimeout(flush, 400);
  }

  // Safety net: never let the buffer stall silently
  if (buffer.size >= MAX_BUFFERED) flush();
}

export const queryErrorLifecycle = {
  onError: (error: unknown, query: Query<unknown, unknown>) => {
    // Background refetch failure only — initial loads render inline errors.
    if (query.state.data === undefined) return;
    if (toasted.has(query.queryHash)) return;

    toasted.add(query.queryHash);
    queue(labelFor(query), errorMessage(error));
  },

  onSuccess: (_data: unknown, query: Query<unknown, unknown>) => {
    toasted.delete(query.queryHash);
  },
} satisfies QueryCacheConfig;