"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { CreateFormModal } from "~/components/create-form-modal";
import { FormsListTable } from "~/components/forms-list-table";
import { useListForms } from "~/hooks/api/form";

export default function FormsPage() {
  const [open, setOpen] = React.useState(false);
  const { forms, isLoading } = useListForms();

  const total = forms.length;
  const published = forms.filter((f) => f.status === "published").length;
  const drafts = forms.filter((f) => f.status === "draft").length;

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
        <Button onClick={() => setOpen(true)} className="rounded-xl">
          <PlusIcon className="size-4" />
          Create Form
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total forms" value={total} loading={isLoading} />
        <StatCard label="Published" value={published} loading={isLoading} accent="emerald" />
        <StatCard label="Drafts" value={drafts} loading={isLoading} accent="zinc" />
      </div>

      {/* Table */}
      <FormsListTable onCreateForm={() => setOpen(true)} />

      <CreateFormModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  loading?: boolean;
  accent?: "emerald" | "zinc" | "default";
}

function StatCard({ label, value, loading, accent = "default" }: StatCardProps) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "zinc"
        ? "text-zinc-400"
        : "text-foreground";

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {loading ? (
        <div className="mt-2 h-7 w-12 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className={`mt-1 text-2xl font-semibold tracking-tight ${accentClass}`}>{value}</p>
      )}
    </div>
  );
}
