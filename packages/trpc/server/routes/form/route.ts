import { TRPCError } from "@trpc/server";
import { publicProcedure, router, authenticateProcedure, adminProcedure } from "../../trpc";
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
  cloneFormInputModel,
  cloneFormOutputModel,
  archiveFormInputModel,
  archiveFormOutputModel,
  getFormBySlugInputModel,
  getFormBySlugOutputModel,
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
      console.log("[createForm] session userId:", ctx.user.id, "| title:", title);
      try {
        const { id, createdAt } = await formService.createForm({
          title,
          description,
          createdBy: ctx.user.id,
        });
        console.log("[createForm] success | formId:", id, "| userId:", ctx.user.id);
        return { id, createdAt };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[createForm] error | userId:", ctx.user.id, "| error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create form. Please try again." });
      }
    }),

  updateForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/updateForm"), tags: TAGS, protect: true } })
    .input(updateFormInputModel)
    .output(updateFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.updateForm(input, ctx.user.id);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[updateForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save changes." });
      }
    }),

  publishForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/publishForm"), tags: TAGS, protect: true } })
    .input(publishFormInputModel)
    .output(publishFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.publishForm(input, ctx.user.id);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[publishForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to publish form. Please try again." });
      }
    }),

  unpublishForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/unpublishForm"), tags: TAGS, protect: true } })
    .input(unpublishFormInputModel)
    .output(unpublishFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.unpublishForm(input, ctx.user.id);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[unpublishForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to unpublish form. Please try again." });
      }
    }),

  deleteForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/deleteForm"), tags: TAGS, protect: true } })
    .input(deleteFormInputModel)
    .output(deleteFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.deleteForm(input, ctx.user.id);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        const msg = err instanceof Error ? err.message : "";
        console.error("[deleteForm] error:", err);
        if (msg.includes("Form not found") || msg.includes("access denied")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or you do not have permission to delete it." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to delete form. Please try again." });
      }
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
      try {
        return await formService.getFormForDashboard({ formId: input.formId });
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("Form not found")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to load form." });
      }
    }),

  /* ── PUBLIC FORM ────────────────────────────────────────────────────── */

  getForm: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getForm"), tags: TAGS } })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ input }) => {
      try {
        return await formService.getFormById({ formId: input.formId });
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("Form not found")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to load form." });
      }
    }),

  /* ── FIELD CRUD ─────────────────────────────────────────────────────── */

  createField: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/createField"), tags: TAGS, protect: true } })
    .input(createFieldInputModel)
    .output(createFieldOutputModel)
    .mutation(async ({ input }) => {
      try {
        return await formFieldService.createField(input);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[createField] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to add field. Please try again." });
      }
    }),

  updateField: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/updateField"), tags: TAGS, protect: true } })
    .input(updateFieldInputModel)
    .output(updateFieldOutputModel)
    .mutation(async ({ input }) => {
      try {
        return await formFieldService.updateField(input);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[updateField] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update field." });
      }
    }),

  deleteField: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/deleteField"), tags: TAGS, protect: true } })
    .input(deleteFieldInputModel)
    .output(deleteFieldOutputModel)
    .mutation(async ({ input }) => {
      try {
        return await formFieldService.deleteField(input);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[deleteField] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete field." });
      }
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
      try {
        return await formSubmissionService.submitForm(input);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[submitForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to submit form. Please try again." });
      }
    }),

  getFormSubmissions: authenticateProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getFormSubmissions"), tags: TAGS, protect: true } })
    .input(getFormSubmissionsInputModel)
    .output(getFormSubmissionsOutputModel)
    .query(async ({ input }) => {
      return formSubmissionService.getFormSubmissions({ formId: input.formId });
    }),

  /* ── CLONE / ARCHIVE ────────────────────────────────────────────────── */

  cloneForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/cloneForm"), tags: TAGS, protect: true } })
    .input(cloneFormInputModel)
    .output(cloneFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.cloneForm({ formId: input.formId }, ctx.user.id);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[cloneForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to clone form. Please try again." });
      }
    }),

  archiveForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/archiveForm"), tags: TAGS, protect: true } })
    .input(archiveFormInputModel)
    .output(archiveFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.archiveForm({ formId: input.formId }, ctx.user.id);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[archiveForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to archive form. Please try again." });
      }
    }),

  restoreForm: authenticateProcedure
    .meta({ openapi: { method: "POST", path: getPath("/restoreForm"), tags: TAGS, protect: true } })
    .input(archiveFormInputModel)
    .output(archiveFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.restoreForm({ formId: input.formId }, ctx.user.id);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[restoreForm] error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to restore form. Please try again." });
      }
    }),

  /* ── SLUG-BASED ACCESS ──────────────────────────────────────────────── */

  getFormBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getFormBySlug"), tags: TAGS } })
    .input(getFormBySlugInputModel)
    .output(getFormBySlugOutputModel)
    .query(async ({ input }) => {
      try {
        return await formService.getFormBySlug(input.slug);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("Form not found")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to load form." });
      }
    }),
});
