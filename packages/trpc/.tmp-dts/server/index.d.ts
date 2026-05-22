export declare const serverRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("./context").TRPCContext;
    meta: import("trpc-to-openapi").OpenApiMeta;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    health: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context").TRPCContext;
        meta: import("trpc-to-openapi").OpenApiMeta;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{}>>;
    auth: import("./trpc").SubRouter<import("@trpc/server").TRPCRouterRecord>;
}>>;
export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
