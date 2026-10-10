/**
 * Schedule domain types — bursary deduction schedule batches and line items.
 */

export type BatchType = "deduction" | "repayment" | "combined";
export type BatchStatus = "draft" | "finalized" | "exported" | "submitted";

export interface ScheduleLine {
  id: string;
  member_profile: string;
  member_name: string;
  employee_no: string;
  payroll_no: string;
  contribution_amount: string;
  repayment_amount: string;
  penalty_amount: string;
  total_amount: string;
}

export interface ScheduleBatch {
  id: string;
  cycle: string | null;
  cycle_display: string | null;
  batch_type: BatchType;
  status: BatchStatus;
  generated_by: string | null;
  generated_by_name: string | null;
  total_amount: string;
  member_count: number;
  notes: string;
  file_url: string;
  created_at: string;
}

export interface ScheduleBatchDetail extends ScheduleBatch {
  lines: ScheduleLine[];
}

export interface GenerateSchedulePayload {
  cycle_id: string;
  batch_type?: BatchType;
}
