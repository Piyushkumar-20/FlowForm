"use client"

import * as React from "react"
import Link from "next/link"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { AddFieldModal } from "~/components/add-field-modal"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { useGetFields, useListForms } from "~/hooks/api/form"

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "—"
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function formatFieldType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export default function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)
  const formId = resolvedParams.id
  const [isAddFieldOpen, setIsAddFieldOpen] = React.useState(false)

  const {
    forms,
    isLoading: isFormsLoading,
    isError: isFormsError,
    error: formsError,
  } = useListForms()
  const {
    fields,
    isLoading: isFieldsLoading,
    error: fieldsError,
  } = useGetFields(formId)

  const selectedForm = forms?.find((form) => form.id === formId)
  const fieldCount = fields?.length ?? 0
  const requiredFieldCount = fields?.filter((field) => field.isRequired).length ?? 0
  const hasFields = Boolean(fields?.length)

  const handleEditField = () => {
    toast.message("Field editing UI is next")
  }

  const handleDeleteField = () => {
    toast.message("Field deletion is next")
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Form builder
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {selectedForm?.title ?? "Untitled form"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedForm?.description ?? "Editing the selected form in place."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddFieldOpen(true)}>
            <PlusIcon className="size-4" />
            Add Field
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/forms">Back to forms</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Builder canvas
              </p>
              <h2 className="text-lg font-semibold">Form structure</h2>
              <p className="text-sm text-muted-foreground">
                The page now reads the current form and its fields from the UI
                data layer, so the builder can be extended from here.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-56">
              <div className="rounded-xl border bg-muted/20 p-3">
                <div className="text-muted-foreground">Fields</div>
                <div className="mt-1 text-lg font-semibold">{fieldCount}</div>
              </div>
              <div className="rounded-xl border bg-muted/20 p-3">
                <div className="text-muted-foreground">Required</div>
                <div className="mt-1 text-lg font-semibold">
                  {requiredFieldCount}
                </div>
              </div>
            </div>
          </div>

          {isFieldsLoading ? (
            <div className="mt-6 rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
              Loading form fields...
            </div>
          ) : fieldsError ? (
            <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              {fieldsError instanceof Error
                ? fieldsError.message
                : "We could not load this form's fields."}
            </div>
          ) : hasFields ? (
            <div className="mt-6 space-y-3">
              {fields?.map((field) => (
                <article
                  key={field.id}
                  className="group rounded-2xl border bg-background p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold">{field.label}</h3>
                        <Badge variant="outline">{formatFieldType(field.type)}</Badge>
                        {field.isRequired ? <Badge>Required</Badge> : null}
                      </div>
                      <p className="max-w-2xl text-sm text-muted-foreground">
                        {field.description ?? "No helper text yet."}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 transition-opacity group-hover:opacity-100 sm:opacity-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleEditField}
                        aria-label={`Edit ${field.label}`}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleDeleteField}
                        aria-label={`Delete ${field.label}`}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Placeholder</dt>
                      <dd className="mt-1 font-medium">
                        {field.placeholder ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Field ID</dt>
                      <dd className="mt-1 break-all font-medium">{field.id}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 text-center">
              <div className="space-y-3">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full border bg-background shadow-sm">
                  <PlusIcon className="size-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No fields added yet</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Start building this form by adding your first field. The canvas will populate here as fields are created.
                </p>
                <Button onClick={() => setIsAddFieldOpen(true)}>
                  <PlusIcon className="size-4" />
                  Add Field
                </Button>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Selected form
              </p>
              <h2 className="text-lg font-semibold">Form details</h2>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="space-y-1">
                <dt className="text-muted-foreground">Form ID</dt>
                <dd className="font-medium break-all">{formId}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">Title</dt>
                <dd className="font-medium">
                  {isFormsLoading
                    ? "Loading..."
                    : selectedForm?.title ?? "Not found in your forms list"}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">Description</dt>
                <dd className="font-medium">
                  {selectedForm?.description ?? "—"}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {formatDate(selectedForm?.createdAt ?? null)}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium">
                  {formatDate(selectedForm?.updatedAt ?? null)}
                </dd>
              </div>
            </dl>

            {isFormsError ? (
              <p className="mt-4 text-sm text-destructive">
                {formsError instanceof Error
                  ? formsError.message
                  : "We could not load your forms list."}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Builder status
              </p>
              <h2 className="text-lg font-semibold">Connected to UI</h2>
            </div>
            <div className="mt-4 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              This route now renders live form data from tRPC, so it is ready
              for drag-and-drop controls, field editing, and preview states.
            </div>
          </section>
        </aside>
      </div>

      <AddFieldModal
        formId={formId}
        open={isAddFieldOpen}
        onOpenChange={setIsAddFieldOpen}
      />
    </div>
  )
}