import { CreateFormInputType, createFormInput, CreateFormOutputType , listFormsByUserIdIntput, ListFormsByUserIdIntputType} from "./model";
import { db, eq} from "@repo/database";
import { formsTable } from "@repo/database/models/form";

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

  public async listUserForm(payload: ListFormsByUserIdIntputType) {
    const {userId} = await listFormsByUserIdIntput.parseAsync(payload);

    const forms = await db.select({
      id: formsTable.id,
      title: formsTable.title,
      description: formsTable.description,
      createdAt: formsTable.createdAt,
      createdBy: formsTable.createdBy
    }).from(formsTable).where(eq(formsTable.createdBy, userId))

    return forms
  }

}

export default FormService;
