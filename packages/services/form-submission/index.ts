import { db } from "@repo/database";
import { formSubmissionTable } from "@repo/database/models/form-submission";
import { submitFormInput, type SubmitFormInputType } from "./model";

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
}

export default FormSubmissionService;
