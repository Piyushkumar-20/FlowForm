"use client";

import * as React from "react";
import Link from "next/link";
import { CompassIcon, PlusIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { CreateFormModal } from "~/components/create-form-modal";
import { FormsListTable } from "~/components/forms-list-table";
import { useListForms } from "~/hooks/api/form";

export default function FormsPage() {
  const [open, setOpen] = React.useState(false);
  const [showArchived, setShowArchived] = React.useState(false);
  const { forms, isLoading } = useListForms();

  const active = forms.filter((f) => !f.isArchived);
  const archived = forms.filter((f) => f.isArchived);
  const published = active.filter((f) => f.status === "published").length;
  const drafts = active.filter((f) => f.status === "draft").length;

  const displayed = showArchived ? forms : active;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
          <p className="text-sm text-muted-foreground">
            Manage your forms, track responses, and share links with respondents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <Link href="/explore">
              <CompassIcon className="size-4" />
              Explore
            </Link>
          </Button>
          <Button onClick={() => setOpen(true)} className="rounded-xl">
            <PlusIcon className="size-4" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Total forms" value={active.length} loading={isLoading} />
        <StatCard
          label="Published"
          value={published}
          loading={isLoading}
          accent="emerald"
        />
        <StatCard
          label="Drafts"
          value={drafts}
          loading={isLoading}
          accent="zinc"
        />
        <StatCard
          label="Archived"
          value={archived.length}
          loading={isLoading}
          accent="amber"
        />
      </div>

      {/* Toolbar */}
      {!isLoading && archived.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Switch
            id="show-archived"
            checked={showArchived}
            onCheckedChange={setShowArchived}
          />
          <label htmlFor="show-archived" className="cursor-pointer select-none">
            Show archived forms ({archived.length})
          </label>
        </div>
      )}

      {/* Table */}
      <FormsListTable
        forms={displayed}
        isLoading={isLoading}
        onCreateForm={() => setOpen(true)}
      />

      <CreateFormModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  loading?: boolean;
  accent?: "emerald" | "zinc" | "amber" | "default";
}

function StatCard({ label, value, loading, accent = "default" }: StatCardProps) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "zinc"
        ? "text-zinc-400"
        : accent === "amber"
          ? "text-amber-400"
          : "text-foreground";

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-12" />
      ) : (
        <p
          className={`mt-1 text-2xl font-semibold tracking-tight ${accentClass}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}
