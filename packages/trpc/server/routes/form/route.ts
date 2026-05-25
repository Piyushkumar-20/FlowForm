import { publicProcedure, router, authenticateProcedure } from "../../trpc";
import { formService, formFieldService, formSubmissionService } from "../../services";
import {
  createFormInputModel,
  createFormOutputModel,
  updateFormInputModel,
  updateFormOutputModel,
  publishFormInputModel,
  publishFormOutputModel,
  unpublishFormInputModel,
  unpublishFormOutputModel,
  deleteFormInputModel,
  deleteFormOutputModel,
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
  getFormByIdOutputModel,
  getFormForDashboardInputModel,
  getFormForDashboardOutputModel,
  getPublicFormsOutputModel,
  submitFormInputModel,
  submitFormOutputModel,
  getFormSubmissionsInputModel,
  getFormSubmissionsOutputModel,
} from "./model";
import { generatePath } from "../../utils/path-generator";
import { z } from "zod";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
  /* ── FORM CRUD ─────────────────────────────────────────────────────── */

  createForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/createForm"), tags: TAGS, protect: true } })
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

  updateForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/updateForm"), tags: TAGS, protect: true } })
    .input(updateFormInputModel)
    .output(updateFormOutputModel)
    .mutation(async ({ input }) => {
      return formService.updateForm(input);
    }),

  publishForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/publishForm"), tags: TAGS, protect: true } })
    .input(publishFormInputModel)
    .output(publishFormOutputModel)
    .mutation(async ({ input }) => {
      return formService.publishForm(input);
    }),

  unpublishForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/unpublishForm"), tags: TAGS, protect: true } })
    .input(unpublishFormInputModel)
    .output(unpublishFormOutputModel)
    .mutation(async ({ input }) => {
      return formService.unpublishForm(input);
    }),

  deleteForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/deleteForm"), tags: TAGS, protect: true } })
    .input(deleteFormInputModel)
    .output(deleteFormOutputModel)
    .mutation(async ({ input }) => {
      return formService.deleteForm(input);
    }),

  listForms: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/listForms"), tags: TAGS, protect: true } })
    .input(z.undefined())
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      return formService.listFormsByUserId({ userId: ctx.user.id });
    }),

  getPublicForms: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getPublicForms"), tags: TAGS } })
    .input(z.undefined())
    .output(getPublicFormsOutputModel)
    .query(async () => {
      return formService.getPublicForms();
    }),

  getFormForDashboard: authenticateProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getFormForDashboard"), tags: TAGS, protect: true } })
    .input(getFormForDashboardInputModel)
    .output(getFormForDashboardOutputModel)
    .query(async ({ input }) => {
      return formService.getFormForDashboard({ formId: input.formId });
    }),

  /* ── PUBLIC FORM ────────────────────────────────────────────────────── */

  getForm: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getForm"), tags: TAGS } })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ input }) => {
      return formService.getFormById({ formId: input.formId });
    }),

  /* ── FIELD CRUD ─────────────────────────────────────────────────────── */

  createField: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/createField"), tags: TAGS, protect: true } })
    .input(createFieldInputModel)
    .output(createFieldOutputModel)
    .mutation(async ({ input }) => {
      return formFieldService.createField(input);
    }),

  updateField: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/updateField"), tags: TAGS, protect: true } })
    .input(updateFieldInputModel)
    .output(updateFieldOutputModel)
    .mutation(async ({ input }) => {
      return formFieldService.updateField(input);
    }),

  deleteField: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/deleteField"), tags: TAGS, protect: true } })
    .input(deleteFieldInputModel)
    .output(deleteFieldOutputModel)
    .mutation(async ({ input }) => {
      return formFieldService.deleteField(input);
    }),

  getFields: authenticateProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getFields"), tags: TAGS, protect: true } })
    .input(getFieldsInputModel)
    .output(getFieldsOutputModel)
    .query(async ({ input }) => {
      return formFieldService.getFields({ formId: input.formId });
    }),

  /* ── SUBMISSIONS ────────────────────────────────────────────────────── */

  submitForm: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/submitForm"), tags: TAGS } })
    .input(submitFormInputModel)
    .output(submitFormOutputModel)
    .mutation(async ({ input }) => {
      return formSubmissionService.submitForm(input);
    }),

  getFormSubmissions: authenticateProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getFormSubmissions"), tags: TAGS, protect: true } })
    .input(getFormSubmissionsInputModel)
    .output(getFormSubmissionsOutputModel)
    .query(async ({ input }) => {
      return formSubmissionService.getFormSubmissions({ formId: input.formId });
    }),
});
