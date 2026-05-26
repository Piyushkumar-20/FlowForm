"use client";

import * as React from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, StarIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useSubmitForm, type Field } from "~/hooks/api/form";

type FieldValue = string | boolean | number | string[];

const SURFACE_BASE =
  "w-full rounded-[10px] border border-white/[0.1] bg-white/[0.04] text-[15px] text-white/90 placeholder:text-white/30 outline-none transition-all duration-200";
const SURFACE_FOCUS =
  "focus-visible:border-[rgba(29,158,117,0.6)] focus-visible:bg-[rgba(29,158,117,0.04)] focus-visible:ring-[3px] focus-visible:ring-[rgba(29,158,117,0.1)]";
const SURFACE_FOCUS_WITHIN =
  "focus-within:border-[rgba(29,158,117,0.6)] focus-within:bg-[rgba(29,158,117,0.04)] focus-within:ring-[3px] focus-within:ring-[rgba(29,158,117,0.1)]";
const INPUT_CLS = `h-12 px-4 ${SURFACE_BASE} ${SURFACE_FOCUS}`;

function evaluateConditions(
  conditions: Field["conditions"],
  values: Record<string, FieldValue>,
): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => {
    const fieldValue = values[c.fieldId];
    const strValue =
      fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : "";
    switch (c.operator) {
      case "equals":
        return strValue === c.value;
      case "not_equals":
        return strValue !== c.value;
      case "contains":
        return strValue.includes(c.value);
      case "is_empty":
        return (
          strValue === "" || fieldValue === undefined || fieldValue === null
        );
      case "is_not_empty":
        return (
          strValue !== "" && fieldValue !== undefined && fieldValue !== null
        );
      default:
        return true;
    }
  });
}

interface PublicFormRendererProps {
  formId: string;
  fields: Field[];
  preview?: boolean;
}

export function PublicFormRenderer({
  formId,
  fields,
  preview = false,
}: PublicFormRendererProps) {
  const {
    submitFormAsync,
    isPending,
    isSuccess,
    error: submitError,
  } = useSubmitForm();
  const [values, setValues] = React.useState<Record<string, FieldValue>>({});
  const [currentPage, setCurrentPage] = React.useState(1);

  const pages = React.useMemo(
    () =>
      [...new Set(fields.map((f) => f.page ?? 1))].sort((a, b) => a - b),
    [fields],
  );
  const totalPages = pages.length;
  const pageIndex = pages.indexOf(currentPage);

  const currentPageFields = React.useMemo(
    () =>
      fields
        .filter((f) => (f.page ?? 1) === currentPage)
        .filter((f) => evaluateConditions(f.conditions, values)),
    [fields, currentPage, values],
  );

  const updateValue = (fieldId: string, value: FieldValue) =>
    setValues((cur) => ({ ...cur, [fieldId]: value }));

  const toggleCheckboxOption = (fieldId: string, option: string) =>
    setValues((cur) => {
      const existing = Array.isArray(cur[fieldId]) ? (cur[fieldId] as string[]) : [];
      const next = existing.includes(option)
        ? existing.filter((o) => o !== option)
        : [...existing, option];
      return { ...cur, [fieldId]: next };
    });

  const isFieldEmpty = (field: Field): boolean => {
    const raw = values[field.id];
    if (raw === undefined || raw === null) return true;
    if (typeof raw === "string" && raw.trim() === "") return true;
    if (Array.isArray(raw) && raw.length === 0) return true;
    if (field.type === "RATING" && typeof raw === "number" && raw <= 0) return true;
    return false;
  };

  const validateCurrentPage = (): boolean => {
    for (const field of currentPageFields) {
      if (field.isRequired && isFieldEmpty(field)) {
        toast.error(`"${field.label}" is required`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentPage()) return;
    setCurrentPage(pages[pageIndex + 1]!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentPage(pages[pageIndex - 1]!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (preview) return;
    if (!validateCurrentPage()) return;

    const visibleFields = fields.filter((f) =>
      evaluateConditions(f.conditions, values),
    );
    const payload = visibleFields.map((field) => {
      const raw = values[field.id];
      let value: string | number | boolean | null;
      if (raw === undefined || raw === null) {
        value = null;
      } else if (Array.isArray(raw)) {
        value = raw.length > 0 ? JSON.stringify(raw) : null;
      } else if (typeof raw === "string" && raw === "") {
        value = null;
      } else {
        value = raw;
      }
      return { formFieldId: field.id, value };
    });

    try {
      await submitFormAsync({ formId, values: payload });
    } catch {
      // onError in useSubmitForm handles the toast
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div
          className="grid size-16 place-items-center rounded-full"
          style={{
            background: "rgba(29,158,117,0.1)",
            border: "1px solid rgba(29,158,117,0.3)",
          }}
        >
          <CheckIcon className="size-7" style={{ color: "#1d9e75" }} strokeWidth={2} />
        </div>
        <h2
          className="text-3xl text-white/90"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
          }}
        >
          You&apos;re all set
        </h2>
        <p className="max-w-[300px] text-sm leading-[1.6] text-white/40">
          Your response has been recorded. Thank you!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-5"
    >
      {/* Multi-page progress indicator */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>
            Step {pageIndex + 1} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            {pages.map((p) => (
              <span
                key={p}
                className="inline-block h-1 w-6 rounded-full transition-colors"
                style={{
                  background:
                    p === currentPage
                      ? "#1d9e75"
                      : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fields */}
      {currentPageFields.map((field) => {
        const fieldValue = values[field.id];
        const inputId = `field-${field.id}`;
        const options = field.options ?? [];

        return (
          <div key={field.id} className="flex flex-col gap-2">
            <Label
              htmlFor={inputId}
              className="flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-[0.04em] text-white/55"
            >
              <span className="normal-case">{field.label}</span>
              {field.isRequired ? (
                <span
                  className="inline-block size-[5px] rounded-full"
                  style={{ background: "#1d9e75" }}
                />
              ) : null}
            </Label>

            {field.description ? (
              <p className="text-xs leading-[1.5] text-white/35">
                {field.description}
              </p>
            ) : null}

            {field.type === "YES_NO" ? (
              <div
                className={`flex min-h-12 items-center gap-3 px-4 py-3 ${SURFACE_BASE} ${SURFACE_FOCUS_WITHIN}`}
              >
                <Checkbox
                  id={inputId}
                  checked={fieldValue === true}
                  onCheckedChange={(checked) =>
                    updateValue(field.id, checked === true)
                  }
                  className="data-[state=checked]:border-[#1d9e75] data-[state=checked]:bg-[#1d9e75]"
                />
                <Label
                  htmlFor={inputId}
                  className="cursor-pointer text-sm font-normal text-white/80"
                >
                  Yes
                </Label>
              </div>
            ) : field.type === "SELECT" ? (
              <Select
                value={typeof fieldValue === "string" ? fieldValue : ""}
                onValueChange={(v) => updateValue(field.id, v)}
              >
                <SelectTrigger
                  id={inputId}
                  className={`!h-12 w-full px-4 ${SURFACE_BASE} ${SURFACE_FOCUS}`}
                >
                  <SelectValue
                    placeholder={field.placeholder ?? "Choose an option…"}
                  />
                </SelectTrigger>
                <SelectContent className="border-white/[0.08] bg-[#1a1a1a] text-white/90">
                  {options.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-white/40">
                      No options configured
                    </div>
                  ) : (
                    options.map((opt) => (
                      <SelectItem
                        key={opt}
                        value={opt}
                        className="focus:bg-[rgba(29,158,117,0.12)] focus:text-[#1d9e75]"
                      >
                        {opt}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            ) : field.type === "CHECKBOX" ? (
              <div className="flex flex-col gap-2">
                {options.length === 0 ? (
                  <p className="rounded-[10px] border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white/40">
                    No options configured
                  </p>
                ) : (
                  options.map((opt) => {
                    const selected =
                      Array.isArray(fieldValue) && fieldValue.includes(opt);
                    const optId = `${inputId}-${opt}`;
                    return (
                      <div
                        key={opt}
                        className={`flex min-h-12 items-center gap-3 px-4 py-3 ${SURFACE_BASE} ${SURFACE_FOCUS_WITHIN}`}
                        style={
                          selected
                            ? {
                                background: "rgba(29,158,117,0.06)",
                                borderColor: "rgba(29,158,117,0.4)",
                              }
                            : undefined
                        }
                      >
                        <Checkbox
                          id={optId}
                          checked={selected}
                          onCheckedChange={() =>
                            toggleCheckboxOption(field.id, opt)
                          }
                          className="data-[state=checked]:border-[#1d9e75] data-[state=checked]:bg-[#1d9e75]"
                        />
                        <Label
                          htmlFor={optId}
                          className="cursor-pointer text-sm font-normal text-white/80"
                        >
                          {opt}
                        </Label>
                      </div>
                    );
                  })
                )}
              </div>
            ) : field.type === "RATING" ? (
              <div className={`flex items-center gap-2 px-4 py-3 ${SURFACE_BASE}`}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const current =
                    typeof fieldValue === "number" ? fieldValue : 0;
                  const active = star <= current;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateValue(field.id, star)}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      className="grid size-10 place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2"
                      style={{ color: active ? "#1d9e75" : "rgba(255,255,255,0.2)" }}
                    >
                      <StarIcon
                        className="size-7"
                        fill={active ? "currentColor" : "none"}
                        strokeWidth={1.5}
                      />
                    </button>
                  );
                })}
                {typeof fieldValue === "number" && fieldValue > 0 ? (
                  <span className="ml-auto text-sm text-white/40">
                    {fieldValue} / 5
                  </span>
                ) : null}
              </div>
            ) : field.type === "DATE" ? (
              <Input
                id={inputId}
                type="date"
                value={typeof fieldValue === "string" ? fieldValue : ""}
                required={field.isRequired}
                className={`${INPUT_CLS} [color-scheme:dark]`}
                onChange={(e) => updateValue(field.id, e.target.value)}
              />
            ) : (
              <Input
                id={inputId}
                type={
                  field.type === "NUMBER"
                    ? "number"
                    : field.type === "EMAIL"
                      ? "email"
                      : field.type === "PASSWORD"
                        ? "password"
                        : "text"
                }
                value={typeof fieldValue === "string" ? fieldValue : ""}
                placeholder={field.placeholder ?? undefined}
                required={field.isRequired}
                className={INPUT_CLS}
                onChange={(e) => updateValue(field.id, e.target.value)}
              />
            )}
          </div>
        );
      })}

      {/* Navigation / submit */}
      <div className={`flex gap-3 mt-1 ${totalPages > 1 ? "" : ""}` }>
        {totalPages > 1 && pageIndex > 0 ? (
          <Button
            type="button"
            onClick={handleBack}
            className="flex-1 h-[50px] rounded-[11px] text-[15px] font-medium"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
        ) : null}

        {totalPages > 1 && pageIndex < totalPages - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            className={`${pageIndex > 0 ? "flex-1" : "w-full"} h-[50px] rounded-[11px] text-[15px] font-medium`}
            style={{
              background: "rgba(29,158,117,0.12)",
              border: "1px solid rgba(29,158,117,0.35)",
              color: "#1d9e75",
            }}
          >
            Next
            <ArrowRightIcon className="size-4" strokeWidth={1.5} />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isPending || preview}
            className={`${totalPages > 1 && pageIndex > 0 ? "flex-1" : "w-full"} flex h-[50px] items-center justify-center gap-2 rounded-[11px] text-[15px] font-medium transition-colors hover:!brightness-110 disabled:!opacity-60`}
            style={{
              background: isPending
                ? "rgba(29,158,117,0.08)"
                : "rgba(29,158,117,0.12)",
              border: "1px solid rgba(29,158,117,0.35)",
              color: "#1d9e75",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isPending ? (
              <>
                <span
                  className="inline-block size-[18px] animate-spin rounded-full border-2"
                  style={{
                    borderColor: "rgba(29,158,117,0.2)",
                    borderTopColor: "#1d9e75",
                  }}
                />
                Submitting…
              </>
            ) : preview ? (
              "Submit form (preview only)"
            ) : (
              <>
                Submit form
                <ArrowRightIcon className="size-4" strokeWidth={1.5} />
              </>
            )}
          </Button>
        )}
      </div>

      {submitError ? (
        <p className="text-center text-[12px] font-medium text-rose-400">
          Submission failed. Please try again.
        </p>
      ) : null}

      {!preview ? (
        <p className="text-center text-[12px] text-white/15">
          Powered by{" "}
          <span style={{ color: "rgba(29,158,117,0.5)", fontWeight: 500 }}>
            FlowForm
          </span>
        </p>
      ) : null}
    </form>
  );
}
