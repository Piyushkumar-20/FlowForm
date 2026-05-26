"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { XIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { type Field, useCreateField } from "~/hooks/api/form";

const fieldTypes = [
  "TEXT", "YES_NO", "NUMBER", "EMAIL", "PASSWORD", "SELECT", "CHECKBOX", "RATING", "DATE",
] as const;

const FIELD_TYPE_LABELS: Record<(typeof fieldTypes)[number], string> = {
  TEXT: "Text",
  YES_NO: "Yes / No",
  NUMBER: "Number",
  EMAIL: "Email",
  PASSWORD: "Password",
  SELECT: "Select (dropdown)",
  CHECKBOX: "Checkbox (multi-select)",
  RATING: "Rating",
  DATE: "Date",
};

const addFieldSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(100, "Label must be at most 100 characters"),
  type: z.enum(fieldTypes),
  description: z.string().trim().max(300, "Description must be at most 300 characters").optional(),
  placeholder: z.string().trim().max(300, "Placeholder must be at most 300 characters").optional(),
  isRequired: z.boolean().default(false),
});

type AddFieldInput = z.input<typeof addFieldSchema>;
type AddFieldValues = z.output<typeof addFieldSchema>;

const defaultValues: AddFieldValues = {
  label: "",
  type: "TEXT",
  description: "",
  placeholder: "",
  isRequired: false,
};

interface AddFieldModalProps {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFieldCreated?: (field: Field) => void;
}

export function AddFieldModal({ formId, open, onOpenChange, onFieldCreated }: AddFieldModalProps) {
  const { CreateFieldAsync } = useCreateField(formId);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [options, setOptions] = React.useState<string[]>([]);
  const [newOption, setNewOption] = React.useState("");

  const form = useForm<AddFieldInput, undefined, AddFieldValues>({
    resolver: zodResolver(addFieldSchema),
    defaultValues,
  });

  const watchedType = form.watch("type");
  const needsOptions = watchedType === "SELECT" || watchedType === "CHECKBOX";

  React.useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      setOptions([]);
      setNewOption("");
    }
  }, [form, open]);

  const addOption = () => {
    const val = newOption.trim();
    if (val && !options.includes(val)) {
      setOptions((prev) => [...prev, val]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: AddFieldValues) => {
    try {
      setIsSubmitting(true);

      const createdField = await CreateFieldAsync({
        formId,
        label: values.label.trim(),
        type: values.type,
        description: values.description?.trim() || undefined,
        placeholder: values.placeholder?.trim() || undefined,
        isRequired: values.isRequired,
        options: needsOptions ? options : undefined,
      });

      onFieldCreated?.(createdField);
      toast.success("Field added");
      form.reset(defaultValues);
      setOptions([]);
      setNewOption("");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add field");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add field</DialogTitle>
          <DialogDescription>
            Add a new field to the form. It will appear in the builder immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Label */}
          <div className="space-y-2">
            <label htmlFor="label" className="text-sm font-medium">
              Label
            </label>
            <Input id="label" placeholder="e.g. Full name" {...form.register("label")} />
            {form.formState.errors.label ? (
              <p className="text-sm text-destructive">{form.formState.errors.label.message}</p>
            ) : null}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setOptions([]);
                    setNewOption("");
                  }}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {FIELD_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.type ? (
              <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
            ) : null}
          </div>

          {/* Options — only for SELECT / CHECKBOX */}
          {needsOptions ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Options</label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 rounded-md border border-border/70 bg-muted/30 px-3 py-1.5 text-sm">
                      {opt}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeOption(i)}
                      aria-label={`Remove option ${opt}`}
                    >
                      <XIcon className="size-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    placeholder="Type an option and press Enter…"
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addOption}>
                    Add
                  </Button>
                </div>
                {options.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Add at least one option for this field type.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
              <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="description"
              placeholder="Helper text shown below the field"
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          {/* Placeholder */}
          <div className="space-y-2">
            <label htmlFor="placeholder" className="text-sm font-medium">
              Placeholder
              <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="placeholder"
              placeholder="e.g. Enter your full name…"
              {...form.register("placeholder")}
            />
            {form.formState.errors.placeholder ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.placeholder.message}
              </p>
            ) : null}
          </div>

          {/* Required */}
          <div className="flex items-center gap-3 rounded-md border p-3">
            <Controller
              control={form.control}
              name="isRequired"
              render={({ field }) => (
                <Checkbox
                  id="isRequired"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              )}
            />
            <label htmlFor="isRequired" className="text-sm font-medium leading-none">
              Required field
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add field"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
