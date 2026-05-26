import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request } from "express";
import { clearCookieFactory, createCookieFactory, getCookieFactory } from "./utils/cookie";


export interface TRPCCtxUser {
    id: string;
}
export interface TRPCContext {
    req: Request;
    createCookie: ReturnType<typeof createCookieFactory>;
    getCookie: ReturnType<typeof getCookieFactory>;
    clearCookie: ReturnType<typeof clearCookieFactory>;

    user ?: TRPCCtxUser;
}

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<TRPCContext> {
    const ctx: TRPCContext = {
        req,
        createCookie: createCookieFactory(res),
        getCookie: getCookieFactory(req),
        clearCookie: clearCookieFactory(res),
        user: undefined
    };
    return ctx;
}
export type Context = Awaited<ReturnType<typeof createContext>>;
