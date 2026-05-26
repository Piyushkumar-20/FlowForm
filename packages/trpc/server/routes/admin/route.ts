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
    .meta({ openapi: { method: "POST", path: getPath("/getAdminStats"), tags: TAGS, protect: true } })
    .output(getAdminStatsOutputModel)
    .query(async () => {
      return userService.getAdminStats();
    }),

  getAdminRecentData: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/getAdminRecentData"), tags: TAGS, protect: true } })
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
    .meta({ openapi: { method: "POST", path: getPath("/listAllForms"), tags: TAGS, protect: true } })
    .output(listAllFormsOutputModel)
    .query(async () => {
      return formService.adminListAllForms();
    }),

  archiveAnyForm: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/archiveAnyForm"), tags: TAGS, protect: true } })
    .input(adminModerateFormInputModel)
    .output(adminModerateFormOutputModel)
    .mutation(async ({ input }) => {
      return formService.adminArchiveAnyForm(input.formId);
    }),

  unarchiveAnyForm: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/unarchiveAnyForm"), tags: TAGS, protect: true } })
    .input(adminModerateFormInputModel)
    .output(adminModerateFormOutputModel)
    .mutation(async ({ input }) => {
      return formService.adminUnarchiveAnyForm(input.formId);
    }),

  deleteAnyForm: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/deleteAnyForm"), tags: TAGS, protect: true } })
    .input(adminModerateFormInputModel)
    .output(adminModerateFormOutputModel)
    .mutation(async ({ input }) => {
      return formService.adminDeleteAnyForm(input.formId);
    }),

  toggleFeaturedForm: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/toggleFeaturedForm"), tags: TAGS, protect: true } })
    .input(adminModerateFormInputModel)
    .output(adminToggleFeaturedOutputModel)
    .mutation(async ({ input }) => {
      return formService.adminToggleFeaturedForm(input.formId);
    }),
});
