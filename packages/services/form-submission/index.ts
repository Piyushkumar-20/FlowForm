import { db, eq, desc} from "@repo/database";
import { formSubmissionTable } from "@repo/database/models/form-submission";
import { getFormSubmissionsInput, type SubmitFormInputType, submitFormInput, type GetFormSubmissionsInputType,  } from "./model";

class FormSubmissionService {
  public async submitForm(payload: SubmitFormInputType) {
    const { formId, values } = await submitFormInput.parseAsync(payload);

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
