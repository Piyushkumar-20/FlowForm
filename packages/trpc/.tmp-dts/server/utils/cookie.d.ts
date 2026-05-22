import { CookieOptions, Response, Request } from "express";
import { TRPCContext } from "../context";
export declare function createCookieFactory(res: Response): (name: string, value: string, opts?: CookieOptions) => void;
export declare function getCookieFactory(req: Request): (name: string) => any;
export declare function clearCookieFactory(req: Request): (name: string) => any;
export declare function setAuthenticationoCookie(ctx: TRPCContext, accessToken: string): void;
export declare function getAuthenticationoCookie(ctx: TRPCContext): any;
export declare function clearAuthenticationoCookie(ctx: TRPCContext): void;
