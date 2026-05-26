import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { userService } from "../../services";
import type { TRPCContext } from "../../context";
import { authenticateProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  signInUserWithEmailAndPasswordInputModel,
  signInUserWithEmailAndPasswordOutputModel,
  getLoggedInUserInputModel,
  getLoggedInUserOutputModel,
  logoutOutputModel,
} from "./model";
import { getAuthenticationCookie, clearAuthenticationoCookie } from "../../utils/cookie"

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");


export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, password } = input;
      try {
        const { id, token } = await userService.createUserWithEmailAndPassword({ fullName, email, password });
        setAuthenticationCookie(ctx, token);
        return { id };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        console.error("[auth.createUser] error:", err);
        if (msg.includes("already exist")) {
          throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create account. Please try again." });
      }
    }),

  signInUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signInUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(signInUserWithEmailAndPasswordInputModel)
    .output(signInUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      try {
        const { id, token } = await userService.signInUserWithEmailAndPassword({ email, password });
        setAuthenticationCookie(ctx, token);
        return { id };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        console.error("[auth.signIn] error:", err);
        if (msg.includes("invalid username") || msg.includes("invalid authentication")) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Sign in failed. Please try again." });
      }
    }),

  logout: authenticateProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/logout"),
        tags: TAGS,
      },
    })
    .output(logoutOutputModel)
    .mutation(({ ctx }) => {
      clearAuthenticationoCookie(ctx);
      return { success: true };
    }),

    getLoggedInUser: authenticateProcedure.meta({
      openapi: {
        method: "POST",
        path: getPath("/getLoggedInUser"),
        tags: TAGS,
        protect: true
      },
    })
    .input(getLoggedInUserInputModel)
    .output(getLoggedInUserOutputModel)
    .query(async ({ ctx }) => {
      const userToken = getAuthenticationCookie(ctx);
      if (!userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not logged in" });
      }

      try {
        const { id, email, fullName, profileImageUrl, role } =
          await userService.verifyAndDecodeUserToken(userToken);
        return { id, email, fullName, profileImageUrl, role };
      } catch {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
      }
    })
});

function setAuthenticationCookie(ctx: TRPCContext, token: string) {
  if (ctx && typeof ctx.createCookie === 'function') {
    ctx.createCookie('auth_token', token);
  } else {
    throw new Error("tRPC Context missing 'createCookie' utility.");
  }
}


