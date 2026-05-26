
import { pgTable, uuid, varchar, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formStatusEnum = pgEnum("form_status", ["draft", "published", "unpublished"]);
export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: varchar("title", { length: 20 }).notNull(),
  description: varchar("description", { length: 300 }),

  status: formStatusEnum("status").default("draft").notNull(),
  visibility: formVisibilityEnum("visibility").default("public").notNull(),
  expiresAt: timestamp("expires_at"),
  maxResponses: integer("max_responses"),
  isArchived: boolean("is_archived").default(false).notNull(),
  slug: varchar("slug", { length: 100 }).unique(),

  createdBy: uuid("created_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;

  