/**
 * Members API — list, create, detail, profile, role, status.
 */

import { api } from "./client";
import type {
  Member,
  CreateMemberPayload,
  MemberProfile,
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types";

export async function getMembers(params?: PaginationParams) {
  return api.get<PaginatedResponse<Member>>("/members/", params);
}

export async function getMember(id: string) {
  return api.get<Member>(`/members/${id}/`);
}

export async function createMember(payload: CreateMemberPayload) {
  return api.post<Member>("/members/", payload);
}

export async function getPendingMembers() {
  return api.get<Member[]>("/members/pending/");
}

export async function getMemberProfile(id: string) {
  return api.get<MemberProfile>(`/members/${id}/profile/`);
}

export async function updateMemberProfile(id: string, payload: Partial<MemberProfile>) {
  return api.patch<MemberProfile>(`/members/${id}/profile/`, payload);
}

export async function updateMemberRole(id: string, role_code: string) {
  return api.put<Member>(`/members/${id}/role/`, { role_code });
}

export async function updateMemberStatus(
  id: string,
  status: "active" | "suspended" | "removed"
) {
  return api.patch<Member>(`/members/${id}/status/`, { status });
}
