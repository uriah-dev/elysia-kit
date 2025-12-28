import { createId } from "@src/lib/common";
import { varchar, timestamp } from "drizzle-orm/pg-core";

export const ID_CONFIG = { length: 24 };

export const defaults = () => ({
  id: varchar("id", ID_CONFIG).$defaultFn(createId).primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
