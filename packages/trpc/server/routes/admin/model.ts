import { z } from "zod";

export const getAdminStatsOutputModel = z.object({
  totalUsers: z.number(),
  totalForms: z.number(),
  totalSubmissions: z.number(),
});

export const recentUserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  createdAt: z.date().nullable(),
});

export const recentFormSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["draft", "published", "unpublished"]),
  visibility: z.enum(["public", "unlisted"]),
  createdAt: z.date().nullable(),
});

export const getAdminRecentDataOutputModel = z.object({
  recentUsers: z.array(recentUserSchema),
  recentForms: z.array(recentFormSchema),
});

/* ── Form moderation ────────────────────────────────────────────────── */

export const adminFormSchema = z.object({
  id: z.string().uuid(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.enum(["draft", "published", "unpublished"]),
  visibility: z.enum(["public", "unlisted"]),
  isArchived: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.date().nullable(),
  ownerName: z.string().nullable(),
  ownerEmail: z.string().nullable(),
});

export const listAllFormsOutputModel = z.array(adminFormSchema);

export const adminModerateFormInputModel = z.object({
  formId: z.string().uuid(),
});

export const adminModerateFormOutputModel = z.object({
  success: z.boolean(),
});

export const adminToggleFeaturedOutputModel = z.object({
  success: z.boolean(),
  isFeatured: z.boolean(),
});
