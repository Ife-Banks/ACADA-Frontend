"use client";

/**
 * ApproveDividendDialog — approve a dividend declaration.
 *
 * Records AGM approval reference for a proposed declaration.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { NmDialog } from "@/components/app/shared/NmDialog";
import {
  NmField,
  NmInput,
  NmErrorBanner,
} from "@/components/app/shared/NmField";
import { approveDividendDeclaration } from "@/lib/api/contributions";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";

/* ─── Schema ───────────────────────────────────────────────────── */

const schema = z.object({
  agm_reference: z.string().min(1, "Enter AGM reference"),
});
type FormValues = z.infer<typeof schema>;

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  declarationId: string | null;
}

export function ApproveDividendDialog({ open, onClose, declarationId }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { agm_reference: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      approveDividendDeclaration(declarationId!, {
        agm_reference: values.agm_reference,
      }),
    onSuccess: () => {
      toast.success("Dividend declaration approved.");
      queryClient.invalidateQueries({ queryKey: qk.contributions.root });
      handleClose();
    },
    onError: (err) => {
      setServerError(
        err instanceof ApiError
          ? err.messages[0]
          : "Could not approve declaration. Please try again."
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
      open={open}
      onClose={handleClose}
      title="Approve Dividend Declaration"
      description="Record AGM approval to make entitlements payable."
      hideFooter
    >
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex flex-col gap-4"
        noValidate
      >
        <NmField
          label="AGM Reference"
          error={errors.agm_reference?.message}
          hint="Reference number or minutes from the Annual General Meeting"
          required
        >
          <NmInput
            placeholder="e.g. AGM-2026-001"
            {...register("agm_reference")}
          />
        </NmField>

        {serverError && <NmErrorBanner message={serverError} />}

        {/* Footer */}
        <div className="flex gap-3 pt-1">
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
            disabled={isPending || !declarationId}
            className="nm-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Approving…
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Approve
              </>
            )}
          </button>
        </div>
      </form>
    </NmDialog>
  );
}
