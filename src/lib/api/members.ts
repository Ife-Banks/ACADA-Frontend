/**
 * Members API — list, create, detail, profile, role, status.
 */

import { api } from "./client";
import type {
  Member,
  CreateMemberPayload,
  MemberProfile,
  GuarantorCandidate,
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types";

export async function getMembers(params?: PaginationParams) {
  /* The full member record — profile included — is returned only to the
     roles that manage members (SOCIETY_ADMIN, EXECUTIVE). A plain member
     receives the thin directory instead; see `MemberDirectory`. The roster
     screen is the only consumer, and it is society-admin only. */
  return api.get<PaginatedResponse<Member>>("/members/", params);
}

/**
 * Members who can be named as a guarantor.
 *
 * A narrow, self-scoped list: id, name, email and the profile id the API
 * expects. A member picking a guarantor does not — and should not — be
 * handed the whole roster with everybody's employee and payroll numbers.
 */
export async function getGuarantorCandidates() {
  return api.get<GuarantorCandidate[]>("/members/guarantor-candidates/");
}

/**
 * Fetch every member across all pages.
 *
 * The roster screen needs the full set to count statuses and filter locally,
 * so it loads every page rather than one. The API also supports `search=`
 * (name, email, employee number, payroll number) and `status=` / `role=`
 * filters for callers that want the server to do the narrowing.
 *
 * Do not use this from the member portal — a plain member is served the
 * directory (names and email only) by `GET /members/`, and the guarantor
 * picker uses `getGuarantorCandidates` instead.
 */
export async function getAllMembers(pageSize = 100, maxPages = 50) {
  const all: Member[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const res = await getMembers({ page, page_size: pageSize });
    all.push(...res.results);
    if (!res.next) break;
  }

  return all;
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
  status: "active" | "suspended" | "removed",
  reason?: string
) {
  return api.patch<Member>(`/members/${id}/status/`, {
    status,
    ...(reason ? { reason } : {}),
  });
}
