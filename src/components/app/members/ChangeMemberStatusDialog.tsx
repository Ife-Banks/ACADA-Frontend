"use client";

/**
 * Screen 35 — Change Member Status Dialog
 *
 * Used on the Member Detail page by SOCIETY_ADMIN.
 * Handles three transitions:
 *   pending  → active    (approve)
 *   active   → suspended (suspend)
 *   suspended→ active    (reactivate)
 *   any      → removed   (remove — destructive)
 *
 * Calls PATCH /members/{id}/status/
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import { NmField, NmTextarea, NmErrorBanner } from "@/components/app/shared/NmField";
import { updateMemberStatus } from "@/lib/api/members";
import { qk } from "@/lib/query-keys";
import type { Member, MembershipStatus } from "@/lib/types";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/* ─── Available actions per current status ─────────────────────── */

type StatusAction = {
  targetStatus: "active" | "suspended" | "removed";
  label: string;
  description: string;
  icon: React.ElementType;
  variant: "primary" | "warning" | "danger";
  requiresReason: boolean;
};

function getAvailableActions(current: MembershipStatus): StatusAction[] {
  const actions: StatusAction[] = [];

  if (current === "pending" || current === "suspended") {
    actions.push({
      targetStatus: "active",
      label: current === "pending" ? "Approve membership" : "Reactivate member",
      description:
        current === "pending"
          ? "Approves the pending membership. The member gains full access."
          : "Restores access for this member.",
      icon: current === "pending" ? CheckCircle2 : PlayCircle,
      variant: "primary",
      requiresReason: false,
    });
  }

  if (current === "active") {
    actions.push({
      targetStatus: "suspended",
      label: "Suspend member",
      description:
        "Temporarily revokes access. The member's data is preserved. You can reactivate later.",
      icon: PauseCircle,
      variant: "warning",
      requiresReason: true,
    });
  }

  if (current !== "removed") {
    actions.push({
      targetStatus: "removed",
      label: "Remove member",
      description:
        "Permanently removes the membership. This cannot be undone. The user account is retained but the membership is gone.",
      icon: Trash2,
      variant: "danger",
      requiresReason: true,
    });
  }

  return actions;
}

const VARIANT_STYLES = {
  primary: {
    active:   "nm-pressed border border-success/30 text-success bg-success/5",
    inactive: "nm-raised text-muted-foreground hover:text-success",
    border:   "var(--success)",
  },
  warning: {
    active:   "nm-pressed border border-warning/30 text-warning bg-warning/5",
    inactive: "nm-raised text-muted-foreground hover:text-warning",
    border:   "var(--warning)",
  },
  danger: {
    active:   "nm-pressed border border-destructive/30 text-destructive bg-destructive/5",
    inactive: "nm-raised text-muted-foreground hover:text-destructive",
    border:   "var(--destructive)",
  },
};

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  member: Member | null;
}

export function ChangeMemberStatusDialog({ open, onClose, member }: Props) {
  const [selectedAction, setSelectedAction] = useState<StatusAction | null>(null);
  const [reason, setReason] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const currentStatus = member?.membership_status ?? "active";
  const availableActions = getAvailableActions(currentStatus);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateMemberStatus(member!.id, selectedAction!.targetStatus),
    onSuccess: () => {
      toast.success(
        `${member!.user.full_name}'s status updated to ${selectedAction!.targetStatus}.`,
        { duration: 4000 }
      );
      queryClient.invalidateQueries({ queryKey: qk.members.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Status update failed. Please try again."
      );
    },
  });

  function handleClose() {
    setSelectedAction(null);
    setReason("");
    setServerError(null);
    onClose();
  }

  function handleConfirm() {
    if (!selectedAction) return;
    if (selectedAction.requiresReason && !reason.trim()) return;
    mutate();
  }

  if (!member) return null;

  return (
    <NmDialog
      open={open}
      onClose={handleClose}
      title="Change Member Status"
      description={`Update the membership status for ${member.user.full_name}.`}
      confirmLabel={selectedAction?.label ?? "Choose an action"}
      onConfirm={handleConfirm}
      loading={isPending}
      variant={selectedAction?.variant === "danger" ? "danger" : "primary"}
      hideFooter={false}
    >
      <div className="flex flex-col gap-4">
        {/* Current status */}
        <div className="nm-inset rounded-xl px-4 py-3 grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              Member
            </p>
            <p className="text-xs font-bold text-foreground">
              {member.user.full_name}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              Current status
            </p>
            <p className="text-xs font-bold text-foreground capitalize">
              {currentStatus}
            </p>
          </div>
        </div>

        {/* Action selector */}
        <div className="flex flex-col gap-2">
          {availableActions.map((action) => {
            const isActive = selectedAction?.targetStatus === action.targetStatus;
            const styles = VARIANT_STYLES[action.variant];
            const Icon = action.icon;

            return (
              <button
                key={action.targetStatus}
                type="button"
                onClick={() => {
                  setSelectedAction(action);
                  setReason("");
                  setServerError(null);
                }}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl text-left w-full transition-all duration-200",
                  isActive ? styles.active : styles.inactive
                )}
              >
                <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-xs mt-0.5 leading-relaxed opacity-80">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Reason field — shown when selected action requires one */}
        {selectedAction?.requiresReason && (
          <NmField
            label="Reason"
            hint="Required — this will be logged in the audit trail."
            required
          >
            <NmTextarea
              placeholder={
                selectedAction.targetStatus === "removed"
                  ? "Why is this member being removed?"
                  : "Why is this member being suspended?"
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </NmField>
        )}

        {/* Destructive warning */}
        {selectedAction?.targetStatus === "removed" && (
          <div
            className="nm-raised rounded-xl p-3.5 flex items-start gap-2.5"
            style={{ borderLeft: "3px solid var(--destructive)" }}
          >
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-destructive">
                This action cannot be undone.
              </span>{" "}
              The user account is kept, but the membership and all associated
              access will be permanently revoked. Their contribution and loan
              history is preserved for audit purposes.
            </p>
          </div>
        )}

        {/* Requires reason warning when not yet filled */}
        {selectedAction?.requiresReason && !reason.trim() && (
          <p className="text-xs text-warning font-medium">
            A reason is required to continue.
          </p>
        )}

        {serverError && <NmErrorBanner message={serverError} />}
      </div>
    </NmDialog>
  );
}
