"use client";

/**
 * Screen 34 — Change Member Role Dialog
 *
 * Used on the Member Detail page by SOCIETY_ADMIN.
 * Shows the current role and a list of available roles.
 * Calls PUT /members/{id}/role/
 *
 * Roles (from backend):
 *   MEMBER, COMMITTEE_MEMBER, EXECUTIVE, SOCIETY_ADMIN
 * (SUPER_ADMIN is platform-only — not changeable here)
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import { NmErrorBanner } from "@/components/app/shared/NmField";
import { updateMemberRole } from "@/lib/api/members";
import { qk } from "@/lib/query-keys";
import type { Member, UserRole } from "@/lib/types";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/* ─── Role definitions ─────────────────────────────────────────── */

const ROLES: Array<{
  code: Exclude<UserRole, "SUPER_ADMIN">;
  name: string;
  description: string;
}> = [
  {
    code: "MEMBER",
    name: "Member",
    description: "Own contributions, own loans, own notifications only.",
  },
  {
    code: "COMMITTEE_MEMBER",
    name: "Committee Member",
    description: "Read-only access to financials and loan applications.",
  },
  {
    code: "EXECUTIVE",
    name: "Executive / Treasurer",
    description:
      "Manage cycles, schedules, loan approvals, and the financial ledger.",
  },
  {
    code: "SOCIETY_ADMIN",
    name: "President / Society Admin",
    description:
      "Full access — members, roles, settings, and all executive features.",
  },
];

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  member: Member | null;
}

export function ChangeMemberRoleDialog({ open, onClose, member }: Props) {
  const currentRole = member?.role.code as UserRole | undefined;
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const effectiveSelected = selected ?? currentRole ?? null;

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateMemberRole(member!.id, effectiveSelected!),
    onSuccess: () => {
      const roleName =
        ROLES.find((r) => r.code === effectiveSelected)?.name ?? effectiveSelected;
      toast.success(`${member!.user.full_name}'s role updated to ${roleName}.`);
      queryClient.invalidateQueries({ queryKey: qk.members.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Role update failed. Please try again."
      );
    },
  });

  function handleClose() {
    setSelected(null);
    setServerError(null);
    onClose();
  }

  const hasChanged = effectiveSelected !== currentRole;

  if (!member) return null;

  return (
    <NmDialog
      open={open}
      onClose={handleClose}
      title="Change Role"
      description={`Update the role for ${member.user.full_name}.`}
      confirmLabel="Save changes"
      onConfirm={() => mutate()}
      loading={isPending}
      variant="primary"
      hideFooter={false}
    >
      <div className="flex flex-col gap-4">
        {/* Current role indicator */}
        <div className="nm-inset rounded-xl px-4 py-3 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Current role:{" "}
            <span className="font-semibold text-foreground">
              {ROLES.find((r) => r.code === currentRole)?.name ?? currentRole}
            </span>
          </p>
        </div>

        {/* Role selector */}
        <div className="flex flex-col gap-2">
          {ROLES.map((role) => {
            const isActive = effectiveSelected === role.code;
            const isCurrent = currentRole === role.code;

            return (
              <button
                key={role.code}
                type="button"
                onClick={() => setSelected(role.code)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200",
                  isActive
                    ? "nm-pressed border border-brand-primary/30"
                    : "nm-raised hover:border-brand-primary/20 border border-transparent"
                )}
              >
                {/* Selection indicator */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200",
                    isActive
                      ? "bg-brand-primary border-brand-primary"
                      : "border-border"
                  )}
                >
                  {isActive && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        isActive ? "text-brand-primary" : "text-foreground"
                      )}
                    >
                      {role.name}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground px-1.5 py-0.5 rounded-full nm-inset">
                        current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Change warning */}
        {hasChanged && effectiveSelected === "SOCIETY_ADMIN" && (
          <div
            className="nm-raised rounded-xl p-3.5 flex items-start gap-2.5"
            style={{ borderLeft: "3px solid var(--warning)" }}
          >
            <span className="text-warning text-sm shrink-0">⚠</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Granting{" "}
              <span className="font-semibold text-foreground">
                President / Society Admin
              </span>{" "}
              gives full control over all society data including other
              members&apos; records.
            </p>
          </div>
        )}

        {serverError && <NmErrorBanner message={serverError} />}
      </div>
    </NmDialog>
  );
}
