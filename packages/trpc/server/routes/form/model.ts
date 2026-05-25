import { z } from "zod";

/* COMMON FIELD SCHEMA*/

export const formFieldObject = z.object({
  id: z.string().uuid().describe("Field unique ID"),
  label: z.string().describe("Label of the form field"),
  type: z.enum(["TEXT", "YES_NO", "NUMBER", "EMAIL", "PASSWORD"]),
  description: z.string().nullable().optional().describe("Helper text for the field"),
  placeholder: z.string().nullable().optional().describe("Placeholder for the field"),
  isRequired: z.boolean().default(false).describe("Whether the field is required"),
  index: z.string().optional().describe("Ordering index of the field"),
});

/* CREATE FORM*/

export const createFormInputModel = z.object({
  title: z.string().min(1).max(20).describe("Title of the form"),

  description: z.string().max(300).optional().describe("Optional description"),
});

export const createFormOutputModel = z.object({
  id: z.string().uuid().describe("Created form id"),

  createdAt: z.string().describe("Creation timestamp (ISO string)"),
});

/* LIST FORMS */

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().uuid().describe("Form unique ID"),

    title: z.string().nullable().optional().describe("Title of the form"),

    description: z.string().nullable().describe("Form description"),

    createdAt: z.date().nullable().describe("Creation timestamp"),

    updatedAt: z.date().nullable().optional().describe("Last update timestamp"),
  }),
);

/*  FIELD ENUM */

export const formFieldEnum = z.enum(["TEXT", "YES_NO", "NUMBER", "EMAIL", "PASSWORD"]);

/*CREATE FIELD*/

export const createFieldInputModel = z.object({
  formId: z.string().uuid().describe("Form id"),

  label: z.string().max(100).describe("Label of the form field"),

  type: formFieldEnum.describe("Field type enum"),

  description: z.string().optional().describe("Helper text for the field"),

  placeholder: z.string().optional().describe("Placeholder for the field"),

  isRequired: z.boolean().default(false).describe("Whether the field is mandatory"),
});

export const createFieldOutputModel = formFieldObject;

/*UPDATE FIELD*/

export const updateFieldInputModel = z.object({
  fieldId: z.string().uuid().describe("Field ID"),

  label: z.string().max(100).optional().describe("Updated label"),

  type: formFieldEnum.optional().describe("Updated field type"),

  description: z.string().optional().describe("Updated helper text"),

  placeholder: z.string().optional().describe("Updated placeholder"),

  isRequired: z.boolean().optional().describe("Whether field is mandatory"),
});

export const updateFieldOutputModel = formFieldObject;

/* DELETE FIELD */

export const deleteFieldInputModel = z.object({
  fieldId: z.string().uuid().describe("Field ID"),
});

export const deleteFieldOutputModel = z.object({
  id: z.string().uuid().describe("Deleted field id"),
});

/* GET FIELDS*/

export const getFieldsInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const getFieldsOutputModel = z.array(formFieldObject);

/* DELETE FORM*/

export const deleteFormInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const deleteFormOutputModel = z.object({
  success: z.boolean().describe("Whether deletion succeeded"),

  message: z.string().describe("Deletion result message"),
});

/* GET FIELD */

export const getFieldInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
});

export const getFieldOutputModel = z.array(formFieldObject);

/* SUBMIT FORM */

export const submitFormInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
  values: z.array(
    z.object({
      formFieldId: z.string().uuid().describe("UUID of the form field"),
      value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
    }),
  ),
});

export const submitFormOutputModel = z.object({
  id: z.string().uuid().describe("Submission ID"),
  createdAt: z.date().describe("Submission timestamp"),
});

/* GET FORM BY ID*/

export const getFormByIdInputModel= z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const getFormByIdOutputModel = z
  .object({
    id: z.string().uuid().describe("Form unique ID"),

    title: z.string().nullable().optional().describe("Title of the form"),

    description: z.string().nullable().describe("Form description"),

    createdAt: z.date().nullable().describe("Creation timestamp"),

    updatedAt: z.date().nullable().optional().describe("Last update timestamp"),

    fields: z.array(formFieldObject),
  })
  .nullable();
