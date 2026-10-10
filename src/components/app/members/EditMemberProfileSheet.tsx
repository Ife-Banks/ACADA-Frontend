"use client";

/**
 * EditMemberProfileSheet — admin edits a member's tenant-specific profile.
 *
 * Calls PATCH /members/{id}/profile/ (EXECUTIVE+ only).
 * Covers employment/payroll, identification, and bank details per the
 * MemberProfileSerializer field set.
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Hash,
  Building2,
  ShieldCheck,
  CalendarDays,
  Landmark,
  HeartHandshake,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { NmSheet } from "@/components/app/shared/NmSheet";
import {
  NmField,
  NmInput,
  NmSelect,
  NmErrorBanner,
  NmSubmitButton,
  NmDivider,
} from "@/components/app/shared/NmField";
import { updateMemberProfile } from "@/lib/api/members";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import type { MemberProfile } from "@/lib/types";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  employee_no: z.string().optional(),
  payroll_no: z.string().optional(),
  department: z.string().optional(),
  faculty: z.string().optional(),
  designation: z.string().optional(),
  employment_status: z.enum(["active", "on_leave", "retired", "terminated"]),
  date_of_birth: z.string().optional(),
  next_of_kin_name: z.string().optional(),
  next_of_kin_phone: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_no: z.string().optional(),
  joined_at: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function toFormValue(profile: MemberProfile | null): FormValues {
  if (!profile) {
    return {
      employment_status: "active",
      date_of_birth: "",
      joined_at: "",
    };
  }
  return {
    employee_no: profile.employee_no ?? "",
    payroll_no: profile.payroll_no ?? "",
    department: profile.department ?? "",
    faculty: profile.faculty ?? "",
    designation: profile.designation ?? "",
    employment_status: profile.employment_status,
    date_of_birth: profile.date_of_birth ?? "",
    next_of_kin_name: profile.next_of_kin_name ?? "",
    next_of_kin_phone: profile.next_of_kin_phone ?? "",
    bank_name: profile.bank_name ?? "",
    bank_account_no: profile.bank_account_no ?? "",
    joined_at: profile.joined_at ?? "",
  };
}

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  memberId: string;
  profile: MemberProfile | null;
  memberName: string;
}

export function EditMemberProfileSheet({
  open,
  onClose,
  memberId,
  profile,
  memberName,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValue(profile),
  });

  /* Prefill whenever the sheet opens (profile may have loaded by then) */
  useEffect(() => {
    if (open) reset(toFormValue(profile));
  }, [open, profile, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => updateMemberProfile(memberId, values),
    onSuccess: () => {
      toast.success(`${memberName}'s profile updated.`);
      queryClient.invalidateQueries({ queryKey: qk.members.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages.join(" ")
          : "Could not save the profile. Please try again."
      );
    },
  });

  function handleClose() {
    setServerError(null);
    onClose();
  }

  return (
    <NmSheet
      open={open}
      onClose={handleClose}
      title="Edit Member Profile"
      description={`Update employment, payroll, and bank details for ${memberName}.`}
      footer={
        <NmSubmitButton
          form="edit-profile-form"
          loading={isPending || isSubmitting}
          loadingText="Saving…"
        >
          Save profile
        </NmSubmitButton>
      }
    >
      <form
        id="edit-profile-form"
        onSubmit={handleSubmit((v) => mutate(v))}
        noValidate
        className="flex flex-col gap-5"
      >
        {serverError && <NmErrorBanner message={serverError} />}

        {/* ── Employment & payroll ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Employment & payroll
          </p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <NmField label="Employee number" error={errors.employee_no?.message}>
                <NmInput
                  icon={Hash}
                  type="text"
                  placeholder="EMP-00123"
                  {...register("employee_no")}
                />
              </NmField>
              <NmField label="Payroll number" error={errors.payroll_no?.message}>
                <NmInput
                  icon={Hash}
                  type="text"
                  placeholder="PAY-00456"
                  {...register("payroll_no")}
                />
              </NmField>
            </div>

            <NmField label="Department" error={errors.department?.message}>
              <NmInput
                icon={Building2}
                type="text"
                placeholder="Faculty of Engineering"
                {...register("department")}
              />
            </NmField>

            <div className="grid grid-cols-2 gap-4">
              <NmField label="Faculty" error={errors.faculty?.message}>
                <NmInput
                  icon={Building2}
                  type="text"
                  placeholder="Faculty of Sciences"
                  {...register("faculty")}
                />
              </NmField>
              <NmField label="Designation" error={errors.designation?.message}>
                <NmInput
                  icon={ShieldCheck}
                  type="text"
                  placeholder="Senior Lecturer"
                  {...register("designation")}
                />
              </NmField>
            </div>

            <NmField label="Employment status" error={errors.employment_status?.message} required>
              <NmSelect {...register("employment_status")}>
                <option value="active">Active</option>
                <option value="on_leave">On leave</option>
                <option value="retired">Retired</option>
                <option value="terminated">Terminated</option>
              </NmSelect>
            </NmField>

            <div className="grid grid-cols-2 gap-4">
              <NmField label="Date of birth" error={errors.date_of_birth?.message}>
                <NmInput
                  icon={CalendarDays}
                  type="date"
                  {...register("date_of_birth")}
                />
              </NmField>
              <NmField
                label="Member since"
                error={errors.joined_at?.message}
                hint="When they joined the society."
              >
                <NmInput
                  icon={CalendarDays}
                  type="date"
                  {...register("joined_at")}
                />
              </NmField>
            </div>
          </div>
        </div>

        <NmDivider />

        {/* ── Emergency & banking ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Emergency & banking
          </p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <NmField label="Next of kin" error={errors.next_of_kin_name?.message}>
                <NmInput
                  icon={HeartHandshake}
                  type="text"
                  placeholder="Full name"
                  {...register("next_of_kin_name")}
                />
              </NmField>
              <NmField label="Next of kin phone" error={errors.next_of_kin_phone?.message}>
                <NmInput
                  icon={Phone}
                  type="tel"
                  placeholder="+234 801 234 5678"
                  {...register("next_of_kin_phone")}
                />
              </NmField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NmField label="Bank name" error={errors.bank_name?.message}>
                <NmInput
                  icon={Landmark}
                  type="text"
                  placeholder="e.g. GTBank"
                  {...register("bank_name")}
                />
              </NmField>
              <NmField label="Account number" error={errors.bank_account_no?.message}>
                <NmInput
                  icon={Landmark}
                  type="text"
                  placeholder="0012345678"
                  inputMode="numeric"
                  maxLength={10}
                  {...register("bank_account_no")}
                />
              </NmField>
            </div>
          </div>
        </div>

        {/* Info tile */}
        <div className="nm-inset rounded-xl px-4 py-3 flex items-start gap-2.5">
          <span className="text-brand-primary mt-0.5 shrink-0 text-sm">ℹ</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            These details feed payroll deduction schedules and loan guarantee
            checks. Only society officers can edit them.
          </p>
        </div>
      </form>
    </NmSheet>
  );
}