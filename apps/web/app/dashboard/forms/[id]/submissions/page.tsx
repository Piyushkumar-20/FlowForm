"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BarChart2Icon,
  DownloadIcon,
  InboxIcon,
  TableIcon,
} from "lucide-react";

import type { RouterOutputs } from "@repo/trpc/client";
import { FormAnalytics } from "~/components/form-analytics";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useGetFields, useGetFormSubmissions } from "~/hooks/api/form";

type Submission = RouterOutputs["form"]["getFormSubmissions"][number];

/* ── formatters ── */

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
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  try {
    const arr = JSON.parse(String(value)) as unknown;
    if (Array.isArray(arr)) return arr.join(", ");
  } catch {
    /* not JSON */
  }
  return String(value);
}

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(
  fields: { id: string; label: string }[],
  submissions: Submission[],
) {
  const headers = ["Submitted At", ...fields.map((f) => f.label)];
  const rows = submissions.map((s) => {
    const map = new Map(s.values.map((v) => [v.formFieldId, v.value]));
    return [
      formatDate(s.createdAt),
      ...fields.map((f) => formatValue(map.get(f.id))),
    ];
  });
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `submissions-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const PAGE_SIZES = [10, 25, 50] as const;

/* ── main page ── */

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: formId } = React.use(params);

  const { fields, isLoading: fieldsLoading, error: fieldsError } =
    useGetFields(formId);
  const {
    submissions,
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useGetFormSubmissions(formId);

  /* filters */
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [pageSize, setPageSize] = React.useState<(typeof PAGE_SIZES)[number]>(10);
  const [page, setPage] = React.useState(1);

  const isLoading = fieldsLoading || submissionsLoading;
  const error = fieldsError ?? submissionsError;

  /* derived */
  const filteredSubmissions = React.useMemo(() => {
    let list = submissions;
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      list = list.filter((s) => new Date(s.createdAt).getTime() >= from);
    }
    if (toDate) {
      const to = new Date(toDate).setHours(23, 59, 59, 999);
      list = list.filter((s) => new Date(s.createdAt).getTime() <= to);
    }
    return list;
  }, [submissions, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const currentPageData = filteredSubmissions.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  React.useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, pageSize]);

  /* reset filters */
  const clearFilters = () => {
    setFromDate("");
    setToDate("");
  };

  const hasFilters = fromDate || toDate;

  return (
    <main className="flex flex-1 justify-center px-4 py-8 md:px-8">
      <div className="w-full max-w-6xl space-y-5">
        {/* Header */}
        <Link
          href={`/dashboard/forms/${formId}`}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Form builder
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Responses</h1>
          {!isLoading && !error && submissions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => downloadCsv(fields, filteredSubmissions)}
            >
              <DownloadIcon className="size-4" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-48 rounded-lg" />
            <div className="rounded-xl border border-border/60">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 border-b border-border/40 px-4 py-3 last:border-0"
                >
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
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
              <h2 className="text-base font-semibold">No fields defined</h2>
              <p className="text-sm text-muted-foreground">
                Add fields in the form builder before collecting submissions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="responses">
            <TabsList className="mb-1">
              <TabsTrigger value="responses">
                <TableIcon className="size-3.5" />
                Responses
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart2Icon className="size-3.5" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* ── Responses tab ── */}
            <TabsContent value="responses">
              {submissions.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-border/80 bg-card/50">
                  <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex size-10 items-center justify-center rounded-xl border bg-background">
                      <InboxIcon className="size-4 text-muted-foreground" />
                    </div>
                    <h2 className="text-base font-semibold">No submissions yet</h2>
                    <p className="text-sm text-muted-foreground">
                      Share your form link to start collecting responses.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Filter bar */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">From</label>
                      <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="h-8 w-36 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">To</label>
                      <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="h-8 w-36 text-sm"
                      />
                    </div>
                    {hasFilters ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </Button>
                    ) : null}
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Show
                      </span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(v) =>
                          setPageSize(Number(v) as (typeof PAGE_SIZES)[number])
                        }
                      >
                        <SelectTrigger className="h-8 w-16 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZES.map((s) => (
                            <SelectItem key={s} value={String(s)} className="text-xs">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground">
                        per page
                      </span>
                    </div>
                  </div>

                  {filteredSubmissions.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No responses match the selected filters.
                    </p>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-xl border bg-background">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="whitespace-nowrap">
                                Submitted At
                              </TableHead>
                              {fields.map((field) => (
                                <TableHead
                                  key={field.id}
                                  className="whitespace-nowrap"
                                >
                                  {field.label}
                                  {field.isRequired && (
                                    <span
                                      className="ml-1 text-destructive"
                                      aria-hidden
                                    >
                                      *
                                    </span>
                                  )}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentPageData.map((submission) => {
                              const valueMap = new Map<
                                string,
                                string | number | boolean | null
                              >(
                                submission.values.map((v) => [
                                  v.formFieldId,
                                  v.value,
                                ]),
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

                      {/* Pagination */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                        <span>
                          Showing{" "}
                          {Math.min(
                            (page - 1) * pageSize + 1,
                            filteredSubmissions.length,
                          )}
                          –
                          {Math.min(
                            page * pageSize,
                            filteredSubmissions.length,
                          )}{" "}
                          of {filteredSubmissions.length}{" "}
                          {filteredSubmissions.length === 1
                            ? "response"
                            : "responses"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg px-3"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                          >
                            Previous
                          </Button>
                          <span className="min-w-[80px] text-center text-xs">
                            Page {page} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg px-3"
                            onClick={() =>
                              setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ── Analytics tab ── */}
            <TabsContent value="analytics">
              <FormAnalytics fields={fields} submissions={submissions} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}
