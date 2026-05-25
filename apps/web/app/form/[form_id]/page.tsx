"use client";

import * as React from "react";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useGetForm, useSubmitForm } from "~/hooks/api/form";

export default function PublicFormPage({ params }: { params: Promise<{ form_id: string }> }) {
  const { form_id: formId } = React.use(params);
  const { form, isLoading, error } = useGetForm(formId);
  const { submitFormAsync, isPending, isSuccess, error: submitError } = useSubmitForm();
  const [values, setValues] = React.useState<Record<string, string | boolean>>({});

  const fields = form?.fields ?? [];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = fields.map((field) => ({
      formFieldId: field.id,
      value: values[field.id] ?? null,
    }));
    await submitFormAsync({ formId, values: payload });
  };

  const updateValue = (fieldId: string, value: string | boolean) => {
    setValues((currentValues) => ({
      ...currentValues,
      [fieldId]: value,
    }));
  };

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-12 text-foreground sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-10 space-y-4 sm:mb-12">
          <p className="text-sm font-medium text-zinc-500">Public form</p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
            {isLoading ? "Loading form..." : form?.title || "Untitled form"}
          </h1>
          {form?.description ? (
            <p className="max-w-lg text-base leading-7 text-zinc-400">{form.description}</p>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error instanceof Error ? error.message : "This form could not be loaded."}
          </div>
        ) : isLoading ? (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="h-4 w-28 rounded-full bg-zinc-800" />
              <div className="h-12 rounded-lg border border-zinc-800 bg-zinc-950/70" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-36 rounded-full bg-zinc-800" />
              <div className="h-12 rounded-lg border border-zinc-800 bg-zinc-950/70" />
            </div>
            <div className="h-12 rounded-lg bg-zinc-100/90" />
          </div>
        ) : !form ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-5 text-sm text-zinc-400">
            This form is not available.
          </div>
        ) : fields.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-5 text-sm text-zinc-400">
            This form does not have any fields yet.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {fields.map((field) => {
              const fieldValue = values[field.id];
              const inputId = `field-${field.id}`;

              return (
                <div key={field.id} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={inputId} className="text-sm font-medium text-zinc-100">
                      {field.label}
                      {field.isRequired ? <span className="text-red-300"> *</span> : null}
                    </Label>

                    {field.description ? (
                      <p className="text-sm leading-6 text-zinc-500">{field.description}</p>
                    ) : null}
                  </div>

                  {field.type === "YES_NO" ? (
                    <div className="flex min-h-12 items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/70 px-4 py-3 transition-colors focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-700/50">
                      <Checkbox
                        id={inputId}
                        checked={fieldValue === true}
                        onCheckedChange={(checked) => updateValue(field.id, checked === true)}
                      />
                      <Label htmlFor={inputId} className="text-sm font-normal text-zinc-300">
                        Yes
                      </Label>
                    </div>
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
                      className="h-12 rounded-lg border-zinc-800 bg-zinc-950/70 px-4 text-base text-zinc-50 placeholder:text-zinc-600 shadow-none transition-colors focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-700/50"
                      onChange={(event) => updateValue(field.id, event.target.value)}
                    />
                  )}
                </div>
              );
            })}

            <div className="space-y-4 pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 w-full rounded-lg bg-zinc-50 text-base font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-zinc-200 disabled:opacity-60"
              >
                {isPending ? "Submitting…" : "Submit"}
              </Button>
              {isSuccess ? (
                <p className="text-center text-sm font-medium text-emerald-400">
                  Your response has been recorded. Thank you!
                </p>
              ) : null}
              {submitError ? (
                <p className="text-center text-sm font-medium text-red-400">
                  {submitError instanceof Error ? submitError.message : "Submission failed. Please try again."}
                </p>
              ) : null}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
