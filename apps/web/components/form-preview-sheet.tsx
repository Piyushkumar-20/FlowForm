"use client";

import * as React from "react";
import { EyeIcon } from "lucide-react";

import { PublicFormRenderer } from "~/components/public-form-renderer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { Field } from "~/hooks/api/form";

interface FormPreviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string | null;
  description?: string | null;
  fields: Field[];
}

export function FormPreviewSheet({
  open,
  onOpenChange,
  title,
  description,
  fields,
}: FormPreviewSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-none bg-[#0d0d0d] p-0 sm:max-w-[540px]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Preview banner */}
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-white/[0.06] bg-[#0d0d0d]/95 px-6 py-3 backdrop-blur">
          <EyeIcon className="size-4 text-[#1d9e75]" />
          <span className="text-xs font-medium tracking-wide text-[#1d9e75]">
            Preview Mode — responses won&apos;t be saved
          </span>
        </div>

        <div className="px-6 py-10" style={{ color: "#e5e5e5" }}>
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
            rel="stylesheet"
          />

          <SheetHeader className="mb-6 text-left">
            <SheetTitle
              className="text-3xl leading-[1.1] tracking-tight text-white/90"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {title ?? "Untitled form"}
            </SheetTitle>
            {description ? (
              <p className="mt-1 text-[14px] leading-[1.5] text-white/35">{description}</p>
            ) : null}
          </SheetHeader>

          <div
            className="mb-7 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(29,158,117,0.2) 60%, transparent)",
            }}
          />

          {fields.length === 0 ? (
            <p className="rounded-[10px] border border-white/[0.06] bg-white/[0.04] px-4 py-5 text-sm text-white/40">
              No fields yet — add some in the builder.
            </p>
          ) : (
            <PublicFormRenderer formId="" fields={fields} preview />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
