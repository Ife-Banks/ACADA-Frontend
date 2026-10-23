"use client";

/**
 * TenantBrandingForm — logo and colour theme for a society.
 * PATCH /platform/tenants/{id}/branding/
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Image, Palette, Save } from "lucide-react";
import {
  NmField,
  NmInput,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { updateTenantBranding } from "@/lib/api/tenants";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { TenantBranding } from "@/lib/types";
import { cn } from "@/lib/utils";

const HEX = /^#[0-9a-fA-F]{6}$/;

const schema = z.object({
  logo_url: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^https?:\/\/.+/.test(v),
      "Enter a full URL (http:// or https://)"
    ),
  primary_color: z.string().regex(HEX, "Enter a hex colour, e.g. #1a56db"),
  secondary_color: z.string().regex(HEX, "Enter a hex colour, e.g. #7e3af2"),
  app_name_override: z
    .string()
    .trim()
    .max(100, "Keep the app name under 100 characters"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  tenantId: string;
  branding: TenantBranding | null;
}

export function TenantBrandingForm({ tenantId, branding }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      logo_url: "",
      primary_color: "#1a56db",
      secondary_color: "#7e3af2",
      app_name_override: "",
    },
  });

  useEffect(() => {
    reset({
      logo_url: branding?.logo_url ?? "",
      primary_color: branding?.primary_color ?? "#1a56db",
      secondary_color: branding?.secondary_color ?? "#7e3af2",
      app_name_override: branding?.app_name_override ?? "",
    });
  }, [branding, reset]);

  const primary = watch("primary_color");
  const secondary = watch("secondary_color");

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      updateTenantBranding(tenantId, {
        logo_url: values.logo_url,
        primary_color: values.primary_color,
        secondary_color: values.secondary_color,
        app_name_override: values.app_name_override,
      }),
    onSuccess: () => {
      toast.success("Branding saved.");
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: qk.tenants.root });
      queryClient.invalidateQueries({ queryKey: qk.tenants.detail(tenantId) });
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages.join(" ")
          : "Could not save branding. Please try again."
      );
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutate(values))}
      className="flex flex-col gap-5"
      noValidate
    >
      <div>
        <h2 className="text-sm font-bold text-foreground">Branding</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Shown to this society&apos;s members throughout their portal.
        </p>
      </div>

      <NmField
        label="Logo URL"
        error={errors.logo_url?.message}
        hint="Optional — a square PNG or SVG works best."
      >
        <NmInput
          icon={Image}
          type="url"
          placeholder="https://cdn.example.com/logo.png"
          error={!!errors.logo_url}
          {...register("logo_url")}
        />
      </NmField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NmField label="Primary colour" error={errors.primary_color?.message} required>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Pick primary colour"
              value={HEX.test(primary) ? primary : "#1a56db"}
              onChange={(e) =>
                setValue("primary_color", e.target.value, { shouldDirty: true })
              }
              className="h-11 w-12 rounded-xl border border-border bg-transparent cursor-pointer shrink-0"
            />
            <NmInput
              placeholder="#1a56db"
              error={!!errors.primary_color}
              className="flex-1"
              {...register("primary_color")}
            />
          </div>
        </NmField>

        <NmField
          label="Secondary colour"
          error={errors.secondary_color?.message}
          required
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Pick secondary colour"
              value={HEX.test(secondary) ? secondary : "#7e3af2"}
              onChange={(e) =>
                setValue("secondary_color", e.target.value, { shouldDirty: true })
              }
              className="h-11 w-12 rounded-xl border border-border bg-transparent cursor-pointer shrink-0"
            />
            <NmInput
              placeholder="#7e3af2"
              error={!!errors.secondary_color}
              className="flex-1"
              {...register("secondary_color")}
            />
          </div>
        </NmField>
      </div>

      <NmField
        label="App name override"
        error={errors.app_name_override?.message}
        hint="Leave blank to use the platform name."
      >
        <NmInput
          icon={Palette}
          placeholder="e.g. ACADA Coop"
          error={!!errors.app_name_override}
          {...register("app_name_override")}
        />
      </NmField>

      {/* Live preview */}
      <div className="nm-inset rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
          Preview
        </p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background: HEX.test(primary) ? primary : "#1a56db" }}
            >
              AC
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {watch("app_name_override") || "Platform name"}
              </p>
              <p className="text-xs text-muted-foreground">
                {branding?.logo_url ? "Custom logo configured" : "No custom logo"}
              </p>
            </div>
          </div>
          <span
            className={cn("h-6 w-16 rounded-full")}
            style={{
              background: `linear-gradient(90deg, ${
                HEX.test(primary) ? primary : "#1a56db"
              }, ${HEX.test(secondary) ? secondary : "#7e3af2"})`,
            }}
          />
        </div>
      </div>

      {serverError && <NmErrorBanner message={serverError} />}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="nm-btn-primary inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Saving…" : "Save branding"}
        </button>
      </div>
    </form>
  );
}
