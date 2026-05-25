import {
  type CreateFormInputType,
  createFormInput,
  type CreateFormOutputType,
  listFormsByUserIdInput,
  type ListFormsByUserIdInputType,
  type GetFormByIdInputType,
  getFormByIdInput,
  type UpdateFormInputType,
  updateFormInput,
  type PublishFormInputType,
  publishFormInput,
  type UnpublishFormInputType,
  unpublishFormInput,
  type DeleteFormInputType,
  deleteFormInput,
} from "./model";
import { db, eq, asc, and } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldTable } from "@repo/database/models/form-fields";

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
    const { userId } = await listFormsByUserIdInput.parseAsync(payload);

    return db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        status: formsTable.status,
        visibility: formsTable.visibility,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.createdBy, userId));
  }

  public async getFormById(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const rows = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        status: formsTable.status,
        visibility: formsTable.visibility,
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
          options: formFieldTable.options,
        },
      })
      .from(formsTable)
      .leftJoin(formFieldTable, eq(formFieldTable.formId, formsTable.id))
      .where(eq(formsTable.id, formId))
      .orderBy(asc(formFieldTable.index));

    if (rows.length === 0) throw new Error("Form not found");

    const { id, title, description, status, visibility, createdAt, updatedAt } = rows[0]!;

    if (status !== "published") throw new Error("Form not found");

    const fields = rows
      .filter((r): r is typeof r & { field: NonNullable<typeof r.field> } => r.field?.id != null)
      .map((r) => r.field as NonNullable<typeof r.field>);

    return { id, title, description, status, visibility, createdAt, updatedAt, fields };
  }

  public async getFormForDashboard(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const result = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        status: formsTable.status,
        visibility: formsTable.visibility,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    if (result.length === 0) throw new Error("Form not found");
    return result[0]!;
  }

  public async updateForm(payload: UpdateFormInputType) {
    const { formId, ...updates } = await updateFormInput.parseAsync(payload);

    const patch: Partial<typeof formsTable.$inferInsert> = {};
    if (updates.title !== undefined) patch.title = updates.title;
    if ("description" in updates) patch.description = updates.description ?? null;
    if (updates.visibility !== undefined) patch.visibility = updates.visibility;

    if (Object.keys(patch).length === 0) throw new Error("No fields to update");

    const result = await db
      .update(formsTable)
      .set(patch)
      .where(eq(formsTable.id, formId))
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        status: formsTable.status,
        visibility: formsTable.visibility,
        updatedAt: formsTable.updatedAt,
      });

    if (!result || result.length === 0) throw new Error("Form not found");
    return result[0]!;
  }

  public async publishForm(payload: PublishFormInputType) {
    const { formId } = await publishFormInput.parseAsync(payload);

    const result = await db
      .update(formsTable)
      .set({ status: "published" })
      .where(eq(formsTable.id, formId))
      .returning({ id: formsTable.id, status: formsTable.status });

    if (!result || result.length === 0) throw new Error("Form not found");
    return result[0]!;
  }

  public async unpublishForm(payload: UnpublishFormInputType) {
    const { formId } = await unpublishFormInput.parseAsync(payload);

    const result = await db
      .update(formsTable)
      .set({ status: "unpublished" })
      .where(eq(formsTable.id, formId))
      .returning({ id: formsTable.id, status: formsTable.status });

    if (!result || result.length === 0) throw new Error("Form not found");
    return result[0]!;
  }

  public async deleteForm(payload: DeleteFormInputType) {
    const { formId } = await deleteFormInput.parseAsync(payload);

    // Delete fields first (no cascade on form_field FK)
    await db.delete(formFieldTable).where(eq(formFieldTable.formId, formId));

    const result = await db
      .delete(formsTable)
      .where(eq(formsTable.id, formId))
      .returning({ id: formsTable.id });

    if (!result || result.length === 0) throw new Error("Form not found");
    return { success: true, message: "Form deleted successfully" };
  }

  public async getPublicForms() {
    return db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(and(eq(formsTable.status, "published"), eq(formsTable.visibility, "public")));
  }
}

export default FormService;
