"use client";

import * as React from "react";
import { InboxIcon } from "lucide-react";

import type { RouterOutputs } from "@repo/trpc/client";
import { useGetFields, useGetFormSubmissions } from "~/hooks/api/form";

type Submission = RouterOutputs["form"]["getFormSubmissions"][number];
import { Card, CardContent } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === "") return "—";
  return String(value);
}

export default function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = React.use(params);

  const { fields, isLoading: fieldsLoading, error: fieldsError } = useGetFields(formId);
  const {
    submissions,
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useGetFormSubmissions(formId);

  const isLoading = fieldsLoading || submissionsLoading;
  const error = fieldsError ?? submissionsError;

  return (
    <main className="flex flex-1 justify-center px-4 py-8 md:px-8">
      <div className="w-full max-w-6xl space-y-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Documents</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Submissions</h1>
        </div>

        {isLoading ? (
          <Card className="rounded-2xl border-border/70 bg-card/70">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Loading submissions...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
            <CardContent className="py-8 text-sm text-destructive">
              {error instanceof Error ? error.message : "Could not load submissions."}
            </CardContent>
          </Card>
        ) : fields.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/80 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl border bg-background">
                <InboxIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold">No fields defined</h2>
                <p className="text-sm text-muted-foreground">
                  Add fields in the form builder before collecting submissions.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : submissions.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/80 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl border bg-background">
                <InboxIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold">No submissions yet</h2>
                <p className="text-sm text-muted-foreground">
                  Share your form link to start collecting responses.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border bg-background overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Submitted At</TableHead>
                  {fields.map((field) => (
                    <TableHead key={field.id} className="whitespace-nowrap">
                      {field.label}
                      {field.isRequired && (
                        <span className="ml-1 text-destructive" aria-hidden>
                          *
                        </span>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission: Submission) => {
                  const valueMap = new Map<string, string | number | boolean | null>(
                    submission.values.map(
                      (v: Submission["values"][number]) => [v.formFieldId, v.value],
                    ),
                  );

                  return (
                    <TableRow key={submission.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(submission.createdAt)}
                      </TableCell>
                      {fields.map((field) => (
                        <TableCell key={field.id}>
                          {formatValue(valueMap.get(field.id))}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && !error && submissions.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {submissions.length} {submissions.length === 1 ? "response" : "responses"} total
          </p>
        )}
      </div>
    </main>
  );
}
