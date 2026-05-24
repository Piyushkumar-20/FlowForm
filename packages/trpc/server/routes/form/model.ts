import { z } from "zod";

export const createFormInputModel = z.object({
  title: z.string().min(1).max(20).describe("Title of the form"),
  description: z.string().max(300).optional().describe("Optional description"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("Created form id"),
  createdAt: z.string().describe("Creation timestamp (ISO string)"),
});


export const listFormsOutputModel = z.array(z.object({
    id: z.string().describe("Form unique ID"),
    title: z.string().nullable().optional().describe("Title of the form"),
    description: z.string().nullable().describe("Form description"),
    createdAt: z.date().nullable().describe('Creation timestamp'), 
    updatedAt: z.date().nullable().optional().describe("Last update timestamp"), 
  })
);
