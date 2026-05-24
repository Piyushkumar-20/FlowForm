"use client"

import Link from "next/link"

import { useListForms } from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

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

export function FormsListTable() {
  const { forms, isLoading, isError, error } = useListForms()

  return (
    <div className="rounded-xl border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Form</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Builder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Loading your forms...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {error instanceof Error
                  ? error.message
                  : "We could not load your forms."}
              </TableCell>
            </TableRow>
          ) : forms && forms.length > 0 ? (
            forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/forms/${form.id}`}
                    className="text-foreground hover:underline"
                  >
                    {form.title ?? "Untitled form"}
                  </Link>
                </TableCell>
                <TableCell className="max-w-md whitespace-normal text-muted-foreground">
                  {form.description ?? "—"}
                </TableCell>
                <TableCell>{formatDate(form.createdAt)}</TableCell>
                <TableCell>{formatDate(form.updatedAt ?? null)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/forms/${form.id}`}>Open builder</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No forms yet. Create one to start building.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}