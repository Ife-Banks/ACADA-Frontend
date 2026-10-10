"use client";

/**
 * MembersExplorer — the Members list portal for SOCIETY_ADMIN.
 *
 * Data (all real API calls):
 *   GET /members/            → paginated members table (All tab)
 *   GET /members/pending/    → pending approvals (Pending tab)
 *   PATCH /members/{id}/status/ → quick approve
 *
 * Composed of shadcn primitives (Tabs, Table, Avatar, DropdownMenu,
 * Skeleton) with the project's neumorphic Nm* surfaces and the existing
 * member dialogs (AddMemberSheet, ChangeMemberRoleDialog,
 * ChangeMemberStatusDialog).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  ExternalLink,
  ShieldCheck,
  UserCog,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Inbox,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useMembersList, usePendingMembers } from "@/hooks/useMembers";
import { updateMemberStatus } from "@/lib/api/members";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { Member } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NmInput, NmSelect, NmErrorBanner } from "@/components/app/shared/NmField";
import { StatusBadge, RoleBadge } from "./MemberBadges";
import { AddMemberSheet } from "./AddMemberSheet";
import { ChangeMemberRoleDialog } from "./ChangeMemberRoleDialog";
import { ChangeMemberStatusDialog } from "./ChangeMemberStatusDialog";

const PAGE_SIZE = 25;

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

/* ─── Stat tile ─────────────────────────────────────────────────── */

function Stat({ icon: Icon, label, value, hint, onClick, delay }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  hint?: string;
  onClick?: () => void;
  delay: number;
}) {
  const isClickable = !!onClick;
  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={onClick}
      className={cn(
        "nm-raised-lg rounded-3xl p-5 text-left w-full flex flex-col gap-3",
        isClickable && "cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
      )}
      style={{ animation: "var(--animate-fade-up)", animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/8 flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand-primary" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{label}</p>
        {hint && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{hint}</p>}
      </div>
    </button>
  );
}

/* ─── Main component ────────────────────────────────────────────── */

export function MembersExplorer() {
  const { tenant, hasRole } = useAuth();
  const canManage = hasRole("SOCIETY_ADMIN");
  const queryClient = useQueryClient();

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [roleMember, setRoleMember] = useState<Member | null>(null);
  const [statusMember, setStatusMember] = useState<Member | null>(null);

  const list = useMembersList({ page, page_size: PAGE_SIZE });
  const pending = usePendingMembers();

  /* Client-side filters over the current page */
  const filtered = useMemo(() => {
    const rows = list.data?.results ?? [];
    const term = search.trim().toLowerCase();
    return rows.filter((m) => {
      const matchesStatus = status === "all" || m.membership_status === status;
      if (!matchesStatus) return false;
      if (!term) return true;
      return (
        m.user.full_name.toLowerCase().includes(term) ||
        m.user.email.toLowerCase().includes(term) ||
        (m.profile?.employee_no ?? "").toLowerCase().includes(term)
      );
    });
  }, [list.data, search, status]);

  /* Quick approve (pending tab) */
  const approve = useMutation({
    mutationFn: (id: string) => updateMemberStatus(id, "active"),
    onSuccess: () => {
      toast.success("Membership approved — the member can now sign in.");
      queryClient.invalidateQueries({ queryKey: qk.members.root });
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError
          ? err.messages[0] ?? "Could not approve membership."
          : "Could not approve membership."
      ),
  });

  const total = list.data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  function switchTab(next: string) {
    setTab(next);
    setSearch("");
    setStatus("all");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Stat tiles ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat
          icon={Users}
          label="Total members"
          value={list.isLoading ? "…" : total}
          hint={`Showing ${from}–${to} of ${total}`}
          delay={0}
        />
        <Stat
          icon={CheckCircle2}
          label="Pending approvals"
          value={pending.isLoading ? "…" : pending.data?.length ?? 0}
          hint="Click to review"
          delay={75}
          onClick={() => switchTab("pending")}
        />
        <Stat
          icon={Building2}
          label="Society"
          value={tenant?.name ?? "—"}
          hint={tenant ? `Code · ${tenant.code}` : "Not in a society"}
          delay={150}
        />
      </div>

      {/* ── Tabs: All members / Pending approvals ── */}
      <Tabs value={tab} onValueChange={switchTab}>
        <TabsList variant="line" className="gap-4">
          <TabsTrigger value="all" className="text-sm">
            All members
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-sm">
            Pending approvals
            {pending.data && pending.data.length > 0 && (
              <span className="ml-1.5 h-5 min-w-5 px-1.5 rounded-full nm-chip text-[10px] font-bold text-brand-primary flex items-center justify-center">
                {pending.data.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ══ All members ══ */}
        <TabsContent value="all" className="mt-4">
          <div className="nm-raised-lg rounded-3xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_150px] gap-3">
                <NmInput
                  icon={Search}
                  type="search"
                  placeholder="Search by name, email, or employee no…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="py-2.5"
                />
                <NmSelect
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="py-2.5"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="removed">Removed</option>
                </NmSelect>
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="nm-btn-primary inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white font-semibold text-sm px-4 py-2.5 hover:bg-brand-primary-hover transition-colors duration-200 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  Add member
                </button>
              )}
            </div>

            {/* Table */}
            <div className="px-4 pb-4">
              {list.isError && (
                <div className="pt-4">
                  <NmErrorBanner message="Could not load members. Check your connection and try again." />
                </div>
              )}

              {list.isLoading ? (
                <div className="flex flex-col gap-3 pt-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <NoRows message={search ? "No members match your search." : "No members yet."} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[38%]">Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((m) => (
                      <TableRow key={m.id} className="group">
                        <TableCell>
                          <Link href={`/admin/members/${m.id}`} className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-xs font-bold">
                                {initialsOf(m.user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {m.user.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {m.user.email}
                              </p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={m.role.code} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={m.membership_status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(m.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          {canManage ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl nm-chip transition-colors hover:text-foreground"
                                aria-label={`Actions for ${m.user.full_name}`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem render={<Link href={`/admin/members/${m.id}`} />}>
                                  <ExternalLink className="size-4" />
                                  View profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setRoleMember(m)}>
                                  <ShieldCheck className="size-4" />
                                  Change role
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusMember(m)}>
                                  <UserCog className="size-4" />
                                  Change status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Link
                              href={`/admin/members/${m.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                            >
                              View
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {!list.isLoading && total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{from}</span>–
                  <span className="font-semibold text-foreground">{to}</span> of{" "}
                  <span className="font-semibold text-foreground">{total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!list.data?.previous}
                    onClick={() => setPage((p) => p - 1)}
                    className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={!list.data?.next}
                    onClick={() => setPage((p) => p + 1)}
                    className="nm-chip inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ══ Pending approvals ══ */}
        <TabsContent value="pending" className="mt-4">
          <div className="nm-raised-lg rounded-3xl p-4">
            {pending.isLoading ? (
              <div className="flex flex-col gap-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                ))}
              </div>
            ) : pending.isError ? (
              <NmErrorBanner message="Could not load pending approvals." />
            ) : !pending.data || pending.data.length === 0 ? (
              <NoRows
                icon={<CheckCircle2 className="w-8 h-8 text-success" />}
                title="All caught up"
                message="There are no members waiting for approval right now."
              />
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {pending.data.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-3 px-1 flex-wrap sm:flex-nowrap">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-xs font-bold">
                        {initialsOf(m.user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/members/${m.id}`}
                        className="text-sm font-semibold text-foreground truncate hover:underline"
                      >
                        {m.user.full_name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.user.email} · joined {formatDate(m.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="nm-chip rounded-full px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                        {m.role.name}
                      </span>
                      <button
                        type="button"
                        disabled={approve.isPending}
                        onClick={() => approve.mutate(m.id)}
                        className="nm-btn-primary inline-flex items-center gap-1.5 rounded-xl bg-success/90 text-white font-semibold text-xs px-3 py-2 hover:bg-success transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {approve.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusMember(m)}
                        className="nm-chip inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/5 px-3 py-2"
                      >
                        More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Action surfaces ── */}
      <AddMemberSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
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
    </div>
  );
}

/* ─── Empty state ───────────────────────────────────────────────── */

function NoRows({
  title = "No members found",
  message,
  icon,
}: {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 gap-3">
      <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center">
        {icon ?? <Inbox className="w-8 h-8 text-muted-foreground/60" />}
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        {message && (
          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
}