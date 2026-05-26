"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AddFieldModal } from "~/components/add-field-modal";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  type Field,
  useDeleteField,
  useDeleteForm,
  useGetFields,
  useGetFormForDashboard,
  usePublishForm,
  useUnpublishForm,
  useUpdateField,
  useUpdateForm,
} from "~/hooks/api/form";

const fieldTypes = [
  "TEXT", "YES_NO", "NUMBER", "EMAIL", "PASSWORD", "SELECT", "CHECKBOX", "RATING", "DATE",
] as const;

const FIELD_TYPE_LABELS: Record<(typeof fieldTypes)[number], string> = {
  TEXT: "Text",
  YES_NO: "Yes / No",
  NUMBER: "Number",
  EMAIL: "Email",
  PASSWORD: "Password",
  SELECT: "Select",
  CHECKBOX: "Checkbox",
  RATING: "Rating",
  DATE: "Date",
};

const STATUS_BADGE = {
  draft: { label: "Draft", className: "bg-zinc-700/40 text-zinc-300 border-zinc-700/60" },
  published: { label: "Published", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  unpublished: { label: "Unpublished", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
} as const;

function formatLabelKey(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = React.use(params);
  const router = useRouter();

  const [isAddFieldOpen, setIsAddFieldOpen] = React.useState(false);
  const [localFields, setLocalFields] = React.useState<Field[]>([]);
  const [deletedFieldIds, setDeletedFieldIds] = React.useState<Set<string>>(() => new Set());
  const [editingField, setEditingField] = React.useState<Field | null>(null);
  const [editValues, setEditValues] = React.useState({
    label: "",
    type: "TEXT" as (typeof fieldTypes)[number],
    description: "",
    placeholder: "",
    isRequired: false,
    options: [] as string[],
  });
  const [newEditOption, setNewEditOption] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const { form, isLoading: formLoading } = useGetFormForDashboard(formId);
  const { fields, isLoading: fieldsLoading, error: fieldsError, refetch } = useGetFields(formId);
  const { UpdateFieldAsync } = useUpdateField(formId);
  const { deleteFieldAsync } = useDeleteField(formId);
  const { publishFormAsync, isPending: isPublishing } = usePublishForm();
  const { unpublishFormAsync, isPending: isUnpublishing } = useUnpublishForm();
  const { updateFormAsync, isPending: isUpdatingForm } = useUpdateForm();
  const { deleteFormAsync } = useDeleteForm();

  React.useEffect(() => {
    setLocalFields([]);
    setDeletedFieldIds(new Set());
  }, [formId]);

  React.useEffect(() => {
    setLocalFields((currentFields) => {
      const fieldMap = new Map<string, Field>();
      fields
        ?.filter((field) => !deletedFieldIds.has(field.id))
        .forEach((field) => fieldMap.set(field.id, field));
      currentFields
        .filter((field) => !deletedFieldIds.has(field.id))
        .forEach((field) => {
          if (!fieldMap.has(field.id)) fieldMap.set(field.id, field);
        });
      return Array.from(fieldMap.values());
    });
  }, [deletedFieldIds, fields]);

  const handleFieldCreated = (field: Field) => {
    setDeletedFieldIds((ids) => {
      const next = new Set(ids);
      next.delete(field.id);
      return next;
    });
    setLocalFields((current) => {
      if (current.some((f) => f.id === field.id)) return current;
      return [...current, field];
    });
    void refetch();
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setEditValues({
      label: field.label,
      type: field.type,
      description: field.description ?? "",
      placeholder: field.placeholder ?? "",
      isRequired: field.isRequired,
      options: field.options ?? [],
    });
    setNewEditOption("");
  };

  const handleSaveField = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingField) return;

    const label = editValues.label.trim();
    if (!label) {
      toast.error("Field label is required");
      return;
    }

    const needsOptions = editValues.type === "SELECT" || editValues.type === "CHECKBOX";

    try {
      const updatedField = await UpdateFieldAsync({
        fieldId: editingField.id,
        label,
        type: editValues.type,
        description: editValues.description.trim() || undefined,
        placeholder: editValues.placeholder.trim() || undefined,
        isRequired: editValues.isRequired,
        options: needsOptions ? editValues.options : undefined,
      });

      setLocalFields((current) =>
        current.map((f) => (f.id === updatedField.id ? updatedField : f)),
      );
      setEditingField(null);
      toast.success("Field updated");
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update field");
    }
  };

  const handleDeleteField = async (field: Field) => {
    if (!window.confirm(`Delete "${field.label}"?`)) return;

    setDeletedFieldIds((ids) => new Set(ids).add(field.id));
    setLocalFields((current) => current.filter((f) => f.id !== field.id));

    try {
      await deleteFieldAsync({ fieldId: field.id });
      toast.success("Field deleted");
      void refetch();
    } catch (err) {
      setDeletedFieldIds((ids) => {
        const next = new Set(ids);
        next.delete(field.id);
        return next;
      });
      setLocalFields((current) => {
        if (current.some((f) => f.id === field.id)) return current;
        return [...current, field];
      });
      toast.error(err instanceof Error ? err.message : "Could not delete field");
    }
  };

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(`${window.location.origin}/form/${formId}`);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishToggle = async () => {
    if (!form) return;
    try {
      if (form.status === "published") {
        await unpublishFormAsync({ formId });
        toast.success("Form unpublished");
      } else {
        await publishFormAsync({ formId });
        toast.success("Form is now live");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update form status");
    }
  };

  const handleVisibilityChange = async (visibility: "public" | "unlisted") => {
    try {
      await updateFormAsync({ formId, visibility });
      toast.success(`Visibility set to ${visibility}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update visibility");
    }
  };

  const handleDeleteForm = async () => {
    if (
      !window.confirm(
        "Delete this form? All fields and submissions will be permanently removed.",
      )
    )
      return;
    try {
      await deleteFormAsync({ formId });
      toast.success("Form deleted");
      router.push("/dashboard/forms");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete form");
    }
  };

  const isPublishPending = isPublishing || isUnpublishing;
  const needsEditOptions = editValues.type === "SELECT" || editValues.type === "CHECKBOX";
  const statusInfo = form ? STATUS_BADGE[form.status] : null;

  return (
    <main className="flex flex-1 justify-center px-4 py-8 md:px-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Back nav */}
        <Link
          href="/dashboard/forms"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Forms
        </Link>

        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Title + description */}
          <div className="min-w-0 space-y-1">
            {formLoading ? (
              <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {form?.title ?? "Untitled Form"}
                </h1>
                {statusInfo ? (
                  <span
                    className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </span>
                ) : null}
              </div>
            )}
            {form?.description ? (
              <p className="text-sm text-muted-foreground">{form.description}</p>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy shareable link */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={handleCopyLink}
              disabled={form?.status !== "published"}
              title={
                form?.status !== "published"
                  ? "Publish the form first to share it"
                  : "Copy shareable link"
              }
            >
              {copied ? (
                <CheckIcon className="size-4 text-emerald-400" />
              ) : (
                <CopyIcon className="size-4" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>

            {/* Visibility */}
            <Select
              value={form?.visibility ?? "public"}
              onValueChange={(v) => void handleVisibilityChange(v as "public" | "unlisted")}
              disabled={!form || isUpdatingForm}
            >
              <SelectTrigger className="h-9 w-[116px] rounded-xl text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>

            {/* Publish / Unpublish */}
            <Button
              type="button"
              variant={form?.status === "published" ? "outline" : "default"}
              size="sm"
              className="rounded-xl"
              onClick={() => void handlePublishToggle()}
              disabled={!form || isPublishPending}
            >
              {isPublishPending
                ? "Saving…"
                : form?.status === "published"
                  ? "Unpublish"
                  : "Publish"}
            </Button>

            {/* Delete form */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-xl text-destructive/60 hover:text-destructive"
              onClick={() => void handleDeleteForm()}
              aria-label="Delete form"
            >
              <Trash2Icon className="size-4" />
            </Button>

            {/* Add Field */}
            <Button
              type="button"
              size="sm"
              className="rounded-xl"
              onClick={() => setIsAddFieldOpen(true)}
            >
              <PlusIcon className="size-4" />
              Add Field
            </Button>
          </div>
        </div>

        {/* Fields list */}
        {fieldsLoading ? (
          <Card className="rounded-2xl border-border/70 bg-card/70 p-5">
            <CardContent className="px-0 py-8 text-center text-sm text-muted-foreground">
              Loading fields…
            </CardContent>
          </Card>
        ) : fieldsError ? (
          <Card className="rounded-2xl border-destructive/30 bg-destructive/5 p-5">
            <CardContent className="px-0 text-sm text-destructive">
              {fieldsError instanceof Error
                ? fieldsError.message
                : "Could not load this form's fields."}
            </CardContent>
          </Card>
        ) : localFields.length ? (
          <div className="space-y-3">
            {localFields.map((field) => (
              <Card
                key={field.id}
                className="group rounded-2xl border-border/70 bg-card/70 py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-md"
              >
                <CardHeader className="px-5 py-4">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base leading-6">{field.label}</CardTitle>
                      <Badge variant="secondary" className="rounded-lg px-2 py-0.5 text-xs">
                        {FIELD_TYPE_LABELS[field.type] ?? field.type}
                      </Badge>
                      {field.isRequired ? (
                        <Badge className="rounded-lg px-2 py-0.5 text-xs">Required</Badge>
                      ) : null}
                    </div>

                    {field.description ? (
                      <p className="text-sm text-foreground/80">{field.description}</p>
                    ) : null}

                    {field.options && field.options.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {field.options.map((opt) => (
                          <span
                            key={opt}
                            className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <p className="font-mono text-xs text-muted-foreground/70">
                      {formatLabelKey(field.label)}
                    </p>
                  </div>

                  <CardAction className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleEditField(field)}
                      aria-label={`Edit ${field.label}`}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive/70 hover:text-destructive"
                      onClick={() => void handleDeleteField(field)}
                      aria-label={`Delete ${field.label}`}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </CardAction>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-dashed border-border/80 bg-card/50 py-0">
            <CardContent className="flex flex-col items-center justify-center gap-3 px-5 py-10 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl border bg-background">
                <PlusIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold">No fields yet</h2>
                <p className="text-sm text-muted-foreground">
                  Add your first field to start building this form.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-1 rounded-xl"
                onClick={() => setIsAddFieldOpen(true)}
              >
                <PlusIcon className="size-4" />
                Add Field
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddFieldModal
        formId={formId}
        open={isAddFieldOpen}
        onOpenChange={setIsAddFieldOpen}
        onFieldCreated={handleFieldCreated}
      />

      {/* Edit Field Dialog */}
      <Dialog open={Boolean(editingField)} onOpenChange={(open) => !open && setEditingField(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit field</DialogTitle>
            <DialogDescription>Changes are saved immediately to the form.</DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => void handleSaveField(e)} className="space-y-4">
            {/* Label */}
            <div className="space-y-2">
              <label htmlFor="edit-label" className="text-sm font-medium">
                Label
              </label>
              <Input
                id="edit-label"
                value={editValues.label}
                onChange={(e) => setEditValues((v) => ({ ...v, label: e.target.value }))}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label htmlFor="edit-type" className="text-sm font-medium">
                Type
              </label>
              <Select
                value={editValues.type}
                onValueChange={(type) =>
                  setEditValues((v) => ({
                    ...v,
                    type: type as (typeof fieldTypes)[number],
                    options: type === "SELECT" || type === "CHECKBOX" ? v.options : [],
                  }))
                }
              >
                <SelectTrigger id="edit-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {FIELD_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options — SELECT / CHECKBOX */}
            {needsEditOptions ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                <div className="space-y-2">
                  {editValues.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex-1 rounded-md border border-border/70 bg-muted/30 px-3 py-1.5 text-sm">
                        {opt}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          setEditValues((v) => ({
                            ...v,
                            options: v.options.filter((_, idx) => idx !== i),
                          }))
                        }
                        aria-label={`Remove option ${opt}`}
                      >
                        <XIcon className="size-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newEditOption}
                      placeholder="Type an option and press Enter…"
                      onChange={(e) => setNewEditOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = newEditOption.trim();
                          if (val && !editValues.options.includes(val)) {
                            setEditValues((v) => ({ ...v, options: [...v.options, val] }));
                            setNewEditOption("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const val = newEditOption.trim();
                        if (val && !editValues.options.includes(val)) {
                          setEditValues((v) => ({ ...v, options: [...v.options, val] }));
                          setNewEditOption("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="edit-description"
                value={editValues.description}
                onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))}
              />
            </div>

            {/* Placeholder */}
            <div className="space-y-2">
              <label htmlFor="edit-placeholder" className="text-sm font-medium">
                Placeholder
              </label>
              <Input
                id="edit-placeholder"
                value={editValues.placeholder}
                onChange={(e) => setEditValues((v) => ({ ...v, placeholder: e.target.value }))}
              />
            </div>

            {/* Required */}
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Checkbox
                id="edit-is-required"
                checked={editValues.isRequired}
                onCheckedChange={(checked) =>
                  setEditValues((v) => ({ ...v, isRequired: checked === true }))
                }
              />
              <label htmlFor="edit-is-required" className="text-sm font-medium leading-none">
                Required field
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingField(null)}>
                Cancel
              </Button>
              <Button type="submit">Save field</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
