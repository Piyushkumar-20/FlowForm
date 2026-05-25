import { publicProcedure, router, authenticateProcedure } from "../../trpc";
import { formService, formFieldService } from "../../services";
import {
  createFormInputModel,
  createFormOutputModel,
  createFieldInputModel,
  createFieldOutputModel,
  updateFieldInputModel,
  updateFieldOutputModel,
  deleteFieldInputModel,
  deleteFieldOutputModel,
  getFieldsInputModel,
  getFieldsOutputModel,
  listFormsOutputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel
} from "./model";
import { generatePath } from "../../utils/path-generator";
import { z } from "zod";

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
        protect: true,
      },
    })
    .input(z.undefined())
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      const forms = await formService.listFormsByUserId({ userId: ctx.user.id });

      return forms;
    }),

  createField: authenticateProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFieldInputModel)
    .output(createFieldOutputModel)
    .mutation(async ({ input }) => {
      return formFieldService.createField(input);
    }),
  updateField: authenticateProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/updateField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateFieldInputModel)
    .output(updateFieldOutputModel)
    .mutation(async ({ input }) => {
      return formFieldService.updateField(input);
    }),

  deleteField: authenticateProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/deleteField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(deleteFieldInputModel)
    .output(deleteFieldOutputModel)
    .mutation(async ({ input }) => {
      return formFieldService.deleteField(input);
    }),

  getFields: authenticateProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFields"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getFieldsInputModel)
    .output(getFieldsOutputModel)
    .query(async ({ input }) => {
      return formFieldService.getFields({ formId: input.formId });
    }),

  getForm: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ input }) => {
      return formService.getFormById({ formId: input.formId });
    }),
});
