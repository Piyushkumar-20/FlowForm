import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { userService, formService } from "../../services";
import { adminProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  getAdminStatsOutputModel,
  getAdminRecentDataOutputModel,
  listAllFormsOutputModel,
  adminModerateFormInputModel,
  adminModerateFormOutputModel,
  adminToggleFeaturedOutputModel,
} from "./model";

const TAGS = ["Admin"];
const getPath = generatePath("/admin");

export const adminRouter = router({
  getAdminStats: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getAdminStats"), tags: TAGS, protect: true } })
    .input(z.undefined())
    .output(getAdminStatsOutputModel)
    .query(async () => {
      return userService.getAdminStats();
    }),

  getAdminRecentData: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getAdminRecentData"), tags: TAGS, protect: true } })
    .input(z.undefined())
    .output(getAdminRecentDataOutputModel)
    .query(async () => {
      const [recentUsers, recentForms] = await Promise.all([
        userService.getRecentUsers(8),
        userService.getRecentForms(8),
      ]);
      return { recentUsers, recentForms };
    }),

  /* ── Form moderation ──────────────────────────────────────────────── */

  listAllForms: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("/listAllForms"), tags: TAGS, protect: true } })
    .input(z.undefined())
    .output(listAllFormsOutputModel)
    .query(async () => {
      return formService.adminListAllForms();
    }),

  archiveAnyForm: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/archiveAnyForm"), tags: TAGS, protect: true } })
    .input(adminModerateFormInputModel)
    .output(adminModerateFormOutputModel)
    .mutation(async ({ input }) => {
      try {
        return await formService.adminArchiveAnyForm(input.formId);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[admin.archiveAnyForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to archive form." });
      }
    }),

  unarchiveAnyForm: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/unarchiveAnyForm"), tags: TAGS, protect: true } })
    .input(adminModerateFormInputModel)
    .output(adminModerateFormOutputModel)
    .mutation(async ({ input }) => {
      try {
        return await formService.adminUnarchiveAnyForm(input.formId);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[admin.unarchiveAnyForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to restore form." });
      }
    }),

  deleteAnyForm: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/deleteAnyForm"), tags: TAGS, protect: true } })
    .input(adminModerateFormInputModel)
    .output(adminModerateFormOutputModel)
    .mutation(async ({ input }) => {
      try {
        return await formService.adminDeleteAnyForm(input.formId);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[admin.deleteAnyForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete form." });
      }
    }),

  toggleFeaturedForm: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/toggleFeaturedForm"), tags: TAGS, protect: true } })
    .input(adminModerateFormInputModel)
    .output(adminToggleFeaturedOutputModel)
    .mutation(async ({ input }) => {
      try {
        return await formService.adminToggleFeaturedForm(input.formId);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[admin.toggleFeaturedForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update featured status." });
      }
    }),
});
