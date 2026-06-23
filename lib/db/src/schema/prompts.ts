import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const promptsTable = pgTable("prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  template: text("template").notNull(),
  categoryId: integer("category_id").notNull(),
  difficulty: text("difficulty").notNull().default("beginner"),
  platformIds: text("platform_ids").notNull().default("[]"),
  tags: text("tags").notNull().default("[]"),
  variables: text("variables").notNull().default("[]"),
  isFeatured: boolean("is_featured").notNull().default(false),
  useCount: integer("use_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPromptSchema = createInsertSchema(promptsTable).omit({ id: true, createdAt: true, useCount: true });
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof promptsTable.$inferSelect;
