import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { defaults } from "./helper";

export const usersTable = pgTable("users", {
  ...defaults(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
});

const dateAsString = z.iso.datetime();

export const UsersSelectSchema = createSelectSchema(usersTable, {
  createdAt: dateAsString,
  updatedAt: dateAsString,
});

export const UsersInsertSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UsersUpdateSchema = UsersInsertSchema.partial();

export type User = z.infer<typeof UsersSelectSchema>;
export type UserInsert = z.infer<typeof UsersInsertSchema>;
export type UserUpdate = z.infer<typeof UsersUpdateSchema>;
