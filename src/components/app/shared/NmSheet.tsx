"use client";

/**
 * NmSheet — neumorphic slide-over panel.
 *
 * A thin wrapper around shadcn <Sheet> that applies the neumorphic
 * surface, a consistent header layout, and the brand shadow.
 *
 * Usage:
 *   <NmSheet open={open} onClose={() => setOpen(false)}
 *     title="Add Member" description="Fill in the details below.">
 *     <YourFormContent />
 *   </NmSheet>
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NmSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  side?: "right" | "left" | "top" | "bottom";
  /** Extra width class, e.g. "sm:max-w-xl" */
  width?: string;
  children: React.ReactNode;
  /** Slot rendered in the footer area (usually action buttons) */
  footer?: React.ReactNode;
}

export function NmSheet({
  open,
  onClose,
  title,
  description,
  side = "right",
  width = "sm:max-w-lg",
  children,
  footer,
}: NmSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side={side}
        className={cn(
          "flex flex-col gap-0 p-0 border-l-0 nm-surface",
          width
        )}
        style={{
          boxShadow:
            "-8px 0 32px rgba(15,23,42,0.12), -2px 0 8px rgba(15,23,42,0.06)",
        }}
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-sm text-muted-foreground mt-0.5">
                  {description}
                </SheetDescription>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0"
              style={{ boxShadow: "var(--nm-raised)" }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border shrink-0 nm-surface">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
