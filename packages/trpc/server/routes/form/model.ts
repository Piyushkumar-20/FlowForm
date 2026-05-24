import { z } from "zod";

export const createFormInputModel = z.object({
  title: z.string().min(1).max(20).describe("Title of the form"),
  description: z.string().max(300).optional().describe("Optional description"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("Created form id"),
  createdAt: z.string().describe("Creation timestamp (ISO string)"),
});

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().describe("Form unique ID"),
    title: z.string().nullable().optional().describe("Title of the form"),
    description: z.string().nullable().describe("Form description"),
    createdAt: z.date().nullable().describe("Creation timestamp"),
    updatedAt: z.date().nullable().optional().describe("Last update timestamp"),
  }),
);

export const formFieldEnum = z.enum(["TEXT", "YES_NO", "NUMBER", "EMAIL", "PASSWORD"]);

export const createFieldInputModel = z.object({
  formId: z.string().uuid().describe("Form id or the forms"),
  label: z.string().max(100).describe("Label of the form"),
  type: formFieldEnum.describe("Enums of the fields"),
  description: z.string().optional().describe("Helper text for the fields"),
  placeholder: z.string().optional().describe("Placeholder for the Form Field"),
  isRequired: z.boolean().default(false).describe("Weather the field is mandatory is not"),
});

export const createFieldOutputModel = z.object({
  id: z.string().uuid().describe("Form id or the forms"),
  label: z.string().describe("Label of the form"),
  type: formFieldEnum.describe("Enums of the fields"),
  description: z.string().optional().describe("Helper text for the fields"),
  placeholder: z.string().optional().describe("Placeholder for the Form Field"),
  isRequired: z.boolean().default(false).describe("Weather the field is mandatory is not"),
});

export const updateFieldInputModel = z.object({
  fieldId: z.string().uuid().describe("Form id or the forms"),
  label: z.string().max(100).describe("Label of the form").optional(),
  type: formFieldEnum.describe("Enums of the fields").optional(),
  description: z.string().optional().describe("Helper text for the fields"),
  placeholder: z.string().optional().describe("Placeholder for the Form Field"),
  isRequired: z
    .boolean()
    .default(false)
    .describe("Weather the field is mandatory is not")
    .optional(),
});

export const updateFieldOutputModel = z.object({
  id: z.string().uuid().describe("Form id or the forms"),
  label: z.string().describe("Label of the form"),
  type: formFieldEnum.describe("Enums of the fields"),
  description: z.string().optional().describe("Helper text for the fields"),
  placeholder: z.string().optional().describe("Placeholder for the Form Field"),
  isRequired: z.boolean().default(false).describe("Weather the field is mandatory is not"),
});

export const deleteFieldInputModel = z.object({
  fieldId: z.string().uuid().describe("Form id or the forms"),
});

export const getFieldsinputModel = z.object({
  formId: z.string().uuid().describe("Form id or the forms"),
});
export const getFieldsOutputModel = z.array(
  z.object({
    id: z.string().uuid().describe("Form id or the forms"),
    label: z.string().describe("Label of the form"),
    type: formFieldEnum.describe("Enums of the fields"),
    description: z.string().optional().nullable().describe("Helper text for the fields"),
    placeholder: z.string().optional().nullable().describe("Placeholder for the Form Field"),
    isRequired: z.boolean().default(false).describe("Weather the field is mandatory is not"),
  }),
);

export const deleteFormInputModel = z.object({
  formId: z.string().uuid().describe("Form id or the forms"),
});

export const deleteFormOutputModel = z.object({
  success: z.boolean().describe("Whether the form was successfully deleted"),
  message: z
    .string()
    .describe("A message providing additional information about the deletion result"),
});
