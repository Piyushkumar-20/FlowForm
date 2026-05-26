import { db, eq, desc, count } from "@repo/database";
import { formSubmissionTable } from "@repo/database/models/form-submission";
import { formsTable } from "@repo/database/models/form";
import { getFormSubmissionsInput, type SubmitFormInputType, submitFormInput, type GetFormSubmissionsInputType,  } from "./model";

class FormSubmissionService {
  public async submitForm(payload: SubmitFormInputType) {
    const { formId, values } = await submitFormInput.parseAsync(payload);

    const formRows = await db
      .select({
        status: formsTable.status,
        expiresAt: formsTable.expiresAt,
        maxResponses: formsTable.maxResponses,
      })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    if (!formRows[0]) throw new Error("Form not found");
    const form = formRows[0];

    if (form.status !== "published") throw new Error("This form is not accepting responses");

    if (form.expiresAt && new Date() > form.expiresAt) {
      throw new Error("This form has expired");
    }

    if (form.maxResponses) {
      const [row] = await db
        .select({ total: count() })
        .from(formSubmissionTable)
        .where(eq(formSubmissionTable.formId, formId));
      if (Number(row?.total ?? 0) >= form.maxResponses) {
        throw new Error("This form has reached its response limit");
      }
    }

    const result = await db
      .insert(formSubmissionTable)
      .values({ formId, values })
      .returning({
        id: formSubmissionTable.id,
        createdAt: formSubmissionTable.createdAt,
      });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("Failed to save form submission");
    }

    return result[0];
  }

  public async getFormSubmissions(payload: GetFormSubmissionsInputType) {
    const { formId } = await getFormSubmissionsInput.parseAsync(payload);

    const result = await db
      .select({
        id: formSubmissionTable.id,
        values: formSubmissionTable.values,
        createdAt: formSubmissionTable.createdAt,
      })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId))
      .orderBy(desc(formSubmissionTable.createdAt));

    return result;
  }
}

export default FormSubmissionService;
