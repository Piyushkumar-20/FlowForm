"use client";

import * as React from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
import { type Field, useDeleteField, useGetFields, useUpdateField } from "~/hooks/api/form";

const fieldTypes = [
  "TEXT", "YES_NO", "NUMBER", "EMAIL", "PASSWORD", "SELECT", "CHECKBOX", "RATING", "DATE",
] as const;

function formatFieldType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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
  });

  const { fields, isLoading, error, refetch } = useGetFields(formId);
  const { UpdateFieldAsync } = useUpdateField(formId);
  const { deleteFieldAsync } = useDeleteField(formId);

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
          if (!fieldMap.has(field.id)) {
            fieldMap.set(field.id, field);
          }
        });

      return Array.from(fieldMap.values());
    });
  }, [deletedFieldIds, fields]);

  const handleFieldCreated = (field: Field) => {
    setDeletedFieldIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.delete(field.id);
      return nextIds;
    });

    setLocalFields((currentFields) => {
      if (currentFields.some((currentField) => currentField.id === field.id)) {
        return currentFields;
      }

      return [...currentFields, field];
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
    });
  };

  const handleSaveField = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingField) {
      return;
    }

    const label = editValues.label.trim();

    if (!label) {
      toast.error("Field label is required");
      return;
    }

    try {
      const updatedField = await UpdateFieldAsync({
        fieldId: editingField.id,
        label,
        type: editValues.type,
        description: editValues.description.trim() || undefined,
        placeholder: editValues.placeholder.trim() || undefined,
        isRequired: editValues.isRequired,
      });

      setLocalFields((currentFields) =>
        currentFields.map((field) => (field.id === updatedField.id ? updatedField : field)),
      );
      setEditingField(null);
      toast.success("Field updated");
      void refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update field");
    }
  };

  const handleDeleteField = async (field: Field) => {
    const shouldDelete = window.confirm(`Delete "${field.label}"?`);

    if (!shouldDelete) {
      return;
    }

    setDeletedFieldIds((currentIds) => new Set(currentIds).add(field.id));
    setLocalFields((currentFields) =>
      currentFields.filter((currentField) => currentField.id !== field.id),
    );

    try {
      await deleteFieldAsync({ fieldId: field.id });
      toast.success("Field deleted");
      void refetch();
    } catch (error) {
      setDeletedFieldIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(field.id);
        return nextIds;
      });
      setLocalFields((currentFields) => {
        if (currentFields.some((currentField) => currentField.id === field.id)) {
          return currentFields;
        }

        return [...currentFields, field];
      });
      toast.error(error instanceof Error ? error.message : "Could not delete field");
    }
  };

  return (
    <main className="flex flex-1 justify-center px-4 py-8 md:px-8">
      <div className="w-full max-w-3xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Documents</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Form Builder</h1>
          </div>
          <Button type="button" className="rounded-xl" onClick={() => setIsAddFieldOpen(true)}>
            <PlusIcon className="size-4" />
            Add Field
          </Button>
        </div>

        {isLoading ? (
          <Card className="rounded-2xl border-border/70 bg-card/70 p-5">
            <CardContent className="px-0 py-8 text-center text-sm text-muted-foreground">
              Loading fields...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="rounded-2xl border-destructive/30 bg-destructive/5 p-5">
            <CardContent className="px-0 text-sm text-destructive">
              {error instanceof Error ? error.message : "We could not load this form's fields."}
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
                        {formatFieldType(field.type)}
                      </Badge>
                      {field.isRequired ? (
                        <Badge className="rounded-lg px-2 py-0.5 text-xs">Required</Badge>
                      ) : null}
                    </div>
                    {field.description ? (
                      <p className="text-sm font-medium text-foreground/85">{field.description}</p>
                    ) : null}
                    <p className="font-mono text-sm text-muted-foreground">
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
                      className="text-destructive/80 hover:text-destructive"
                      onClick={() => handleDeleteField(field)}
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
                  Add your first field to start shaping this form.
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

      <Dialog open={Boolean(editingField)} onOpenChange={(open) => !open && setEditingField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit field</DialogTitle>
            <DialogDescription>
              Update this field and the card will refresh immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveField} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-label" className="text-sm font-medium">
                Label
              </label>
              <Input
                id="edit-label"
                value={editValues.label}
                onChange={(event) =>
                  setEditValues((currentValues) => ({
                    ...currentValues,
                    label: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-type" className="text-sm font-medium">
                Type
              </label>
              <Select
                value={editValues.type}
                onValueChange={(type) =>
                  setEditValues((currentValues) => ({
                    ...currentValues,
                    type: type as (typeof fieldTypes)[number],
                  }))
                }
              >
                <SelectTrigger id="edit-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatFieldType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="edit-description"
                value={editValues.description}
                onChange={(event) =>
                  setEditValues((currentValues) => ({
                    ...currentValues,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-placeholder" className="text-sm font-medium">
                Placeholder
              </label>
              <Input
                id="edit-placeholder"
                value={editValues.placeholder}
                onChange={(event) =>
                  setEditValues((currentValues) => ({
                    ...currentValues,
                    placeholder: event.target.value,
                  }))
                }
              />
            </div>

            <div className="flex items-center gap-3 rounded-md border p-3">
              <Checkbox
                id="edit-is-required"
                checked={editValues.isRequired}
                onCheckedChange={(checked) =>
                  setEditValues((currentValues) => ({
                    ...currentValues,
                    isRequired: checked === true,
                  }))
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
