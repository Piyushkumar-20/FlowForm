import { publicProcedure, router } from "../../trpc";
import { authenticateProcedure } from "../../trpc";
import { formService } from "../../services";
import { TRPCError } from "@trpc/server";
import { createFormInputModel, createFormOutputModel } from "./model";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
  createForm: authenticateProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      const { title, description } = input;

      const { id, createdAt } = await formService.createForm({
        title,
        description,
        createdBy: ctx.user.id,
      });

      return { id, createdAt };
    }),
});
