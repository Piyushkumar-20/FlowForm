import { initTRPC, TRPCError, type TRPCDefaultErrorShape } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext, type TRPCContext } from "./context";

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
