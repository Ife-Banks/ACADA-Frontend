"use client";

/**
 * Screen 33 — Add Member (slide-over sheet)
 *
 * Used on the Members list page by SOCIETY_ADMIN.
 * Creates a new user + pending membership via POST /members/
 *
 * Fields: first name, last name, email, phone (optional),
 *         employee no (optional), department (optional).
 * The backend creates the user record and sets the membership
 * status to "pending" — the admin then approves separately.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, Hash, Building2 } from "lucide-react";
import { toast } from "sonner";
import { NmSheet } from "@/components/app/shared/NmSheet";
import {
  NmField,
  NmInput,
  NmErrorBanner,
  NmSubmitButton,
  NmDivider,
} from "@/components/app/shared/NmField";
import { createMember } from "@/lib/api/members";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import { useState } from "react";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  first_name:   z.string().min(1, "First name is required"),
  last_name:    z.string().min(1, "Last name is required"),
  email:        z.string().min(1, "Email is required").email("Enter a valid email"),
  phone:        z.string().optional(),
  employee_no:  z.string().optional(),
  department:   z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddMemberSheet({ open, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: createMember,
    onSuccess: (member) => {
      toast.success(`${member.user.full_name} added to the society.`);
      queryClient.invalidateQueries({ queryKey: qk.members.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages.join(" ")
          : "Failed to add member. Please try again."
      );
    },
  });

  function handleClose() {
    reset();
    setServerError(null);
    onClose();
  }

  return (
    <NmSheet
      open={open}
      onClose={handleClose}
      title="Add New Member"
      description="Creates an active membership. The member will receive a welcome email with instructions to set their password."
      footer={
        <NmSubmitButton
          form="add-member-form"
          loading={isPending}
          loadingText="Adding member…"
        >
          Add member
        </NmSubmitButton>
      }
    >
      <form
        id="add-member-form"
        onSubmit={handleSubmit((v) => mutate(v))}
        noValidate
        className="flex flex-col gap-5"
      >
        {serverError && <NmErrorBanner message={serverError} />}

        {/* ── Personal info ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Personal information
          </p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <NmField
                label="First name"
                error={errors.first_name?.message}
                required
              >
                <NmInput
                  icon={User}
                  type="text"
                  placeholder="Ade"
                  autoComplete="given-name"
                  error={!!errors.first_name}
                  {...register("first_name")}
                />
              </NmField>

              <NmField
                label="Last name"
                error={errors.last_name?.message}
                required
              >
                <NmInput
                  icon={User}
                  type="text"
                  placeholder="Balogun"
                  autoComplete="family-name"
                  error={!!errors.last_name}
                  {...register("last_name")}
                />
              </NmField>
            </div>

            <NmField label="Email address" error={errors.email?.message} required>
              <NmInput
                icon={Mail}
                type="email"
                placeholder="ade.balogun@university.edu.ng"
                autoComplete="email"
                error={!!errors.email}
                {...register("email")}
              />
            </NmField>

            <NmField
              label="Phone number"
              error={errors.phone?.message}
              hint="Optional — used for SMS notifications."
            >
              <NmInput
                icon={Phone}
                type="tel"
                placeholder="+234 801 234 5678"
                autoComplete="tel"
                {...register("phone")}
              />
            </NmField>
          </div>
        </div>

        <NmDivider />

        {/* ── Employment info ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Employment details{" "}
            <span className="normal-case font-normal text-muted-foreground/70">
              (optional — can be added later via profile)
            </span>
          </p>
          <div className="flex flex-col gap-4">
            <NmField label="Employee number" error={errors.employee_no?.message}>
              <NmInput
                icon={Hash}
                type="text"
                placeholder="EMP-00123"
                {...register("employee_no")}
              />
            </NmField>

            <NmField label="Department" error={errors.department?.message}>
              <NmInput
                icon={Building2}
                type="text"
                placeholder="Faculty of Engineering"
                {...register("department")}
              />
            </NmField>
          </div>
        </div>

        {/* Info tile */}
        <div
          className="nm-inset rounded-xl px-4 py-3 flex items-start gap-2.5"
        >
          <span className="text-brand-primary mt-0.5 shrink-0 text-sm">ℹ</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A welcome email will be sent with instructions for the member to
            set their password. The membership is created{" "}
            <span className="font-semibold text-foreground">active</span> —
            they can sign in as soon as they have their password.
          </p>
        </div>
      </form>
    </NmSheet>
  );
}
