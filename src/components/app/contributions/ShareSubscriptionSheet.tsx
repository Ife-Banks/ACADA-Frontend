"use client";

/**
 * ShareSubscriptionSheet — subscribe to a share product.
 *
 * Allows members to select a share product and specify units.
 * Officers can subscribe on behalf of a member.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Share2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { NmSheet } from "@/components/app/shared/NmSheet";
import {
  NmField,
  NmInput,
  NmSelect,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { useAllShareProducts } from "@/hooks/useContributions";
import { createShareholding } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  product: z.string().min(1, "Select a share product"),
  units: z.string().regex(/^\d+$/, "Enter a whole number of units"),
});
type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  memberProfileId?: string; // For officer subscribing on behalf
}

export function ShareSubscriptionSheet({ open, onClose, memberProfileId }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const products = useAllShareProducts();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { product: "", units: "1" },
  });

  const selectedProductId = watch("product");
  const selectedProduct = products.data?.find((p) => p.id === selectedProductId);

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      createShareholding({
        product: values.product,
        units: parseInt(values.units, 10),
        member_profile: memberProfileId,
      }),
    onSuccess: () => {
      toast.success("Share subscription created.");
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not create subscription. Please try again."
      );
    },
  });

  function handleClose() {
    setServerError(null);
    reset();
    onClose();
  }

  const activeProducts = (products.data ?? []).filter((p) => p.is_active);

  return (
    <NmSheet
      open={open}
      onClose={handleClose}
      title="Subscribe to Shares"
      description="Invest in a share product to earn dividends."
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="nm-btn-ghost flex-1 rounded-xl py-2.5 text-sm font-semibold text-foreground border border-border disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="share-subscribe-form"
            disabled={isPending || !selectedProduct}
            className="nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Subscribing…
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Subscribe
              </>
            )}
          </button>
        </div>
      }
    >
      <form
        id="share-subscribe-form"
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        <NmField label="Share product" error={errors.product?.message} required>
          <NmSelect {...register("product")} className="py-2.5">
            <option value="">Select a product</option>
            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₦{parseFloat(p.price_per_unit).toLocaleString("en-NG")}/unit
              </option>
            ))}
          </NmSelect>
        </NmField>

        {selectedProduct && (
          <div className="nm-raised-lg rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unit price</span>
              <span className="font-semibold text-foreground">
                ₦{parseFloat(selectedProduct.price_per_unit).toLocaleString("en-NG")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Min units</span>
              <span className="font-semibold text-foreground">{selectedProduct.min_units}</span>
            </div>
            {selectedProduct.max_units && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max units</span>
                <span className="font-semibold text-foreground">{selectedProduct.max_units}</span>
              </div>
            )}
            {selectedProduct.authorized_units && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Authorized</span>
                <span className="font-semibold text-foreground">{selectedProduct.authorized_units}</span>
              </div>
            )}
          </div>
        )}

        <NmField
          label="Number of units"
          error={errors.units?.message}
          hint={
            selectedProduct
              ? `Between ${selectedProduct.min_units} and ${selectedProduct.max_units ?? "unlimited"} units`
              : undefined
          }
          required
        >
          <NmInput
            type="number"
            min={selectedProduct?.min_units ?? 1}
            max={selectedProduct?.max_units ?? undefined}
            {...register("units")}
          />
        </NmField>

        {selectedProduct && watch("units") && (
          <div className="nm-raised-lg rounded-2xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total investment</span>
              <span className="font-bold text-brand-primary text-lg">
                ₦{(
                  parseInt(watch("units") || "0", 10) *
                  parseFloat(selectedProduct.price_per_unit)
                ).toLocaleString("en-NG")}
              </span>
            </div>
          </div>
        )}

        {serverError && <NmErrorBanner message={serverError} />}
      </form>
    </NmSheet>
  );
}
