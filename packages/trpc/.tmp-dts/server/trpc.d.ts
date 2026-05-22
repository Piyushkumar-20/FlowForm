import { type TRPCBuiltRouter, type TRPCDecorateCreateRouterOptions, type TRPCDefaultErrorShape, type TRPCRouterRecord } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { type TRPCContext } from "./context";
export type TRPCRouterRoot = {
    ctx: TRPCContext;
    meta: OpenApiMeta;
    errorShape: TRPCDefaultErrorShape;
    transformer: false;
};
export type SubRouter<T extends TRPCRouterRecord> = TRPCBuiltRouter<TRPCRouterRoot, TRPCDecorateCreateRouterOptions<T>>;
export declare const tRPCContext: import("@trpc/server").TRPCRootObject<TRPCContext, OpenApiMeta, {}, {
    ctx: TRPCContext;
    meta: OpenApiMeta;
    errorShape: TRPCDefaultErrorShape;
    transformer: false;
}>;
export declare const router: import("@trpc/server").TRPCRouterBuilder<{
    ctx: TRPCContext;
    meta: OpenApiMeta;
    errorShape: TRPCDefaultErrorShape;
    transformer: false;
}>;
export declare const publicProcedure: import("@trpc/server").TRPCProcedureBuilder<TRPCContext, OpenApiMeta, object, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
