"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useCreateField } from "~/hooks/api/form"

const fieldTypes = ["TEXT", "YES_NO", "NUMBER", "EMAIL", "PASSWORD"] as const

const addFieldSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(100, "Label must be at most 100 characters"),
  type: z.enum(fieldTypes),
  description: z.string().trim().max(300, "Description must be at most 300 characters").optional(),
  placeholder: z.string().trim().max(300, "Placeholder must be at most 300 characters").optional(),
  isRequired: z.boolean().default(false),
})

type AddFieldInput = z.input<typeof addFieldSchema>
type AddFieldValues = z.output<typeof addFieldSchema>

const defaultValues: AddFieldValues = {
  label: "",
  type: "TEXT",
  description: "",
  placeholder: "",
  isRequired: false,
}

interface AddFieldModalProps {
  formId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFieldModal({ formId, open, onOpenChange }: AddFieldModalProps) {
  const { CreateFieldAsync } = useCreateField(formId)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<AddFieldInput, undefined, AddFieldValues>({
    resolver: zodResolver(addFieldSchema),
    defaultValues,
  })

  React.useEffect(() => {
    if (!open) {
      form.reset(defaultValues)
    }
  }, [form, open])

  const onSubmit = async (values: AddFieldValues) => {
    try {
      setIsSubmitting(true)

      await CreateFieldAsync({
        formId,
        label: values.label.trim(),
        type: values.type,
        description: values.description?.trim() || undefined,
        placeholder: values.placeholder?.trim() || undefined,
        isRequired: values.isRequired,
      })

      toast.success("Field added")
      form.reset(defaultValues)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add field")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add field</DialogTitle>
          <DialogDescription>
            Add a new field to the current form and it will appear in the builder immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="label" className="text-sm font-medium">
              Label
            </label>
            <Input id="label" placeholder="Full name" {...form.register("label")} />
            {form.formState.errors.label ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.label.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type
                          .toLowerCase()
                          .split("_")
                          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.type ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.type.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              placeholder="Optional helper text"
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="placeholder" className="text-sm font-medium">
              Placeholder
            </label>
            <Input
              id="placeholder"
              placeholder="Enter a placeholder"
              {...form.register("placeholder")}
            />
            {form.formState.errors.placeholder ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.placeholder.message}
              </p>
            ) : null}
          </div>

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
              {isSubmitting ? "Adding..." : "Add field"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}