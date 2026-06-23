import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const platformsTable = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  logoUrl: text("logo_url").notNull().default(""),
  website: text("website").notNull().default(""),
  capabilities: text("capabilities").notNull().default("[]"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlatformSchema = createInsertSchema(platformsTable).omit({ id: true, createdAt: true });
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platformsTable.$inferSelect;
