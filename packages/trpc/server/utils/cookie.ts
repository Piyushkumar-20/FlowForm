import { CookieOptions, Response, Request } from "express";
import {TRPCContext} from "../context";

const ONE_MINUTE = 60 * 1000; // in milliseconds
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 365 * ONE_DAY;

const defaultCookieOptions : CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // "lax" is the correct choice for auth session cookies:
  //   • Sends cookie on same-site requests (dashboard, API calls) ✓
  //   • Sends cookie when user navigates from an external link (email, Slack) ✓
  //   • Does NOT send cookie on cross-site sub-requests (POST, images) → CSRF safe ✓
  // "strict" was breaking sessions for users arriving from external links because
  // the auth_token cookie was silently withheld on the very first navigation.
  sameSite: "lax",
  maxAge: ONE_YEAR,
};

// It enables how to create a cookie
export function createCookieFactory(res: Response) {
    return function createCookie (
    name: string,
    value: string,
    opts: CookieOptions = defaultCookieOptions
    ) {
        res.cookie(name, value, opts);
    }
}

export function getCookieFactory(req: Request) {
    return function getCookie(name: string) {
        return req.cookies?.[name];
    }
}
export function clearCookieFactory(res: Response) {
    return function clearCookie(name: string) {
        res.clearCookie(name, { path: "/" });
    }
}

// Authenticaton Cookie 
const AUTHENTICATION_COOKIE_NAME = 'auth_token'

export function setAuthenticationCookie (ctx: TRPCContext, accessToken: string) {
    return ctx.createCookie(AUTHENTICATION_COOKIE_NAME, accessToken)
}
export function getAuthenticationCookie (ctx: TRPCContext) {
    return ctx.getCookie(AUTHENTICATION_COOKIE_NAME)
}
export function clearAuthenticationoCookie (ctx: TRPCContext) {
    ctx.clearCookie(AUTHENTICATION_COOKIE_NAME)
}