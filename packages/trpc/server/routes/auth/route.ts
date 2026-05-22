import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createUserWithEmailAndPasswordInputModel, createUserWithEmailAndPasswordOutputModel } from "./model";


const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter: any = router({
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
    .mutation(async ({ input , ctx}) => {
      const { fullName, email, password } = input;
      const {id, token}= await userService.createUserWithEmailAndPassword({ fullName, email, password });

    setAuthenticationCookie(ctx, token)
      return {
        id,
        token
      };
    }),
});
function setAuthenticationCookie(ctx: any, token: string) {
   if (ctx && typeof ctx.createCookie === 'function') {
    ctx.createCookie('auth_token', token);
  } else {
    throw new Error("tRPC Context missing 'createCookie' utility.");
  }
}


