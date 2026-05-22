import { publicProcedure, router } from "./trpc";
import {z} from "zod";
import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";

export const serverRouter = router({
  health: healthRouter,
  chai: publicProcedure
   .input(z.object({ email: z.string().email()}))
   .output(z.object({message: z.string()}))
  .query(( async ({input}) => {
   return {
    message: `Hello ${input.email}`
   }
  }))
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
