"use client";

/**
 * TenantSettingsForm — currency, locale, timezone, financial year and
 * notification policy for a society.
 * PATCH /platform/tenants/{id}/settings/
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Bell, CalendarDays, Coins, Globe2, Save } from "lucide-react";
import {
  NmField,
  NmInput,
  NmSelect,
  NmTextarea,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { updateTenantSettings } from "@/lib/api/tenants";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import type { TenantSettings } from "@/lib/types";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "GHS", "KES", "ZAR"];

const schema = z.object({
  currency: z.string().trim().min(3, "Use a 3-letter ISO code").max(3),
  timezone: z.string().trim().min(1, "Enter a timezone"),
  locale: z.string().trim().min(2, "Enter a locale"),
  financial_year_start_month: z.string().regex(/^(1[0-2]|[1-9])$/, "Pick a month"),
  notification_policy: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      try {
        const parsed = JSON.parse(value);
        return (
          typeof parsed === "object" &&
          parsed !== null &&
          !Array.isArray(parsed)
        );
      } catch {
        return false;
      }
    }, "Enter a valid JSON object"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  tenantId: string;
  settings: TenantSettings | null;
}

export function TenantSettingsForm({ tenantId, settings }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "NGN",
      timezone: "Africa/Lagos",
      locale: "en-NG",
      financial_year_start_month: "1",
      notification_policy: "{}",
    },
  });

  useEffect(() => {
    reset({
      currency: (settings?.currency ?? "NGN").toUpperCase(),
      timezone: settings?.timezone ?? "Africa/Lagos",
      locale: settings?.locale ?? "en-NG",
      financial_year_start_month: String(
        settings?.financial_year_start_month ?? 1
      ),
      notification_policy: JSON.stringify(
        settings?.notification_policy ?? {},
        null,
        2
      ),
    });
  }, [settings, reset]);

  /*
   * Keep an existing non-standard currency selectable. Replacing it with the
   * first hard-coded option would silently change the society's currency on
   * the next unrelated save.
   */
  const currentCurrency = settings?.currency?.toUpperCase();
  const currencyOptions =
    currentCurrency && !CURRENCIES.includes(currentCurrency)
      ? [currentCurrency, ...CURRENCIES]
      : CURRENCIES;

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      updateTenantSettings(tenantId, {
        currency: values.currency.toUpperCase(),
        timezone: values.timezone,
        locale: values.locale,
        financial_year_start_month: Number(values.financial_year_start_month),
        notification_policy: values.notification_policy
          ? JSON.parse(values.notification_policy)
          : {},
      }),
    onSuccess: () => {
      toast.success("Society settings saved.");
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: qk.tenants.root });
      queryClient.invalidateQueries({ queryKey: qk.tenants.detail(tenantId) });
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages.join(" ")
          : "Could not save settings. Please try again."
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
        <h2 className="text-sm font-bold text-foreground">Society settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Currency, locale and financial calendar used across the portal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NmField label="Currency" error={errors.currency?.message} required>
          <NmSelect
            icon={Coins}
            error={!!errors.currency}
            {...register("currency")}
          >
            {currencyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NmSelect>
        </NmField>

        <NmField label="Timezone" error={errors.timezone?.message} required>
          <NmInput
            icon={Globe2}
            placeholder="Africa/Lagos"
            error={!!errors.timezone}
            {...register("timezone")}
          />
        </NmField>

        <NmField label="Locale" error={errors.locale?.message} required>
          <NmInput
            placeholder="en-NG"
            error={!!errors.locale}
            {...register("locale")}
          />
        </NmField>
      </div>

      <NmField
        label="Financial year starts"
        error={errors.financial_year_start_month?.message}
        required
      >
        <NmSelect
          icon={CalendarDays}
          error={!!errors.financial_year_start_month}
          {...register("financial_year_start_month")}
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {new Date(2000, m - 1, 1).toLocaleString("en", {
                month: "long",
              })}
            </option>
          ))}
        </NmSelect>
      </NmField>

      <NmField
        label="Notification policy (JSON)"
        error={errors.notification_policy?.message}
        hint='Optional JSON object, e.g. {"membership.approved": ["in_app", "email"]}.'
      >
        <NmTextarea
          rows={6}
          placeholder="{}"
          spellCheck={false}
          className="font-mono text-xs"
          error={!!errors.notification_policy}
          {...register("notification_policy")}
        />
      </NmField>

      <div className="nm-inset rounded-xl px-4 py-3 flex items-start gap-2.5">
        <Bell className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Notification policies are stored as-is. Leave the object empty to use
          platform defaults.
        </p>
      </div>

      {serverError && <NmErrorBanner message={serverError} />}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="nm-btn-primary inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
