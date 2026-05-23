import { TRPCError } from "@trpc/server";
import { userService } from "../../services";
import type { TRPCContext } from "../../context";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  signInUserWithEmailAndPasswordInputModel,
  signInUserWithEmailAndPasswordOutputModel,
  getLoggedInUserInputModel,
  getLoggedInUserOutputModel
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");


export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, password } = input;
      const { id, token } = await userService.createUserWithEmailAndPassword({ fullName, email, password });

      setAuthenticationCookie(ctx, token);
      return {
        id
      };
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
      

      const { id, token } = await userService.signInUserWithEmailAndPassword({ email, password });
  
      setAuthenticationCookie(ctx, token);
      
      return {
        id
      };
    }), 

    getLoggedInUser: publicProcedure.meta({
      openapi: {
        method: "POST",
        path: getPath("/getLoggedInUser"),
        tags: TAGS
      },
    })
    .input(getLoggedInUserInputModel)
    .output(getLoggedInUserOutputModel)
    .query(async ({ ctx }) => {
      const userToken = getAuthenticationCookie(ctx);
      if (!userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not logged in" });
      }

      const {id, email, fullName, profileImageUrl} = await userService.verifyAndDecodeUserToken(userToken)
      return {
        id,
        email,
        fullName,
        profileImageUrl
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

function getAuthenticationCookie(ctx: TRPCContext) {

  const authHeader = ctx.req?.headers?.["authorization"] || ctx.getCookie("auth_token");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  
  return authHeader;
}
