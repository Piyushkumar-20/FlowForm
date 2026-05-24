import { publicProcedure, router, authenticateProcedure } from "../../trpc";
import { formService } from "../../services";
import { createFormInputModel, createFormOutputModel, listFormsOutputModel} from "./model";
import { generatePath } from "../../utils/path-generator";
import {z} from 'zod'

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

    listForms: authenticateProcedure
      .meta({
        openapi: {
          method: "POST",
          path: getPath("/listForms"),
          tags: TAGS,
          protect: true
        }
      })
      .input(z.undefined())
      .output(listFormsOutputModel)
      .query(async ({ctx}) => {
        const forms = await formService.listFormsByUserId({userId: ctx.user.id})
        
        return forms
      })
});
