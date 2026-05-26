import { z } from "zod";

export const formFieldEnum = z.enum([
  "TEXT", "YES_NO", "NUMBER", "EMAIL", "PASSWORD", "SELECT", "CHECKBOX", "RATING", "DATE",
]);

export const conditionSchema = z.object({
  fieldId: z.string().uuid(),
  operator: z.enum(["equals", "not_equals", "contains", "is_empty", "is_not_empty"]),
  value: z.string(),
});
export type FieldCondition = z.infer<typeof conditionSchema>;

export const createFieldInput = z.object({
  label: z.string().max(100).describe("Label of the form field"),
  type: formFieldEnum.describe("Field type"),
  formId: z.string().uuid().describe("Form id"),
  description: z.string().optional().describe("Helper text for the field"),
  placeholder: z.string().optional().describe("Placeholder for the field"),
  isRequired: z.boolean().default(false).describe("Whether the field is mandatory"),
  options: z.array(z.string()).optional().describe("Options for SELECT/CHECKBOX fields"),
  page: z.number().int().min(1).default(1).optional(),
  conditions: z.array(conditionSchema).nullable().optional(),
});
export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const updateFieldInput = z.object({
  fieldId: z.string().uuid().describe("Field id"),
  label: z.string().max(100).optional().describe("Updated label"),
  type: formFieldEnum.optional().describe("Updated field type"),
  description: z.string().optional().describe("Updated helper text"),
  placeholder: z.string().optional().describe("Updated placeholder"),
  isRequired: z.boolean().optional().describe("Whether field is mandatory"),
  options: z.array(z.string()).optional().describe("Options for SELECT/CHECKBOX fields"),
  page: z.number().int().min(1).optional(),
  conditions: z.array(conditionSchema).nullable().optional(),
});
export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;

export const getFieldsInput = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
});
export type GetFieldsInputType = z.infer<typeof getFieldsInput>;

export const deleteFieldInput = z.object({
  fieldId: z.string().uuid().describe("UUID of the field to delete"),
});
export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;
