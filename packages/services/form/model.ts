import { z } from "zod";

export const createFormInput = z.object({
  title: z.string().min(1).max(20).describe("Title of the form"),
  description: z.string().max(300).optional().describe("Optional description"),
  createdBy: z.string().uuid().describe("UUID of the creating user"),
});
export type CreateFormInputType = z.infer<typeof createFormInput>;

export const createFormOutput = z.object({
  id: z.string(),
  createdAt: z.string(),
});
export type CreateFormOutputType = z.infer<typeof createFormOutput>;

export const listFormsByUserIdInput = z.object({
  userId: z.string().uuid().describe("UUID of the user"),
});
export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;

export const getFormByIdInput = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
});
export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>;

export const updateFormInput = z.object({
  formId: z.string().uuid(),
  title: z.string().min(1).max(20).optional(),
  description: z.string().max(300).optional(),
  visibility: z.enum(["public", "unlisted"]).optional(),
  expiresAt: z.date().nullable().optional(),
  maxResponses: z.number().int().positive().nullable().optional(),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").nullable().optional(),
});
export type UpdateFormInputType = z.infer<typeof updateFormInput>;

export const cloneFormInput = z.object({ formId: z.string().uuid() });
export type CloneFormInputType = z.infer<typeof cloneFormInput>;

export const archiveFormInput = z.object({ formId: z.string().uuid() });
export type ArchiveFormInputType = z.infer<typeof archiveFormInput>;

export const publishFormInput = z.object({
  formId: z.string().uuid(),
});
export type PublishFormInputType = z.infer<typeof publishFormInput>;

export const unpublishFormInput = z.object({
  formId: z.string().uuid(),
});
export type UnpublishFormInputType = z.infer<typeof unpublishFormInput>;

export const deleteFormInput = z.object({
  formId: z.string().uuid(),
});
export type DeleteFormInputType = z.infer<typeof deleteFormInput>;
