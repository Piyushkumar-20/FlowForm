import { CreateFormInputType, createFormInput, CreateFormOutputType , listFormsByUserIdInput, ListFormsByUserIdInputType, GetFormByIdInputType , getFormByIdInput, GetFormByIdOutputType, getFormByIdOutput} from "./model";
import { db, eq, asc} from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import {formFieldTable} from "@repo/database/models/form-fields"
class FormService {
  public async createForm(payload: CreateFormInputType): Promise<CreateFormOutputType> {
    const { title, description, createdBy } = await createFormInput.parseAsync(payload);

    const result = await db
      .insert(formsTable)
      .values({ title, description: description ?? null, createdBy })
      .returning({ id: formsTable.id, createdAt: formsTable.createdAt });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("Something went wrong creating form");
    }

    return {
      id: result[0].id,
       createdAt: result[0].createdAt ? result[0].createdAt.toISOString() : new Date().toISOString(),
    };
  }

  public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
    const {userId} = await listFormsByUserIdInput.parseAsync(payload);

    const forms = await db.select({
      id: formsTable.id,
      title: formsTable.title,
      description: formsTable.description,
      createdAt: formsTable.createdAt,
      createdBy: formsTable.createdBy
    }).from(formsTable).where(eq(formsTable.createdBy, userId))

    return forms
  }
// this must also get all fields using join form-field which we can use to render the form at once

  public async getFormById(payload: GetFormByIdInputType) {
    const {formId} = await getFormByIdInput.parseAsync(payload);

    const rows = await db.select({
      id: formsTable.id,
      title: formsTable.title,
      description: formsTable.description,
      createdAt: formsTable.createdAt,
      createdBy: formsTable.createdBy,
      updatedAt: formsTable.updatedAt,
      field: {
        id: formFieldTable.id,
        label: formFieldTable.label,
        labelKey: formFieldTable.labelKey,
        type: formFieldTable.type,
        description: formFieldTable.description,
        placeholder: formFieldTable.placeholder,
        isRequired: formFieldTable.isRequired,
        index: formFieldTable.index,
      },
    })
    .from(formsTable)
    .leftJoin(formFieldTable, eq(formFieldTable.formId, formsTable.id))
    .where(eq(formsTable.id, formId))
    .orderBy(asc(formFieldTable.index))

    if(rows.length === 0) throw new Error ("Form Not Found")

    const {id, title, description, createdAt, updatedAt } = rows[0]!

    const fields = rows
      .filter((r): r is typeof r & { field: NonNullable<typeof r.field> } => r.field?.id != null)
      .map(r => r.field as NonNullable<typeof r.field>)

    return {id, title, description, createdAt, updatedAt, fields}
  }
}

export default FormService;
