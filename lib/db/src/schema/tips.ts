import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tipsTable = pgTable("tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  level: text("level").notNull().default("beginner"),
  categoryId: integer("category_id"),
  platformId: integer("platform_id"),
  tags: text("tags").notNull().default("[]"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTipSchema = createInsertSchema(tipsTable).omit({ id: true, createdAt: true });
export type InsertTip = z.infer<typeof insertTipSchema>;
export type Tip = typeof tipsTable.$inferSelect;
