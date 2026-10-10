"use client";

/**
 * NmStepSheet — multi-step slide-over panel.
 *
 * Renders a step indicator bar at the top, a scrollable body for
 * the current step, and prev/next/submit navigation in the footer.
 * The parent controls which step is active and handles submission.
 *
 * Usage:
 *   <NmStepSheet open={open} onClose={...}
 *     title="Apply for Loan"
 *     steps={["Product", "Details", "Guarantors", "Review"]}
 *     currentStep={step}
 *     onBack={() => setStep(s => s - 1)}
 *     onNext={() => setStep(s => s + 1)}
 *     onSubmit={handleSubmit}
 *     loading={isPending}>
 *     {step === 0 && <StepOne />}
 *     {step === 1 && <StepTwo />}
 *   </NmStepSheet>
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronLeft, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NmStepSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  steps: string[];
  currentStep: number;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  /** Disable the Next/Submit button (e.g. while the step form is invalid) */
  nextDisabled?: boolean;
  width?: string;
  children: React.ReactNode;
}

export function NmStepSheet({
  open,
  onClose,
  title,
  steps,
  currentStep,
  onBack,
  onNext,
  onSubmit,
  loading = false,
  nextDisabled = false,
  width = "sm:max-w-xl",
  children,
}: NmStepSheetProps) {
  const isFirst = currentStep === 0;
  const isLast  = currentStep === steps.length - 1;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className={cn("flex flex-col gap-0 p-0 border-l-0 nm-surface", width)}
        style={{
          boxShadow:
            "-8px 0 32px rgba(15,23,42,0.12), -2px 0 8px rgba(15,23,42,0.06)",
        }}
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-0 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <SheetTitle className="text-lg font-bold text-foreground">
              {title}
            </SheetTitle>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              style={{ boxShadow: "var(--nm-raised)" }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-5">
            {steps.map((label, i) => {
              const done    = i < currentStep;
              const active  = i === currentStep;
              const isLast  = i === steps.length - 1;

              return (
                <div key={label} className="flex items-center flex-1 min-w-0">
                  {/* Circle */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                        done
                          ? "bg-success text-white"
                          : active
                          ? "bg-brand-primary text-white"
                          : "text-muted-foreground"
                      )}
                      style={{
                        boxShadow: active
                          ? "0 0 0 4px rgba(26,86,219,0.2), var(--nm-raised)"
                          : "var(--nm-raised)",
                        background: done
                          ? "var(--success)"
                          : active
                          ? "var(--brand-primary)"
                          : "var(--nm-bg)",
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] mt-1 font-medium whitespace-nowrap",
                        active ? "text-brand-primary" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </div>

                  {/* Connector */}
                  {!isLast && (
                    <div
                      className="flex-1 h-px mx-1 transition-all duration-500"
                      style={{
                        background: done
                          ? "var(--success)"
                          : "var(--border)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom border */}
          <div className="border-b border-border -mx-6" />
        </SheetHeader>

        {/* Scrollable step body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer nav */}
        <div className="px-6 py-4 border-t border-border shrink-0 nm-surface flex items-center justify-between gap-3">
          {!isFirst ? (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="nm-btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground flex items-center gap-1.5 border border-border disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={isLast ? onSubmit : onNext}
            disabled={loading || nextDisabled}
            className="nm-btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-colors duration-200"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLast ? "Submit" : "Continue"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
