import { initTRPC, TRPCError, type TRPCDefaultErrorShape } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext, type TRPCContext } from "./context";
import {getAuthenticationCookie} from './utils/cookie'
import { userService, formService } from "./services";
import { z } from "zod";
export type TRPCRouterRoot = {
  ctx: TRPCContext;
  meta: OpenApiMeta;
  errorShape: TRPCDefaultErrorShape;
  transformer: false;
};

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;


export const authenticateProcedure = tRPCContext.procedure.use(async options => {
  const {ctx} = options
  const userToken = getAuthenticationCookie(ctx);
  if (!userToken) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "User not logged in" });
  }
  try {
    const { id } = await userService.verifyAndDecodeUserToken(userToken);
    return options.next({
      ctx : {
        ...ctx,
        user: {id}
      }
    })
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired or invalid. Please log in again." });
  }
})

export const adminProcedure = authenticateProcedure.use(async options => {
  const { ctx } = options;
  const role = await userService.getUserRoleById(ctx.user.id);
  if (role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return options.next({ ctx });
})
