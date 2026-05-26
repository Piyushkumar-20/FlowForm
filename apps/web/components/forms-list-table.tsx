"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CopyIcon,
  CopyPlusIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  useArchiveForm,
  useCloneForm,
  useGetFormSubmissions,
  useListForms,
  useRestoreForm,
} from "~/hooks/api/form";

type Form = ReturnType<typeof useListForms>["forms"][number];

const STATUS_STYLES: Record<Form["status"], string> = {
  draft: "bg-zinc-700/40 text-zinc-300 border-zinc-700/60",
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  unpublished: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const STATUS_LABELS: Record<Form["status"], string> = {
  draft: "Draft",
  published: "Published",
  unpublished: "Unpublished",
};

const VISIBILITY_STYLES: Record<Form["visibility"], string> = {
  public: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  unlisted: "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

const VISIBILITY_LABELS: Record<Form["visibility"], string> = {
  public: "Public",
  unlisted: "Unlisted",
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function formatRelative(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

/* ─────────────────────────────────────────────────────────────────── */

interface FormRowProps {
  form: Form;
}

function FormRow({ form }: FormRowProps) {
  const { submissions, isLoading: submissionsLoading } = useGetFormSubmissions(form.id);
  const { cloneFormAsync, isPending: isCloning } = useCloneForm();
  const { archiveFormAsync, isPending: isArchiving } = useArchiveForm();
  const { restoreFormAsync, isPending: isRestoring } = useRestoreForm();

  const responseCount = submissions.length;
  const isPublished = form.status === "published";

  const handleCopyLink = () => {
    if (!isPublished) {
      toast.error("Publish the form first to share it");
      return;
    }
    const url = `${window.location.origin}/form/${form.id}`;
    void navigator.clipboard.writeText(url);
    toast.success("Share link copied", { description: url });
  };

  const handleClone = async () => {
    try {
      await cloneFormAsync({ formId: form.id });
      toast.success("Form cloned");
    } catch {
      toast.error("Could not clone form");
    }
  };

  const handleArchive = async () => {
    try {
      await archiveFormAsync({ formId: form.id });
      toast.success("Form archived");
    } catch {
      toast.error("Could not archive form");
    }
  };

  const handleRestore = async () => {
    try {
      await restoreFormAsync({ formId: form.id });
      toast.success("Form restored");
    } catch {
      toast.error("Could not restore form");
    }
  };

  return (
    <TableRow className={`group ${form.isArchived ? "opacity-60" : ""}`}>
      {/* Title */}
      <TableCell className="font-medium">
        <Link
          href={`/dashboard/forms/${form.id}`}
          className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
        >
          <span className="truncate">{form.title ?? "Untitled form"}</span>
          {form.isArchived ? (
            <span className="inline-flex items-center rounded-md border border-zinc-700/60 bg-zinc-700/30 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
              Archived
            </span>
          ) : null}
        </Link>
        {form.description ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {form.description}
          </p>
        ) : null}
      </TableCell>

      {/* Status */}
      <TableCell>
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[form.status]}`}
        >
          {STATUS_LABELS[form.status]}
        </span>
      </TableCell>

      {/* Visibility */}
      <TableCell className="hidden md:table-cell">
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${VISIBILITY_STYLES[form.visibility]}`}
        >
          {VISIBILITY_LABELS[form.visibility]}
        </span>
      </TableCell>

      {/* Responses */}
      <TableCell className="hidden sm:table-cell">
        {submissionsLoading ? (
          <span className="text-sm text-muted-foreground">…</span>
        ) : (
          <span className="inline-flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-foreground">{responseCount}</span>
            <span className="text-xs text-muted-foreground">
              {responseCount === 1 ? "response" : "responses"}
            </span>
          </span>
        )}
      </TableCell>

      {/* Updated */}
      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
        {formatRelative(form.updatedAt ?? form.createdAt)}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Actions for ${form.title}`}
            >
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/forms/${form.id}`}>
                <LayoutDashboardIcon className="size-4" />
                Open Builder
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/forms/${form.id}/submissions`}>
                <MessageSquareIcon className="size-4" />
                View Responses
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopyLink} disabled={!isPublished}>
              <CopyIcon className="size-4" />
              Copy Share Link
            </DropdownMenuItem>
            {isPublished ? (
              <DropdownMenuItem asChild>
                <a
                  href={`/form/${form.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLinkIcon className="size-4" />
                  Open Live Form
                </a>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void handleClone()}
              disabled={isCloning}
            >
              <CopyPlusIcon className="size-4" />
              {isCloning ? "Cloning…" : "Clone form"}
            </DropdownMenuItem>
            {form.isArchived ? (
              <DropdownMenuItem
                onClick={() => void handleRestore()}
                disabled={isRestoring}
              >
                <ArchiveRestoreIcon className="size-4" />
                {isRestoring ? "Restoring…" : "Restore"}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => void handleArchive()}
                disabled={isArchiving}
                className="text-muted-foreground"
              >
                <ArchiveIcon className="size-4" />
                {isArchiving ? "Archiving…" : "Archive"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

interface FormsListTableProps {
  onCreateForm?: () => void;
}

export function FormsListTable({ onCreateForm }: FormsListTableProps) {
  const { forms, isLoading, isError, error } = useListForms();

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[35%]">Form</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Visibility</TableHead>
            <TableHead className="hidden sm:table-cell">Responses</TableHead>
            <TableHead className="hidden lg:table-cell">Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                Loading your forms…
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-sm text-destructive">
                {error instanceof Error ? error.message : "We could not load your forms."}
              </TableCell>
            </TableRow>
          ) : forms && forms.length > 0 ? (
            forms.map((form) => <FormRow key={form.id} form={form} />)
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center gap-2 py-4">
                  <p className="text-sm font-medium text-foreground">No forms yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first form to start collecting responses.
                  </p>
                  {onCreateForm ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-3 rounded-lg"
                      onClick={onCreateForm}
                    >
                      Create form
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
