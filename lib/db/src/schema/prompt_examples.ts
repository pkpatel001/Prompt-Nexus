import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const promptExamplesTable = pgTable("prompt_examples", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  userInput: text("user_input").notNull(),
  aiOutput: text("ai_output").notNull(),
  platformId: integer("platform_id"),
  quality: text("quality").notNull().default("good"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPromptExampleSchema = createInsertSchema(promptExamplesTable).omit({ id: true, createdAt: true });
export type InsertPromptExample = z.infer<typeof insertPromptExampleSchema>;
export type PromptExample = typeof promptExamplesTable.$inferSelect;
