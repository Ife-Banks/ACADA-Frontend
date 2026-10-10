"use client";

/**
 * MemberDetailView — the admin member detail page.
 *
 * Data (real API calls):
 *   GET /members/{id}/       → member (user, role, status, approval info)
 *   GET /members/{id}/profile/ → tenant profile (employment, payroll, NOK, bank)
 *
 * Renders an identity card, an employment & payroll card, a membership
 * card (role/status/approval), and role/status management for SOCIETY_ADMIN.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  Phone,
  CalendarDays,
  Building2,
  Hash,
  Layers,
  ShieldCheck,
  UserCog,
  KeyRound,
  HeartHandshake,
  Landmark,
  PencilLine,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMember, useMemberProfile } from "@/hooks/useMembers";
import type { Member } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { NmErrorBanner } from "@/components/app/shared/NmField";
import { StatusBadge, RoleBadge } from "./MemberBadges";
import { ChangeMemberRoleDialog } from "./ChangeMemberRoleDialog";
import { ChangeMemberStatusDialog } from "./ChangeMemberStatusDialog";
import { EditMemberProfileSheet } from "./EditMemberProfileSheet";

/* ─── Helpers ───────────────────────────────────────────────────── */

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-brand-primary/8 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm text-foreground font-medium break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  action,
  className,
  children,
}: {
  title: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("nm-raised-lg rounded-3xl p-6 flex flex-col gap-5", className)}
      style={{ animation: "var(--animate-fade-up)", animationDelay: "120ms" }}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/8 flex items-center justify-center">
            <Icon className="w-4 h-4 text-brand-primary" />
          </div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */

export function MemberDetailView({ memberId }: { memberId: string }) {
  const { hasRole } = useAuth();
  const canManage = hasRole("SOCIETY_ADMIN");

  const [roleMember, setRoleMember] = useState<Member | null>(null);
  const [statusMember, setStatusMember] = useState<Member | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const member = useMember(memberId);
  const profile = useMemberProfile(memberId);

  const memberData = member.data;
  const profileData = profile.data;

  const initials = useMemo(
    () => (memberData ? initialsOf(memberData.user.full_name) : ""),
    [memberData]
  );

  if (member.isError) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <NmErrorBanner message="Could not load this member. Check your connection and refresh." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      {/* ── Header ── */}
      {!memberData ? (
        <div className="nm-raised-lg rounded-3xl p-6 flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ) : (
        <div
          className="nm-raised-lg rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ animation: "var(--animate-fade-up)" }}
        >
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback className="bg-brand-primary text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-foreground truncate">
              {memberData.user.full_name}
            </h2>
            <p className="text-sm text-muted-foreground truncate">{memberData.user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <RoleBadge role={memberData.role.code} />
              <StatusBadge status={memberData.membership_status} />
            </div>
          </div>
          {canManage && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditProfileOpen(true)}
                className="nm-chip inline-flex items-center gap-2 rounded-xl text-sm font-semibold px-4 py-2.5 hover:text-foreground transition-colors"
              >
                <PencilLine className="w-4 h-4" />
                Edit profile
              </button>
              <button
                type="button"
                onClick={() => setRoleMember(memberData)}
                className="nm-btn-primary inline-flex items-center gap-2 rounded-xl bg-brand-primary text-white text-sm font-semibold px-4 py-2.5 hover:bg-brand-primary-hover transition-colors duration-200"
              >
                <ShieldCheck className="w-4 h-4" />
                Change role
              </button>
              <button
                type="button"
                onClick={() => setStatusMember(memberData)}
                className="nm-chip inline-flex items-center gap-2 rounded-xl text-sm font-semibold px-4 py-2.5 hover:text-foreground transition-colors"
              >
                <UserCog className="w-4 h-4" />
                Status
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Identity + contact */}
        <Card
          title="Member details"
          icon={Layers}
          className="lg:col-span-2"
          action={<CalendarDays className="w-4 h-4 text-muted-foreground" />}
        >
          {member.isLoading ? (
            <SkeletonList />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailRow icon={Mail} label="Email" value={memberData!.user.email} />
                <DetailRow icon={Phone} label="Phone" value={memberData!.user.phone} />
                <DetailRow
                  icon={Hash}
                  label="Employee no."
                  value={profileData?.employee_no && `EMP · ${profileData.employee_no}`}
                />
                <DetailRow
                  icon={Building2}
                  label="Department"
                  value={profileData?.department}
                />
                <DetailRow
                  icon={Building2}
                  label="Faculty"
                  value={profileData?.faculty}
                />
                <DetailRow
                  icon={ShieldCheck}
                  label="Designation"
                  value={profileData?.designation}
                />
              </div>

              <div className="nm-inset rounded-2xl p-4 mt-2 flex flex-col gap-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Emergency & payroll (if provided)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <DetailRow
                    icon={HeartHandshake}
                    label="Next of kin"
                    value={
                      profileData?.next_of_kin_name
                        ? `${profileData.next_of_kin_name} · ${profileData.next_of_kin_phone ?? ""}`
                        : undefined
                    }
                  />
                  <DetailRow
                    icon={Landmark}
                    label="Bank account"
                    value={
                      profileData?.bank_account_no
                        ? `${profileData.bank_name ?? ""} · ${profileData.bank_account_no}`
                        : undefined
                    }
                  />
                  <DetailRow
                    icon={Hash}
                    label="Payroll no."
                    value={profileData?.payroll_no}
                  />
                  <DetailRow
                    icon={CalendarDays}
                    label="Started with society"
                    value={formatDate(profileData?.joined_at)}
                  />
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Membership */}
        <Card title="Membership" icon={KeyRound} className="flex flex-col gap-5">
          {member.isLoading || !memberData ? (
            <SkeletonList />
          ) : (
            <div className="flex flex-col gap-4">
              <DetailRow icon={ShieldCheck} label="Role" value={memberData.role.name} />
              <DetailRow
                icon={UserCog}
                label="Status"
                value={<StatusBadge status={memberData.membership_status} />}
              />
              <DetailRow
                icon={CalendarDays}
                label="Member since"
                value={formatDate(memberData.created_at)}
              />
              <DetailRow
                icon={UserCog}
                label="Approved by"
                value={memberData.approved_by ?? "—"}
              />
              <DetailRow
                icon={CalendarDays}
                label="Approved at"
                value={formatDate(memberData.approved_at)}
              />
              <DetailRow
                icon={Mail}
                label="Account status"
                value={memberData.user.status}
              />
            </div>
          )}
        </Card>
      </div>

      {/* ── Dialog state (persist across member changes) ── */}
      <ChangeMemberRoleDialog
        open={!!roleMember}
        onClose={() => setRoleMember(null)}
        member={roleMember}
      />
      <ChangeMemberStatusDialog
        open={!!statusMember}
        onClose={() => setStatusMember(null)}
        member={statusMember}
      />
      <EditMemberProfileSheet
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        memberId={memberId}
        profile={profileData ?? null}
        memberName={memberData?.user.full_name ?? "This member"}
      />
    </div>
  );
}

/* ─── Small building blocks ─────────────────────────────────────── */

function BackLink() {
  return (
    <Link
      href="/admin/members"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-brand-primary transition-colors w-fit"
    >
      <ChevronLeft className="w-4 h-4" />
      Back to members
    </Link>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full rounded-lg" />
      ))}
    </div>
  );
}