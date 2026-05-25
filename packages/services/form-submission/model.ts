import { z } from "zod";

export const submitFormInput = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
  values: z.array(
    z.object({
      formFieldId: z.string().uuid().describe("UUID of the form field"),
      value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
    }),
  ),
});
export type SubmitFormInputType = z.infer<typeof submitFormInput>;

export const getFormSubmissionsInput = z.object({
  formId: z.string().uuid().describe("UUID of the form"),
});
export type GetFormSubmissionsInputType = z.infer<typeof getFormSubmissionsInput>;