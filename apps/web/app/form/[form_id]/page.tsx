"use client";

import * as React from "react";
import { ArrowRightIcon, CheckIcon, StarIcon } from "lucide-react";
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
import { useGetForm, useSubmitForm } from "~/hooks/api/form";

// In-memory value type — wider than the submission payload so we can
// hold multi-selects and ratings before serializing.
type FieldValue = string | boolean | number | string[];

/* ─────────────────────────────────────────────────────────────────────
 * Teal SaaS theme tokens
 *   accent       : #1d9e75
 *   accent deep  : #0b5c47
 *   accent dark  : #0f6e56
 * Surfaces sit directly on #0d0d0d — no glass card.
 * ─────────────────────────────────────────────────────────────────── */
const SURFACE_BASE =
  "w-full rounded-[10px] border border-white/[0.1] bg-white/[0.04] text-[15px] text-white/90 placeholder:text-white/30 outline-none transition-all duration-200";
const SURFACE_FOCUS =
  "focus-visible:border-[rgba(29,158,117,0.6)] focus-visible:bg-[rgba(29,158,117,0.04)] focus-visible:ring-[3px] focus-visible:ring-[rgba(29,158,117,0.1)]";
const SURFACE_FOCUS_WITHIN =
  "focus-within:border-[rgba(29,158,117,0.6)] focus-within:bg-[rgba(29,158,117,0.04)] focus-within:ring-[3px] focus-within:ring-[rgba(29,158,117,0.1)]";
const INPUT_CLS = `h-12 px-4 ${SURFACE_BASE} ${SURFACE_FOCUS}`;

export default function PublicFormPage({ params }: { params: Promise<{ form_id: string }> }) {
  const { form_id: formId } = React.use(params);
  const { form, isLoading, error } = useGetForm(formId);
  const { submitFormAsync, isPending, isSuccess, error: submitError } = useSubmitForm();
  const [values, setValues] = React.useState<Record<string, FieldValue>>({});

  const fields = form?.fields ?? [];

  const updateValue = (fieldId: string, value: FieldValue) => {
    setValues((current) => ({ ...current, [fieldId]: value }));
  };

  const toggleCheckboxOption = (fieldId: string, option: string) => {
    setValues((current) => {
      const existing = Array.isArray(current[fieldId]) ? (current[fieldId] as string[]) : [];
      const next = existing.includes(option)
        ? existing.filter((o) => o !== option)
        : [...existing, option];
      return { ...current, [fieldId]: next };
    });
  };

  const isFieldEmpty = (field: (typeof fields)[number]): boolean => {
    const raw = values[field.id];
    if (raw === undefined || raw === null) return true;
    if (typeof raw === "string" && raw.trim() === "") return true;
    if (Array.isArray(raw) && raw.length === 0) return true;
    if (field.type === "RATING" && typeof raw === "number" && raw <= 0) return true;
    if (field.type === "YES_NO" && raw === false) return false;
    return false;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    for (const field of fields) {
      if (field.isRequired && isFieldEmpty(field)) {
        toast.error(`"${field.label}" is required`);
        return;
      }
    }

    const payload = fields.map((field) => {
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

    await submitFormAsync({ formId, values: payload });
  };

  return (
    <>
      {/* Theme fonts loaded inline — keeps the page self-contained. */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
        rel="stylesheet"
      />

      <main
        className="relative min-h-screen overflow-hidden bg-[#0d0d0d] px-4 py-20 text-white sm:px-6 sm:py-24"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Top accent bar */}
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]"
          style={{ background: "linear-gradient(90deg, #0f6e56, #1d9e75, #0f6e56)" }}
        />

        {/* Ambient orb */}
        <div
          className="pointer-events-none fixed -right-[200px] -top-[200px] size-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(11,92,71,0.08) 0%, transparent 65%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[520px]">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                <span
                  className="inline-block size-[5px] rounded-full"
                  style={{
                    background: "#1d9e75",
                    boxShadow: "0 0 6px rgba(29,158,117,0.7)",
                  }}
                />
                Public form
              </span>
            </div>

            <h1
              className="mb-2 text-4xl leading-[1.1] tracking-tight text-white/90 sm:text-[2.6rem]"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {isLoading ? "Loading form…" : form?.title || "Untitled form"}
            </h1>

            {form?.description ? (
              <p className="text-[14px] leading-[1.5] text-white/35">{form.description}</p>
            ) : null}
          </div>

          {/* Divider */}
          <div
            className="mb-7 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(29,158,117,0.2) 60%, transparent)",
            }}
          />

          {error ? (
            <div className="rounded-[10px] border border-rose-500/30 bg-rose-500/[0.06] p-4 text-sm text-rose-300">
              {error instanceof Error ? error.message : "This form could not be loaded."}
            </div>
          ) : isLoading ? (
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <div className="h-3 w-28 rounded-full bg-white/[0.06]" />
                <div className="h-12 rounded-[10px] border border-white/[0.06] bg-white/[0.04]" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-36 rounded-full bg-white/[0.06]" />
                <div className="h-12 rounded-[10px] border border-white/[0.06] bg-white/[0.04]" />
              </div>
              <div
                className="h-12 rounded-[11px]"
                style={{
                  background: "rgba(29,158,117,0.12)",
                  border: "1px solid rgba(29,158,117,0.35)",
                }}
              />
            </div>
          ) : !form ? (
            <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.04] p-5 text-sm text-white/40">
              This form is not available.
            </div>
          ) : fields.length === 0 ? (
            <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.04] p-5 text-sm text-white/40">
              This form does not have any fields yet.
            </div>
          ) : isSuccess ? (
            /* Success — replaces the form area, matching the theme */
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
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {fields.map((field) => {
                const fieldValue = values[field.id];
                const inputId = `field-${field.id}`;
                const options = field.options ?? [];

                return (
                  <div key={field.id} className="flex flex-col gap-2">
                    {/* Uppercase teal-themed label */}
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
                      <p className="text-xs leading-[1.5] text-white/35">{field.description}</p>
                    ) : null}

                    {/* YES_NO — single checkbox row */}
                    {field.type === "YES_NO" ? (
                      <div
                        className={`flex min-h-12 items-center gap-3 px-4 py-3 ${SURFACE_BASE} ${SURFACE_FOCUS_WITHIN}`}
                      >
                        <Checkbox
                          id={inputId}
                          checked={fieldValue === true}
                          onCheckedChange={(checked) => updateValue(field.id, checked === true)}
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
                      /* SELECT — dropdown */
                      <Select
                        value={typeof fieldValue === "string" ? fieldValue : ""}
                        onValueChange={(v) => updateValue(field.id, v)}
                      >
                        <SelectTrigger
                          id={inputId}
                          className={`!h-12 w-full px-4 ${SURFACE_BASE} ${SURFACE_FOCUS}`}
                        >
                          <SelectValue placeholder={field.placeholder ?? "Choose an option…"} />
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
                      /* CHECKBOX — multi-select group */
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
                                  onCheckedChange={() => toggleCheckboxOption(field.id, opt)}
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
                      /* RATING — 5-star clickable, teal accent */
                      <div className={`flex items-center gap-2 px-4 py-3 ${SURFACE_BASE}`}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const current = typeof fieldValue === "number" ? fieldValue : 0;
                          const active = star <= current;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updateValue(field.id, star)}
                              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                              className="grid size-10 place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2"
                              style={{
                                color: active ? "#1d9e75" : "rgba(255,255,255,0.2)",
                              }}
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
                          <span className="ml-auto text-sm text-white/40">{fieldValue} / 5</span>
                        ) : null}
                      </div>
                    ) : field.type === "DATE" ? (
                      /* DATE — native date picker, dark color scheme */
                      <Input
                        id={inputId}
                        type="date"
                        value={typeof fieldValue === "string" ? fieldValue : ""}
                        required={field.isRequired}
                        className={`${INPUT_CLS} [color-scheme:dark]`}
                        onChange={(event) => updateValue(field.id, event.target.value)}
                      />
                    ) : (
                      /* TEXT, NUMBER, EMAIL, PASSWORD */
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
                        onChange={(event) => updateValue(field.id, event.target.value)}
                      />
                    )}
                  </div>
                );
              })}

              {/* Submit — outlined teal */}
              <Button
                type="submit"
                disabled={isPending}
                className="mt-1 flex h-[50px] w-full items-center justify-center gap-2 rounded-[11px] text-[15px] font-medium transition-colors hover:!brightness-110 disabled:!opacity-60"
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
                ) : (
                  <>
                    Submit form
                    <ArrowRightIcon className="size-4" strokeWidth={1.5} />
                  </>
                )}
              </Button>

              {submitError ? (
                <p className="text-center text-[12px] font-medium text-rose-400">
                  {submitError instanceof Error
                    ? submitError.message
                    : "Submission failed. Please try again."}
                </p>
              ) : null}

              <p className="text-center text-[12px] text-white/15">
                Powered by{" "}
                <span style={{ color: "rgba(29,158,117,0.5)", fontWeight: 500 }}>FlowForm</span>
              </p>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
