import { pgTable as table, varchar, timestamp, index, serial } from "drizzle-orm/pg-core";

export const contacts = table(
  "contacts",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("first_name_idx").on(table.firstName), index("last_name_idx").on(table.lastName)]
);
export type Contact = typeof contacts.$inferSelect;
