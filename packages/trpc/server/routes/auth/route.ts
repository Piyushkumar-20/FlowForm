import { TRPCError } from "@trpc/server";
import { userService } from "../../services";
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
import { setAuthenticationCookie, clearAuthenticationoCookie } from "../../utils/cookie";

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
        if (
          msg.includes("invalid username") ||
          msg.includes("invalid authentication") ||
          msg.includes("invalid credentials") ||
          msg.includes("not found") ||
          msg.includes("incorrect password")
        ) {
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

    getLoggedInUser: authenticateProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getLoggedInUser"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getLoggedInUserInputModel)
    .output(getLoggedInUserOutputModel)
    // ctx.user is already populated by authenticateProcedure — no second token verification needed.
    .query(({ ctx }) => {
      const { id, email, fullName, profileImageUrl, role, plan } = ctx.user;
      return { id, email, fullName, profileImageUrl, role, plan };
    }),
});



