"use client";

/**
 * CreateTenantDialog — onboard a new cooperative society.
 *
 * POST /platform/tenants/ creates the tenant together with default branding
 * and settings. On success we jump straight to the detail screen so the
 * platform admin can finish configuration.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmField,
  NmInput,
  NmTextarea,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { createTenant } from "@/lib/api/tenants";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Enter a society code")
    .max(50, "Code is too long")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(2, "Enter the society name"),
  institution_name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  primary_contact_email: z
    .string()
    .trim()
    .min(1, "Enter a contact email")
    .email("Enter a valid email address"),
  primary_contact_phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateTenantDialog({ open, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      institution_name: "",
      description: "",
      primary_contact_email: "",
      primary_contact_phone: "",
      address: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      createTenant({
        code: values.code.toLowerCase(),
        name: values.name,
        description: values.description || undefined,
        primary_contact_email: values.primary_contact_email,
        primary_contact_phone: values.primary_contact_phone || undefined,
        institution_name: values.institution_name || undefined,
        address: values.address || undefined,
      }),
    onSuccess: (tenant) => {
      toast.success(`${tenant.name} created.`);
      queryClient.invalidateQueries({ queryKey: qk.tenants.root });
      queryClient.invalidateQueries({ queryKey: qk.reports.platformStats });
      reset();
      setServerError(null);
      onClose();
      // The create serializer's response omits `id`, so return to the list
      // (which is invalidated above) instead of guessing a detail URL.
      router.push("/platform/tenants");
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages.join(" ")
          : "Could not create the society. Please try again."
      );
    },
  });

  function handleClose() {
    setServerError(null);
    reset();
    onClose();
  }

  return (
    <NmDialog
      className="platform-dialog"
      open={open}
      onClose={handleClose}
      title="Onboard a society"
      description="Creates the tenant with default branding and settings."
      confirmLabel={isPending ? "Creating…" : "Create society"}
      onConfirm={handleSubmit((values) => mutate(values))}
      loading={isPending}
    >
      <form
        onSubmit={handleSubmit((values) => mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NmField label="Society code" error={errors.code?.message} required>
            <NmInput
              icon={Building2}
              placeholder="e.g. acada"
              autoCapitalize="none"
              spellCheck={false}
              error={!!errors.code}
              {...register("code")}
            />
          </NmField>
          <NmField label="Society name" error={errors.name?.message} required>
            <NmInput
              placeholder="e.g. ACADA Cooperative"
              error={!!errors.name}
              {...register("name")}
            />
          </NmField>
        </div>

        <NmField
          label="Institution"
          error={errors.institution_name?.message}
          hint="Optional — the parent university or organisation."
        >
          <NmInput
            placeholder="e.g. University of Ibadan"
            error={!!errors.institution_name}
            {...register("institution_name")}
          />
        </NmField>

        <NmField label="Description" error={errors.description?.message}>
          <NmTextarea
            rows={2}
            placeholder="A short description of the society."
            error={!!errors.description}
            {...register("description")}
          />
        </NmField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NmField
            label="Contact email"
            error={errors.primary_contact_email?.message}
            required
          >
            <NmInput
              icon={Mail}
              type="email"
              placeholder="admin@society.org"
              error={!!errors.primary_contact_email}
              {...register("primary_contact_email")}
            />
          </NmField>
          <NmField
            label="Contact phone"
            error={errors.primary_contact_phone?.message}
          >
            <NmInput
              icon={Phone}
              type="tel"
              placeholder="+234 800 000 0000"
              error={!!errors.primary_contact_phone}
              {...register("primary_contact_phone")}
            />
          </NmField>
        </div>

        <NmField label="Address" error={errors.address?.message}>
          <NmTextarea
            rows={2}
            placeholder="Society office address."
            error={!!errors.address}
            {...register("address")}
          />
        </NmField>

        <div className="nm-inset rounded-xl px-4 py-3 flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            After creation, configure branding, currency, rules, and a default
            contribution plan before inviting members.
          </p>
        </div>

        {serverError && <NmErrorBanner message={serverError} />}
      </form>
    </NmDialog>
  );
}
