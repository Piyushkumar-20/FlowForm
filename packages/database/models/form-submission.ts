import { pgTable, uuid, timestamp, json } from "drizzle-orm/pg-core";

import { formsTable } from "./form";

export type SubmissionValue = string | number | boolean | null;

export interface FormSubmissionValue {
  formFieldId: string;
  value: SubmissionValue;
}

export type FormSubmissionValueRow = FormSubmissionValue[];

export const formSubmissionTable = pgTable("form_submission", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .references(() => formsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),

  values: json("values").$type<FormSubmissionValueRow>().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

});

export type SelectFormSubmission = typeof formSubmissionTable.$inferSelect;

export type InsertFormSubmission = typeof formSubmissionTable.$inferInsert;
