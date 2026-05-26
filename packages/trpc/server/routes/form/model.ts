import { z } from "zod";

/* ENUMS */

export const formFieldEnum = z.enum([
  "TEXT", "YES_NO", "NUMBER", "EMAIL", "PASSWORD", "SELECT", "CHECKBOX", "RATING", "DATE",
]);

export const formStatusEnum = z.enum(["draft", "published", "unpublished"]);
export const formVisibilityEnum = z.enum(["public", "unlisted"]);

/* CONDITION SCHEMA */

export const conditionSchema = z.object({
  fieldId: z.string().uuid(),
  operator: z.enum(["equals", "not_equals", "contains", "is_empty", "is_not_empty"]),
  value: z.string(),
});
export type FieldCondition = z.infer<typeof conditionSchema>;

/* COMMON FIELD SCHEMA */

export const formFieldObject = z.object({
  id: z.string().uuid().describe("Field unique ID"),
  label: z.string().describe("Label of the form field"),
  labelKey: z.string().optional().describe("Slug key derived from label"),
  type: formFieldEnum,
  description: z.string().nullable().optional().describe("Helper text for the field"),
  placeholder: z.string().nullable().optional().describe("Placeholder for the field"),
  isRequired: z.boolean().default(false).describe("Whether the field is required"),
  index: z.string().optional().describe("Ordering index of the field"),
  options: z.array(z.string()).nullable().optional().describe("Options for SELECT/CHECKBOX fields"),
  page: z.number().int().min(1).optional().describe("Page number this field belongs to"),
  conditions: z.array(conditionSchema).nullable().optional().describe("Conditional visibility rules"),
});

/* CREATE FORM */

export const createFormInputModel = z.object({
  title: z.string().min(1).max(20).describe("Title of the form"),
  description: z.string().max(300).optional().describe("Optional description"),
});

export const createFormOutputModel = z.object({
  id: z.string().uuid().describe("Created form ID"),
  createdAt: z.string().describe("Creation timestamp (ISO string)"),
});

/* UPDATE FORM */

export const updateFormInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
  title: z.string().min(1).max(20).optional().describe("Updated title"),
  description: z.string().max(300).optional().describe("Updated description"),
  visibility: formVisibilityEnum.optional().describe("Updated visibility"),
  expiresAt: z.date().nullable().optional().describe("Form expiry date"),
  maxResponses: z.number().int().positive().nullable().optional().describe("Max response limit"),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").nullable().optional().describe("Custom URL slug"),
});

export const updateFormOutputModel = z.object({
  id: z.string().uuid(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: formStatusEnum,
  visibility: formVisibilityEnum,
  updatedAt: z.date().nullable().optional(),
});

/* PUBLISH / UNPUBLISH */

export const publishFormInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const publishFormOutputModel = z.object({
  id: z.string().uuid(),
  status: formStatusEnum,
});

export const unpublishFormInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const unpublishFormOutputModel = z.object({
  id: z.string().uuid(),
  status: formStatusEnum,
});

/* DELETE FORM */

export const deleteFormInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const deleteFormOutputModel = z.object({
  success: z.boolean().describe("Whether deletion succeeded"),
  message: z.string().describe("Result message"),
});

/* LIST FORMS */

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().uuid().describe("Form unique ID"),
    title: z.string().nullable().optional().describe("Title of the form"),
    description: z.string().nullable().describe("Form description"),
    status: formStatusEnum.describe("Form publish status"),
    visibility: formVisibilityEnum.describe("Form visibility mode"),
    isArchived: z.boolean().describe("Whether the form is archived"),
    createdAt: z.date().nullable().describe("Creation timestamp"),
    updatedAt: z.date().nullable().optional().describe("Last update timestamp"),
  }),
);

/* GET PUBLIC FORMS (explore page) */

export const getPublicFormsOutputModel = z.array(
  z.object({
    id: z.string().uuid(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    isFeatured: z.boolean(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable().optional(),
  }),
);

/* GET FORM FOR DASHBOARD (authenticated) */

export const getFormForDashboardInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const getFormForDashboardOutputModel = z.object({
  id: z.string().uuid(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: formStatusEnum,
  visibility: formVisibilityEnum,
  expiresAt: z.date().nullable().optional(),
  maxResponses: z.number().int().nullable().optional(),
  slug: z.string().nullable().optional(),
  isArchived: z.boolean(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable().optional(),
});

/* GET FORM BY ID (public) */

export const getFormByIdInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const getFormByIdOutputModel = z
  .object({
    id: z.string().uuid(),
    title: z.string().nullable().optional(),
    description: z.string().nullable(),
    status: formStatusEnum,
    visibility: formVisibilityEnum,
    expiresAt: z.date().nullable().optional(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable().optional(),
    fields: z.array(formFieldObject),
  })
  .nullable();

/* FIELD CRUD */

export const createFieldInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
  label: z.string().max(100).describe("Label of the form field"),
  type: formFieldEnum.describe("Field type"),
  description: z.string().optional().describe("Helper text for the field"),
  placeholder: z.string().optional().describe("Placeholder for the field"),
  isRequired: z.boolean().default(false).describe("Whether the field is mandatory"),
  options: z.array(z.string()).optional().describe("Options for SELECT/CHECKBOX fields"),
  page: z.number().int().min(1).default(1).optional().describe("Page number for multi-page forms"),
  conditions: z.array(conditionSchema).nullable().optional().describe("Conditional visibility rules"),
});

export const createFieldOutputModel = formFieldObject;

export const updateFieldInputModel = z.object({
  fieldId: z.string().uuid().describe("Field ID"),
  label: z.string().max(100).optional().describe("Updated label"),
  type: formFieldEnum.optional().describe("Updated field type"),
  description: z.string().optional().describe("Updated helper text"),
  placeholder: z.string().optional().describe("Updated placeholder"),
  isRequired: z.boolean().optional().describe("Whether field is mandatory"),
  options: z.array(z.string()).optional().describe("Options for SELECT/CHECKBOX fields"),
  page: z.number().int().min(1).optional().describe("Page number for multi-page forms"),
  conditions: z.array(conditionSchema).nullable().optional().describe("Conditional visibility rules"),
});

export const updateFieldOutputModel = formFieldObject;

export const deleteFieldInputModel = z.object({
  fieldId: z.string().uuid().describe("Field ID"),
});

export const deleteFieldOutputModel = z.object({
  id: z.string().uuid().describe("Deleted field ID"),
});

export const getFieldsInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const getFieldsOutputModel = z.array(formFieldObject);

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

/* GET FORM SUBMISSIONS */

export const getFormSubmissionsInputModel = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
});

export const getFormSubmissionsOutputModel = z.array(
  z.object({
    id: z.string().uuid().describe("Submission ID"),
    values: z.array(
      z.object({
        formFieldId: z.string().uuid(),
        value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
      }),
    ),
    createdAt: z.date().describe("Submission timestamp"),
  }),
);

/* CLONE FORM */

export const cloneFormInputModel = z.object({
  formId: z.string().uuid().describe("Form ID to clone"),
});

export const cloneFormOutputModel = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
});

/* ARCHIVE / RESTORE FORM */

export const archiveFormInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const archiveFormOutputModel = z.object({
  success: z.boolean(),
});

/* GET FORM BY SLUG (public) */

export const getFormBySlugInputModel = z.object({
  slug: z.string().describe("Custom URL slug"),
});

export const getFormBySlugOutputModel = getFormByIdOutputModel;

/* Legacy aliases kept for backward compat */
export const getFieldInputModel = getFieldsInputModel;
export const getFieldOutputModel = getFieldsOutputModel;
