import { formFieldTable } from "../../database/models/form-fields";
import { db, eq, max } from "@repo/database";

import {
  type CreateFieldInputType,
  createFieldInput,
  type UpdateFieldInputType,
  updateFieldInput,
  type GetFieldsInputType,
  getFieldsInput,
  type DeleteFieldInputType,
  deleteFieldInput,
} from "./model";

function toLabelKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

class FormFieldService {
  private async getNextIndex(formId: string): Promise<string> {
    const result = await db
      .select({ maxIndex: max(formFieldTable.index) })
      .from(formFieldTable)
      .where(eq(formFieldTable.formId, formId));

    const current = result[0]?.maxIndex;
    const next = current ? parseFloat(current) + 1 : 1;
    return next.toFixed(2);
  }

  public async createField(payload: CreateFieldInputType) {
    const { label, type, formId, description, placeholder, isRequired } =
      await createFieldInput.parseAsync(payload);

    const labelKey = toLabelKey(label);
    const index = await this.getNextIndex(formId);

    const result = await db
      .insert(formFieldTable)
      .values({ label, labelKey, index, type, description, placeholder, isRequired, formId })
      .returning({ id: formFieldTable.id });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("Something Went Wrong");
    }
    return {
      id: result[0].id,
      label,
      type,
      description,
      placeholder,
      isRequired,
    };
  }

  public async updateField(payload: UpdateFieldInputType) {
    const { fieldId, ...updates } = await updateFieldInput.parseAsync(payload);

    const patch: Partial<typeof formFieldTable.$inferInsert> = {};
    if (updates.label !== undefined) {
      patch.label = updates.label;
      patch.labelKey = toLabelKey(updates.label);
    }
    if (updates.type !== undefined) patch.type = updates.type;
    if ("description" in updates) patch.description = updates.description ?? null;
    if ("placeholder" in updates) patch.placeholder = updates.placeholder ?? null;
    if (updates.isRequired !== undefined) patch.isRequired = updates.isRequired;

    if (Object.keys(patch).length === 0) throw new Error("No field Provided");

    const result = await db
      .update(formFieldTable)
      .set(patch)
      .where(eq(formFieldTable.id, fieldId))
      .returning({
        id: formFieldTable.id,
        label: formFieldTable.label,
        type: formFieldTable.type,
        description: formFieldTable.description,
        placeholder: formFieldTable.placeholder,
        isRequired: formFieldTable.isRequired,
      });
    if (!result || result.length === 0) throw new Error(`Field With ID ${fieldId} does not exist`);
    return result[0]!;
  }

  public async deleteField(payload: DeleteFieldInputType) {
    const { fieldId } = await deleteFieldInput.parseAsync(payload);

    const result = await db
      .delete(formFieldTable)
      .where(eq(formFieldTable.id, fieldId))
      .returning({ id: formFieldTable.id });

    if (!result || result.length === 0) throw new Error(`Field With ID ${fieldId} does not exist`);

    return { id: result[0]!.id };
  }

  public async getFields(payload: GetFieldsInputType) {
    const { formId } = await getFieldsInput.parseAsync(payload);

    const result = await db.select().from(formFieldTable).where(eq(formFieldTable.formId, formId));

    return result;
  }
}

export default FormFieldService;
