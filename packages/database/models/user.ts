import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["free", "pro", "enterprise"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),

  fullName: varchar("full_name", { length: 80 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),

  profileImageUrl: text("profile_image_url"),

  salt: text('salt'),
  password: text('password'),

  role: userRoleEnum("role").default("USER").notNull(),

  plan: subscriptionPlanEnum("plan").default("free").notNull(),
  planUpdatedAt: timestamp("plan_updated_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
