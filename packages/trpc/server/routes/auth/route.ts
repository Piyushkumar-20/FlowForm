import { userService } from "../../services";
import type { TRPCContext } from "../../context";
import {
  type TRPCBuiltRouter,
  type TRPCDecorateCreateRouterOptions,
  type TRPCMutationProcedure,
} from "@trpc/server";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { z } from "zod";
import { publicProcedure, router, type TRPCRouterRoot } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  signInUserWithEmailAndPasswordInputModel,
  signInUserWithEmailAndPasswordOutputModel,
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

type AuthRouterProcedures = {
  createUserWithEmailAndPassword: TRPCMutationProcedure<{
    input: z.infer<typeof createUserWithEmailAndPasswordInputModel>;
    output: z.infer<typeof createUserWithEmailAndPasswordOutputModel>;
    meta: OpenApiMeta;
  }>;
  signInUserWithEmailAndPassword: TRPCMutationProcedure<{
    input: z.infer<typeof signInUserWithEmailAndPasswordInputModel>;
    output: z.infer<typeof signInUserWithEmailAndPasswordOutputModel>;
    meta: OpenApiMeta;
  }>;
};

export const authRouter: TRPCBuiltRouter<
  TRPCRouterRoot,
  TRPCDecorateCreateRouterOptions<AuthRouterProcedures>
> = router({
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
});

function setAuthenticationCookie(ctx: TRPCContext, token: string) {
  if (ctx && typeof ctx.createCookie === 'function') {
    ctx.createCookie('auth_token', token);
  } else {
    throw new Error("tRPC Context missing 'createCookie' utility.");
  }
}
