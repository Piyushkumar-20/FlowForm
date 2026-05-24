import { z } from "zod";

export const createFormInputModel = z.object({
  title: z.string().min(1).max(20).describe("Title of the form"),
  description: z.string().max(300).optional().describe("Optional description"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("Created form id"),
  createdAt: z.string().describe("Creation timestamp (ISO string)"),
});
