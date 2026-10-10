"use client";

/**
 * NmDialog — neumorphic confirmation / action dialog.
 *
 * Wraps shadcn <Dialog> with the brand surface, a consistent
 * header, scrollable body, and a two-button footer (cancel + confirm).
 *
 * Usage:
 *   <NmDialog open={open} onClose={() => setOpen(false)}
 *     title="Approve Loan" confirmLabel="Approve"
 *     onConfirm={handleApprove} loading={isPending}>
 *     <p>Are you sure you want to approve this application?</p>
 *   </NmDialog>
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Called when confirm is clicked */
  onConfirm?: () => void;
  /** Show spinner on the confirm button */
  loading?: boolean;
  /** "primary" (blue) | "danger" (red) */
  variant?: "primary" | "danger";
  /** Hide the default footer (when the form provides its own submit) */
  hideFooter?: boolean;
  children: React.ReactNode;
}

export function NmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  loading = false,
  variant = "primary",
  hideFooter = false,
  children,
}: NmDialogProps) {
  const confirmBg =
    variant === "danger"
      ? "bg-destructive hover:bg-red-700"
      : "bg-brand-primary hover:bg-brand-primary-hover";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="nm-surface border-0 rounded-3xl p-0 overflow-hidden gap-0 max-w-md w-full"
        style={{
          boxShadow:
            "0 20px 60px rgba(15,23,42,0.18), 10px 10px 28px var(--nm-shadow-dark), -10px -10px 28px var(--nm-shadow-light)",
        }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-bold text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {!hideFooter && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 nm-surface">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="nm-btn-ghost rounded-xl px-5 py-2.5 text-sm font-semibold text-foreground disabled:opacity-50 border border-border"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                "nm-btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-colors duration-200",
                confirmBg
              )}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
