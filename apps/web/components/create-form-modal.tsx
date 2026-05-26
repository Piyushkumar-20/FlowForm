"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useCreateForm } from "~/hooks/api/form";

/* Zod schema — title required, description optional (empty string allowed). */
const createFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(20, "Title must be at most 20 characters"),
  description: z
    .string()
    .max(300, "Description must be at most 300 characters"),
});

interface CreateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFormModal({ open, onOpenChange }: CreateFormModalProps) {
  const { CreateFormAsync } = useCreateForm();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    // Form-level Zod validator — runs on every change.
    validators: {
      onChange: createFormSchema,
    },
    onSubmit: async ({ value }) => {
      await CreateFormAsync({
        title: value.title.trim(),
        description: value.description?.trim() || undefined,
      });
      form.reset();
      onOpenChange(false);
    },
  });

  // Clear field state whenever the dialog is dismissed.
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
          <DialogDescription>
            Create a new form to start collecting responses
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
          noValidate
        >
          <FieldGroup>
            {/* Title */}
            <form.Field name="title">
              {(field) => {
                const hasError =
                  field.state.meta.isTouched && field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={hasError || undefined}>
                    <FieldLabel htmlFor={field.name}>Form Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Enter form title"
                      autoComplete="off"
                      aria-invalid={hasError || undefined}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {hasError ? (
                      <FieldError
                        errors={
                          field.state.meta.errors as Array<
                            { message?: string } | undefined
                          >
                        }
                      />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            {/* Description */}
            <form.Field name="description">
              {(field) => {
                const hasError =
                  field.state.meta.isTouched && field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={hasError || undefined}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      placeholder="Enter form description (optional)"
                      className="min-h-24"
                      aria-invalid={hasError || undefined}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    <FieldDescription>
                      Optional · up to 300 characters
                    </FieldDescription>
                    {hasError ? (
                      <FieldError
                        errors={
                          field.state.meta.errors as Array<
                            { message?: string } | undefined
                          >
                        }
                      />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            {/* Actions — subscribe to form state for submit button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ canSubmit, isSubmitting }) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Form"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
