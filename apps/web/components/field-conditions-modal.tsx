"use client";

import * as React from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "~/components/ui/button";
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
import type { Field } from "~/hooks/api/form";

type Operator = "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";

interface Condition {
  fieldId: string;
  operator: Operator;
  value: string;
}

const OPERATOR_LABELS: Record<Operator, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

const VALUE_LESS_OPERATORS: Operator[] = ["is_empty", "is_not_empty"];

interface FieldConditionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: Field;
  allFields: Field[];
  onSave: (conditions: Condition[]) => Promise<void>;
}

export function FieldConditionsModal({
  open,
  onOpenChange,
  field,
  allFields,
  onSave,
}: FieldConditionsModalProps) {
  const [conditions, setConditions] = React.useState<Condition[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);

  const eligibleFields = allFields.filter((f) => f.id !== field.id);

  React.useEffect(() => {
    if (open) {
      setConditions(
        (field.conditions ?? []).map((c) => ({
          fieldId: c.fieldId,
          operator: c.operator as Operator,
          value: c.value,
        })),
      );
    }
  }, [open, field.conditions]);

  const addCondition = () => {
    const firstField = eligibleFields[0];
    if (!firstField) return;
    setConditions((prev) => [
      ...prev,
      { fieldId: firstField.id, operator: "equals", value: "" },
    ]);
  };

  const updateCondition = (index: number, patch: Partial<Condition>) => {
    setConditions((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        const updated = { ...c, ...patch };
        if (patch.operator && VALUE_LESS_OPERATORS.includes(patch.operator as Operator)) {
          updated.value = "";
        }
        return updated;
      }),
    );
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(conditions);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Conditional logic</DialogTitle>
          <DialogDescription>
            Show &ldquo;{field.label}&rdquo; only when ALL of these conditions are
            met. Leave empty to always show.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {eligibleFields.length === 0 ? (
            <p className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
              Add more fields to the form before configuring conditions.
            </p>
          ) : conditions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No conditions — this field is always visible.
            </p>
          ) : (
            conditions.map((cond, index) => {
              const isValueless = VALUE_LESS_OPERATORS.includes(cond.operator);
              return (
                <div
                  key={index}
                  className="flex flex-wrap items-start gap-2 rounded-lg border border-border/60 bg-muted/20 p-3"
                >
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {/* Field selector */}
                    <Select
                      value={cond.fieldId}
                      onValueChange={(v) => updateCondition(index, { fieldId: v })}
                    >
                      <SelectTrigger className="h-8 min-w-[140px] flex-1 text-sm">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleFields.map((f) => (
                          <SelectItem key={f.id} value={f.id} className="text-sm">
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Operator selector */}
                    <Select
                      value={cond.operator}
                      onValueChange={(v) =>
                        updateCondition(index, { operator: v as Operator })
                      }
                    >
                      <SelectTrigger className="h-8 min-w-[130px] flex-1 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OPERATOR_LABELS).map(([op, label]) => (
                          <SelectItem key={op} value={op} className="text-sm">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Value input */}
                    {!isValueless ? (
                      <Input
                        value={cond.value}
                        placeholder="Value…"
                        className="h-8 flex-1 min-w-[100px] text-sm"
                        onChange={(e) =>
                          updateCondition(index, { value: e.target.value })
                        }
                      />
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-0.5 shrink-0 text-destructive/60 hover:text-destructive"
                    onClick={() => removeCondition(index)}
                    aria-label="Remove condition"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              );
            })
          )}

          {eligibleFields.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-lg"
              onClick={addCondition}
            >
              <PlusIcon className="size-4" />
              Add condition
            </Button>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save conditions"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
