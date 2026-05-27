import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authenticateProcedure, adminProcedure, router } from "../../trpc";
import { userService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  updatePlanInputModel,
  updatePlanOutputModel,
  listUserPlansOutputModel,
} from "./model";

const TAGS = ["Billing"];
const getPath = generatePath("/billing");

export const billingRouter = router({
  updatePlan: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/updatePlan"), tags: TAGS, protect: true } })
    .input(updatePlanInputModel)
    .output(updatePlanOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        await userService.updateUserPlan(ctx.user.id, input.plan);
        return { success: true, plan: input.plan };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[billing.updatePlan] error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update subscription. Please try again.",
        });
      }
    }),

  listUserPlans: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("/listUserPlans"), tags: TAGS, protect: true } })
    .input(z.undefined())
    .output(listUserPlansOutputModel)
    .query(async () => {
      try {
        return await userService.getUsersWithPlans();
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[billing.listUserPlans] error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load user plans.",
        });
      }
    }),
});
