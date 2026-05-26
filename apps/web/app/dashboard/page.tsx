"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  ClipboardListIcon,
  FileTextIcon,
  GlobeIcon,
  MessageSquareIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";

import { CreateFormModal } from "~/components/create-form-modal";
import { Button } from "~/components/ui/button";
import { useUser } from "~/hooks/api/auth";
import { useGetFormSubmissions, useListForms } from "~/hooks/api/form";

type Form = ReturnType<typeof useListForms>["forms"][number];
type Submission = ReturnType<typeof useGetFormSubmissions>["submissions"][number];

interface ActivityItem {
  id: string;
  formId: string;
  formTitle: string;
  createdAt: Date;
  filledCount: number;
}

/* ─────────────────────────────────────────────────────────────────── */
/* Invisible child loader — one per form, reuses the existing query.  */
/* Hook order is stable because it's its own component.               */
/* ─────────────────────────────────────────────────────────────────── */

interface SubmissionsLoaderProps {
  formId: string;
  onLoaded: (formId: string, submissions: Submission[]) => void;
}

function SubmissionsLoader({ formId, onLoaded }: SubmissionsLoaderProps) {
  const { submissions } = useGetFormSubmissions(formId);

  React.useEffect(() => {
    onLoaded(formId, submissions);
  }, [formId, submissions, onLoaded]);

  return null;
}

/* ─────────────────────────────────────────────────────────────────── */

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
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

/* ─────────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [createOpen, setCreateOpen] = React.useState(false);
  const { user } = useUser();
  const { forms, isLoading: formsLoading } = useListForms();

  // Per-form submissions cache, populated by the invisible loaders.
  const [submissionsByForm, setSubmissionsByForm] = React.useState<
    Record<string, Submission[]>
  >({});

  const handleLoaded = React.useCallback((formId: string, subs: Submission[]) => {
    setSubmissionsByForm((prev) => {
      // Only update if the count or first id changed — avoids re-renders on
      // identical refetches that return the same array reference.
      const existing = prev[formId];
      if (existing && existing.length === subs.length && existing[0]?.id === subs[0]?.id) {
        return prev;
      }
      return { ...prev, [formId]: subs };
    });
  }, []);

  // ── Aggregations ──────────────────────────────────────────────────
  const total = forms.length;
  const published = forms.filter((f) => f.status === "published").length;
  const drafts = forms.filter((f) => f.status === "draft").length;
  const totalResponses = Object.values(submissionsByForm).reduce(
    (sum, subs) => sum + subs.length,
    0,
  );

  // Recent forms — sorted by updatedAt (or createdAt fallback), take 5
  const recentForms = React.useMemo(() => {
    return [...forms]
      .sort((a, b) => {
        const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [forms]);

  // Recent activity — flatten all submissions, sort by createdAt, take 5
  const recentActivity = React.useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];
    for (const form of forms) {
      const subs = submissionsByForm[form.id] ?? [];
      for (const sub of subs) {
        const filled = sub.values.filter(
          (v) => v.value !== null && v.value !== "" && v.value !== false,
        ).length;
        items.push({
          id: sub.id,
          formId: form.id,
          formTitle: form.title ?? "Untitled form",
          createdAt: new Date(sub.createdAt),
          filledCount: filled,
        });
      }
    }
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
  }, [forms, submissionsByForm]);

  const firstName = user?.fullName?.split(" ")[0] ?? null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Invisible loaders — one per form */}
      {forms.map((f) => (
        <SubmissionsLoader key={f.id} formId={f.id} onLoaded={handleLoaded} />
      ))}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's a quick look at your forms and recent responses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="rounded-xl"
          >
            <Link href="/dashboard/forms">
              <ClipboardListIcon className="size-4" />
              View Forms
            </Link>
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="rounded-xl">
            <PlusIcon className="size-4" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total forms"
          value={total}
          loading={formsLoading}
          icon={<FileTextIcon className="size-4" />}
        />
        <StatCard
          label="Total responses"
          value={totalResponses}
          loading={formsLoading}
          icon={<MessageSquareIcon className="size-4" />}
          accent="indigo"
        />
        <StatCard
          label="Published"
          value={published}
          loading={formsLoading}
          icon={<GlobeIcon className="size-4" />}
          accent="emerald"
        />
        <StatCard
          label="Drafts"
          value={drafts}
          loading={formsLoading}
          icon={<PencilIcon className="size-4" />}
          accent="zinc"
        />
      </div>

      {/* Two-column section: Recent forms + Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent forms */}
        <Section
          title="Recent forms"
          action={
            <Link
              href="/dashboard/forms"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              See all
              <ArrowRightIcon className="size-3" />
            </Link>
          }
        >
          {formsLoading ? (
            <ItemSkeleton count={3} />
          ) : recentForms.length === 0 ? (
            <EmptyState
              icon={<SparklesIcon className="size-5 text-muted-foreground" />}
              title="No forms yet"
              body="Spin up your first form to get started."
              cta={
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setCreateOpen(true)}
                >
                  <PlusIcon className="size-3.5" />
                  Create form
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {recentForms.map((form) => {
                const count = submissionsByForm[form.id]?.length ?? 0;
                return (
                  <li key={form.id}>
                    <Link
                      href={`/dashboard/forms/${form.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {form.title ?? "Untitled form"}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-md border px-1.5 py-0 text-[10px] font-medium ${STATUS_STYLES[form.status]}`}
                          >
                            {STATUS_LABELS[form.status]}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {count} {count === 1 ? "response" : "responses"} · Updated{" "}
                          {formatRelative(form.updatedAt ?? form.createdAt)}
                        </p>
                      </div>
                      <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground/50" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Recent activity */}
        <Section title="Recent activity">
          {formsLoading ? (
            <ItemSkeleton count={3} />
          ) : recentActivity.length === 0 ? (
            <EmptyState
              icon={<MessageSquareIcon className="size-5 text-muted-foreground" />}
              title="No responses yet"
              body="Once people submit your forms, you'll see them here."
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {recentActivity.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/dashboard/forms/${item.formId}/submissions`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground">
                      <MessageSquareIcon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        New response on {item.formTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.filledCount}{" "}
                        {item.filledCount === 1 ? "field filled" : "fields filled"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelative(item.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <CreateFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Small reusable bits                                                 */
/* ─────────────────────────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: number;
  loading?: boolean;
  icon?: React.ReactNode;
  accent?: "emerald" | "zinc" | "indigo" | "default";
}

function StatCard({ label, value, loading, icon, accent = "default" }: StatCardProps) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "indigo"
        ? "text-indigo-400"
        : accent === "zinc"
          ? "text-zinc-400"
          : "text-foreground";

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 px-4 py-3 transition-colors hover:bg-card/60">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon ? <span className="text-muted-foreground/70">{icon}</span> : null}
      </div>
      {loading ? (
        <div className="mt-2 h-8 w-14 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className={`mt-1.5 text-2xl font-semibold tracking-tight tabular-nums ${accentClass}`}>
          {value}
        </p>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, action, children }: SectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="divide-y divide-border/60">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="size-9 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted/60" />
          </div>
        </li>
      ))}
    </ul>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta?: React.ReactNode;
}

function EmptyState({ icon, title, body, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <div className="grid size-10 place-items-center rounded-xl border border-border/60 bg-muted/30">
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{body}</p>
      {cta ? <div className="mt-2">{cta}</div> : null}
    </div>
  );
}
