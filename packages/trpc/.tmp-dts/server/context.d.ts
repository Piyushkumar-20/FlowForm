import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { clearCookieFactory, createCookieFactory, getCookieFactory } from "./utils/cookie";
export interface TRPCContext {
    createCookie: ReturnType<typeof createCookieFactory>;
    getCookie: ReturnType<typeof getCookieFactory>;
    clearCookie: ReturnType<typeof clearCookieFactory>;
}
export declare function createContext({ req, res }: CreateExpressContextOptions): Promise<TRPCContext>;
export type Context = Awaited<ReturnType<typeof createContext>>;
