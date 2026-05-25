import { z } from "zod";

export const createFormInput = z.object({
  title: z.string().min(1).max(20).describe("The title of the form"),
  description: z.string().max(300).optional().describe("Optional description for the form"),
  createdBy: z.string().uuid().describe("UUID of the creating user"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const createFormOutput = z.object({
  id: z.string(),
  createdAt: z.string(),
});

export type CreateFormOutputType = z.infer<typeof createFormOutput>;

export const listFormsByUserIdInput= z.object({
  userId: z.string().uuid().describe("UUID of the user")
})

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>

export const getFormByIdInput = z.object({
  formId: z.string().uuid().describe("UUID of the form")
});

export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>;

export const getFormByIdOutput = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.date().nullable(),
  createdBy: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type GetFormByIdOutputType = z.infer<typeof getFormByIdOutput>;