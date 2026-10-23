"use client";

/**
 * NotificationsExplorer — full in-app notification centre.
 *
 * GET  /notifications/            (paginated)
 * POST /notifications/{id}/read/
 * POST /notifications/read-all/
 *
 * Loan-guarantor events carry the application id in `context_data`; when one
 * is present we surface a CTA that opens GuarantorConfirmDialog directly.
 */

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Inbox,
  Info,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NmErrorBanner } from "@/components/app/shared/NmField";
import { useNotificationsList } from "@/hooks/useNotifications";
import type { Notification, NotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GuarantorConfirmDialog } from "@/components/app/loans/GuarantorConfirmDialog";

const PAGE_SIZE = 20;

const TYPE_STYLES: Record<
  NotificationType,
  { icon: React.ElementType; className: string }
> = {
  info: { icon: Info, className: "text-brand-primary bg-brand-primary/10" },
  success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  warning: { icon: AlertTriangle, className: "text-warning bg-warning/10" },
  error: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

function timeAgo(value: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  );

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function guarantorApplicationId(n: Notification): string | null {
  const data: Record<string, unknown> = n.context_data ?? {};
  const looksLikeGuarantor =
    data.kind === "guarantor_request" ||
    data.type === "guarantor_request" ||
    /guarantor request|guarantee request|confirm guarantee|guarantor needed/i.test(
      `${n.title} ${n.message}`
    );

  if (!looksLikeGuarantor) return null;

  const candidate =
    data.application_id ??
    data.loan_application_id ??
    data.guarantor_application_id;

  return typeof candidate === "string" ? candidate : null;
}

export function NotificationsExplorer() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [guarantorApplication, setGuarantorApplication] = useState<
    string | null
  >(null);

  const {
    data,
    notifications,
    isLoading,
    isError,
    refetch,
    markRead,
    markingRead,
    markAllRead,
    markingAllRead,
  } = useNotificationsList(page, PAGE_SIZE);

  const unreadOnPage = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    return tab === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;
  }, [notifications, tab]);

  const total = data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="member-page member-notifications-page flex flex-col gap-5">
      {/* Header */}
      <header className="member-page-heading">
        <div>
          <p className="member-page-eyebrow">Updates</p>
          <h1>Notifications</h1>
          <p>Your in-app alerts and updates from the society.</p>
        </div>
        <button
          type="button"
          onClick={() => markAllRead()}
          disabled={markingAllRead}
          className="nm-chip inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-4 h-4" />
          {markingAllRead ? "Marking…" : "Mark all read"}
        </button>
      </header>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 nm-inset rounded-xl p-1 w-fit">
        {(
          [
            { value: "all", label: "All" },
            { value: "unread", label: `Unread${unreadOnPage ? ` (${unreadOnPage})` : ""}` },
          ] as const
        ).map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200",
              tab === item.value
                ? "bg-brand-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="nm-raised-lg rounded-3xl p-4">
        {isError ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <NmErrorBanner message="Could not load notifications. Check your connection and try again." />
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm font-semibold text-brand-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center">
              {tab === "unread" ? (
                <CheckCircle2 className="w-8 h-8 text-success" />
              ) : (
                <Inbox className="w-8 h-8 text-muted-foreground/60" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {tab === "unread" ? "You're all caught up" : "No notifications yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                {tab === "unread"
                  ? "There are no unread notifications on this page."
                  : "Membership updates and society alerts will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((n) => {
              const style = TYPE_STYLES[n.notification_type] ?? TYPE_STYLES.info;
              const Icon = style.icon;
              const appId = guarantorApplicationId(n);

              return (
                <article
                  key={n.id}
                  className={cn(
                    "nm-raised rounded-2xl p-4 flex items-start gap-3",
                    !n.is_read && "border-l-4 border-brand-primary"
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      style.className
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold text-foreground">
                        {n.title}
                      </h2>
                      {!n.is_read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                      )}
                      <span
                        suppressHydrationWarning
                        className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap"
                      >
                        {timeAgo(n.created_at)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {appId && (
                        <button
                          type="button"
                          onClick={() => setGuarantorApplication(appId)}
                          className="nm-chip inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Review guarantee request
                        </button>
                      )}
                      {!n.is_read && (
                        <button
                          type="button"
                          onClick={() => markRead(n.id)}
                          disabled={markingRead}
                          className="nm-chip inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-1 py-3 mt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{from}</span>–
              <span className="font-semibold text-foreground">{to}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!data?.previous}
                onClick={() => setPage((p) => p - 1)}
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={!data?.next}
                onClick={() => setPage((p) => p + 1)}
                className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
        <Bell className="w-3.5 h-3.5" />
        Notifications refresh automatically every minute.
      </p>

      <GuarantorConfirmDialog
        open={!!guarantorApplication}
        onClose={() => setGuarantorApplication(null)}
        applicationId={guarantorApplication ?? ""}
      />
    </div>
  );
}
