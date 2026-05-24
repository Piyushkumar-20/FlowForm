"use client"

import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { useCreateForm } from "~/hooks/api/form"

export type CreateFormValues = {
  title: string
  description?: string
}

interface CreateFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFormModal({ open, onOpenChange }: CreateFormModalProps) {
  const { CreateFormAsync } = useCreateForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<CreateFormValues>({
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const onSubmit: SubmitHandler<CreateFormValues> = async (values) => {
    try {
      setIsSubmitting(true)
      await CreateFormAsync({
        title: values.title,
        description: values.description || undefined,
      })
      form.reset()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
          <DialogDescription>
            Create a new form to start collecting responses
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Form Title</FieldLabel>
              <Input
                id="title"
                placeholder="Enter form title"
                autoComplete="off"
                {...form.register("title", {
                  required: "Title is required",
                  maxLength: {
                    value: 20,
                    message: "Title must be at most 20 characters",
                  },
                })}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Enter form description (optional)"
                className="min-h-24"
                {...form.register("description", {
                  maxLength: {
                    value: 300,
                    message: "Description must be at most 300 characters",
                  },
                })}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </Field>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Form"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
