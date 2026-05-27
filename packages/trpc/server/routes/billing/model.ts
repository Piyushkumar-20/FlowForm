import { z } from "zod";

export const subscriptionPlanSchema = z.enum(["free", "pro", "enterprise"]);

export const updatePlanInputModel = z.object({
  plan: subscriptionPlanSchema,
});

export const updatePlanOutputModel = z.object({
  success: z.boolean(),
  plan: subscriptionPlanSchema,
});

export const userPlanSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  plan: subscriptionPlanSchema,
  planUpdatedAt: z.date().nullable(),
  createdAt: z.date().nullable(),
});

export const listUserPlansOutputModel = z.array(userPlanSchema);
