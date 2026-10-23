/**
 * Member and membership types.
 */

export type MembershipStatus = "pending" | "active" | "suspended" | "removed";
export type EmploymentStatus = "active" | "on_leave" | "retired" | "terminated";

export interface MemberProfile {
  id: string;
  employee_no: string;
  payroll_no: string;
  department: string;
  faculty: string;
  designation: string;
  employment_status: EmploymentStatus;
  date_of_birth: string | null;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  bank_name: string;
  bank_account_no: string;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  status: string;
  is_platform_user: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface MemberRole {
  code: string;
  name: string;
}

export interface Member {
  id: string;
  user: MemberUser;
  profile: MemberProfile | null;
  role: MemberRole;
  membership_status: MembershipStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

/**
 * The thin roster a plain member receives from `GET /members/`.
 *
 * The same endpoint returns the full `Member` record — profile, employee and
 * payroll numbers — only to the roles that manage members. Everyone else
 * gets this shape, so a member sees who is in their society without seeing
 * anybody else's institutional details.
 */
export interface MemberDirectory {
  id: string;
  user: MemberUser;
  role: MemberRole;
  membership_status: MembershipStatus;
  created_at: string;
}

/**
 * A member who can be named as a guarantor.
 *
 * Deliberately narrow — the loan application form only needs enough to
 * show and identify a person, so the roster's institutional details are
 * not part of it.
 */
export interface GuarantorCandidate {
  id: string;
  full_name: string;
  email: string;
  profile_id: string | null;
}

export interface CreateMemberPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_code?: string;
  employee_no?: string;
  payroll_no?: string;
  department?: string;
  faculty?: string;
  designation?: string;
}
