import { userService } from "../../services";
import { adminProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  getAdminStatsOutputModel,
  getAdminRecentDataOutputModel,
} from "./model";

const TAGS = ["Admin"];
const getPath = generatePath("/admin");

export const adminRouter = router({
  getAdminStats: adminProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/getAdminStats"),
        tags: TAGS,
        protect: true,
      },
    })
    .output(getAdminStatsOutputModel)
    .query(async () => {
      return userService.getAdminStats();
    }),

  getAdminRecentData: adminProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/getAdminRecentData"),
        tags: TAGS,
        protect: true,
      },
    })
    .output(getAdminRecentDataOutputModel)
    .query(async () => {
      const [recentUsers, recentForms] = await Promise.all([
        userService.getRecentUsers(8),
        userService.getRecentForms(8),
      ]);
      return { recentUsers, recentForms };
    }),
});
