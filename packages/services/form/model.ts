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
});
export type UpdateFormInputType = z.infer<typeof updateFormInput>;

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
