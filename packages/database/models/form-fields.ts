import { pgTable, uuid, varchar, timestamp, boolean, text, numeric, pgEnum, unique, json } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const formFieldEnum = pgEnum("field_type_enum", [
  "TEXT", "YES_NO", "NUMBER", "EMAIL", "PASSWORD", "SELECT", "CHECKBOX", "RATING", "DATE",
]);
export const formFieldTable = pgTable("form_field", {
  id: uuid("id").primaryKey().defaultRandom(),

  label: varchar("label", { length: 200 }).notNull(),
  labelKey: varchar("label_key", { length: 100 }).notNull(),

  description: text("description"),
  isRequired: boolean("is_required").default(false).notNull(),
  index: numeric("index", { scale: 2 }).notNull(),
  placeholder: text("placeholder"),

  type: formFieldEnum("type").notNull(),
  options: json("options").$type<string[]>(),

  formId: uuid("form_id").references(() => formsTable.id),


  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  
}, (table) => {
    return {
        uniqueFormIdAndIndex: unique().on(table.formId, table.index)
    }
    
});

export type SelectFormField = typeof formFieldTable.$inferSelect;
export type InsertFormField = typeof formFieldTable.$inferInsert;
