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
  type CloneFormInputType,
  cloneFormInput,
  type ArchiveFormInputType,
  archiveFormInput,
} from "./model";
import { db, eq, asc, and, desc } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldTable } from "@repo/database/models/form-fields";
import { usersTable } from "@repo/database/models/user";

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
        isArchived: formsTable.isArchived,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.createdBy, userId));
  }

  public async getFormById(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);
    return this._fetchPublicForm(eq(formsTable.id, formId));
  }

  public async getFormBySlug(slug: string) {
    return this._fetchPublicForm(eq(formsTable.slug, slug));
  }

  private async _fetchPublicForm(whereClause: Parameters<typeof db.select>[0] extends never ? never : any) {
    const rows = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        status: formsTable.status,
        visibility: formsTable.visibility,
        expiresAt: formsTable.expiresAt,
        isArchived: formsTable.isArchived,
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
          page: formFieldTable.page,
          conditions: formFieldTable.conditions,
        },
      })
      .from(formsTable)
      .leftJoin(formFieldTable, eq(formFieldTable.formId, formsTable.id))
      .where(whereClause)
      .orderBy(asc(formFieldTable.index));

    if (rows.length === 0) throw new Error("Form not found");

    const { id, title, description, status, visibility, expiresAt, isArchived, createdAt, updatedAt } = rows[0]!;

    if (status !== "published" || isArchived) throw new Error("Form not found");

    const fields = rows
      .filter((r): r is typeof r & { field: NonNullable<typeof r.field> } => r.field?.id != null)
      .map((r) => r.field as NonNullable<typeof r.field>);

    return { id, title, description, status, visibility, expiresAt, createdAt, updatedAt, fields };
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
        expiresAt: formsTable.expiresAt,
        maxResponses: formsTable.maxResponses,
        slug: formsTable.slug,
        isArchived: formsTable.isArchived,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    if (result.length === 0) throw new Error("Form not found");
    return result[0]!;
  }

  public async updateForm(payload: UpdateFormInputType, userId: string) {
    const { formId, ...updates } = await updateFormInput.parseAsync(payload);

    const patch: Partial<typeof formsTable.$inferInsert> = {};
    if (updates.title !== undefined) patch.title = updates.title;
    if ("description" in updates) patch.description = updates.description ?? null;
    if (updates.visibility !== undefined) patch.visibility = updates.visibility;
    if ("expiresAt" in updates) patch.expiresAt = updates.expiresAt ?? null;
    if ("maxResponses" in updates) patch.maxResponses = updates.maxResponses ?? null;
    if ("slug" in updates) patch.slug = updates.slug ?? null;

    if (Object.keys(patch).length === 0) throw new Error("No fields to update");

    const result = await db
      .update(formsTable)
      .set(patch)
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        status: formsTable.status,
        visibility: formsTable.visibility,
        updatedAt: formsTable.updatedAt,
      });

    if (!result || result.length === 0) throw new Error("Form not found or access denied");
    return result[0]!;
  }

  public async publishForm(payload: PublishFormInputType, userId: string) {
    const { formId } = await publishFormInput.parseAsync(payload);

    const result = await db
      .update(formsTable)
      .set({ status: "published" })
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
      .returning({ id: formsTable.id, status: formsTable.status });

    if (!result || result.length === 0) throw new Error("Form not found or access denied");
    return result[0]!;
  }

  public async unpublishForm(payload: UnpublishFormInputType, userId: string) {
    const { formId } = await unpublishFormInput.parseAsync(payload);

    const result = await db
      .update(formsTable)
      .set({ status: "unpublished" })
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
      .returning({ id: formsTable.id, status: formsTable.status });

    if (!result || result.length === 0) throw new Error("Form not found or access denied");
    return result[0]!;
  }

  public async deleteForm(payload: DeleteFormInputType, userId: string) {
    const { formId } = await deleteFormInput.parseAsync(payload);

    const [owned] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));

    if (!owned) throw new Error("Form not found or access denied");

    await db.delete(formFieldTable).where(eq(formFieldTable.formId, formId));
    await db.delete(formsTable).where(eq(formsTable.id, formId));
    return { success: true, message: "Form deleted successfully" };
  }

  public async cloneForm(payload: CloneFormInputType, userId: string) {
    const { formId } = await cloneFormInput.parseAsync(payload);

    const [original] = await db.select().from(formsTable).where(eq(formsTable.id, formId));
    if (!original) throw new Error("Form not found");

    const rawTitle = (original.title ?? "Untitled") + " copy";
    const newTitle = rawTitle.slice(0, 20);

    const [newForm] = await db
      .insert(formsTable)
      .values({
        title: newTitle,
        description: original.description,
        visibility: original.visibility,
        status: "draft",
        createdBy: userId,
      })
      .returning({ id: formsTable.id, createdAt: formsTable.createdAt });

    if (!newForm) throw new Error("Failed to clone form");

    const originalFields = await db
      .select()
      .from(formFieldTable)
      .where(eq(formFieldTable.formId, formId))
      .orderBy(asc(formFieldTable.index));

    if (originalFields.length > 0) {
      await db.insert(formFieldTable).values(
        originalFields.map((f) => ({
          label: f.label,
          labelKey: f.labelKey,
          type: f.type,
          description: f.description,
          placeholder: f.placeholder,
          isRequired: f.isRequired,
          index: f.index,
          options: f.options,
          page: f.page,
          conditions: null, // conditions reference old field IDs — don't copy
          formId: newForm.id,
        })),
      );
    }

    return {
      id: newForm.id,
      createdAt: newForm.createdAt ? newForm.createdAt.toISOString() : new Date().toISOString(),
    };
  }

  public async archiveForm(payload: ArchiveFormInputType, userId: string) {
    const { formId } = await archiveFormInput.parseAsync(payload);

    const result = await db
      .update(formsTable)
      .set({ isArchived: true })
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
      .returning({ id: formsTable.id });

    if (!result[0]) throw new Error("Form not found or access denied");
    return { success: true };
  }

  public async restoreForm(payload: ArchiveFormInputType, userId: string) {
    const { formId } = await archiveFormInput.parseAsync(payload);

    const result = await db
      .update(formsTable)
      .set({ isArchived: false })
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
      .returning({ id: formsTable.id });

    if (!result[0]) throw new Error("Form not found or access denied");
    return { success: true };
  }

  public async getPublicForms() {
    return db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        isFeatured: formsTable.isFeatured,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(
        and(
          eq(formsTable.status, "published"),
          eq(formsTable.visibility, "public"),
          eq(formsTable.isArchived, false),
        ),
      )
      .orderBy(desc(formsTable.isFeatured), desc(formsTable.createdAt));
  }

  /* ── Admin-only operations ─────────────────────────────────────────── */

  public async adminArchiveAnyForm(formId: string) {
    const result = await db
      .update(formsTable)
      .set({ isArchived: true, status: "unpublished" })
      .where(eq(formsTable.id, formId))
      .returning({ id: formsTable.id });

    if (!result[0]) throw new Error("Form not found");
    return { success: true };
  }

  public async adminUnarchiveAnyForm(formId: string) {
    const result = await db
      .update(formsTable)
      .set({ isArchived: false })
      .where(eq(formsTable.id, formId))
      .returning({ id: formsTable.id });

    if (!result[0]) throw new Error("Form not found");
    return { success: true };
  }

  public async adminDeleteAnyForm(formId: string) {
    const [exists] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    if (!exists) throw new Error("Form not found");

    await db.delete(formFieldTable).where(eq(formFieldTable.formId, formId));
    await db.delete(formsTable).where(eq(formsTable.id, formId));
    return { success: true };
  }

  public async adminToggleFeaturedForm(formId: string) {
    const [current] = await db
      .select({ isFeatured: formsTable.isFeatured })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    if (!current) throw new Error("Form not found");

    const result = await db
      .update(formsTable)
      .set({ isFeatured: !current.isFeatured })
      .where(eq(formsTable.id, formId))
      .returning({ id: formsTable.id, isFeatured: formsTable.isFeatured });

    return { success: true, isFeatured: result[0]!.isFeatured };
  }

  public async adminListAllForms() {
    const rows = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        status: formsTable.status,
        visibility: formsTable.visibility,
        isArchived: formsTable.isArchived,
        isFeatured: formsTable.isFeatured,
        createdAt: formsTable.createdAt,
        ownerName: usersTable.fullName,
        ownerEmail: usersTable.email,
      })
      .from(formsTable)
      .leftJoin(usersTable, eq(formsTable.createdBy, usersTable.id))
      .orderBy(desc(formsTable.createdAt));

    return rows;
  }
}

export default FormService;
