import { Router } from "express";
import { db, categoriesTable, platformsTable, promptsTable, tipsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const [totalPrompts] = await db.select({ count: sql<number>`count(*)::int` }).from(promptsTable);
  const [totalCategories] = await db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable);
  const [totalPlatforms] = await db.select({ count: sql<number>`count(*)::int` }).from(platformsTable);
  const [totalTips] = await db.select({ count: sql<number>`count(*)::int` }).from(tipsTable);
  const [featuredCount] = await db.select({ count: sql<number>`count(*)::int` }).from(promptsTable).where(eq(promptsTable.isFeatured, true));
  const [beginnerCount] = await db.select({ count: sql<number>`count(*)::int` }).from(promptsTable).where(eq(promptsTable.difficulty, "beginner"));
  const [intermediateCount] = await db.select({ count: sql<number>`count(*)::int` }).from(promptsTable).where(eq(promptsTable.difficulty, "intermediate"));
  const [advancedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(promptsTable).where(eq(promptsTable.difficulty, "advanced"));

  res.json({
    totalPrompts: totalPrompts?.count ?? 0,
    totalCategories: totalCategories?.count ?? 0,
    totalPlatforms: totalPlatforms?.count ?? 0,
    totalTips: totalTips?.count ?? 0,
    featuredCount: featuredCount?.count ?? 0,
    beginnerCount: beginnerCount?.count ?? 0,
    intermediateCount: intermediateCount?.count ?? 0,
    advancedCount: advancedCount?.count ?? 0,
  });
});

router.get("/categories", async (_req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
  const counts = await db.select({ categoryId: promptsTable.categoryId, count: sql<number>`count(*)::int` })
    .from(promptsTable).groupBy(promptsTable.categoryId);
  const countMap = Object.fromEntries(counts.map(c => [c.categoryId, c.count]));

  res.json(cats.map(c => ({
    categoryId: c.id,
    categoryName: c.name,
    icon: c.icon,
    color: c.color,
    promptCount: countMap[c.id] ?? 0,
  })));
});

router.get("/featured", async (_req, res) => {
  const rows = await db.select().from(promptsTable).where(eq(promptsTable.isFeatured, true)).limit(12);
  const cats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));
  const platforms = await db.select().from(platformsTable);
  const platMap = Object.fromEntries(platforms.map(p => [p.id, p.name]));

  res.json(rows.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    template: p.template,
    categoryId: p.categoryId,
    categoryName: catMap[p.categoryId] ?? "",
    difficulty: p.difficulty,
    platformIds: JSON.parse(p.platformIds) as number[],
    platformNames: (JSON.parse(p.platformIds) as number[]).map(id => platMap[id] ?? ""),
    tags: JSON.parse(p.tags) as string[],
    variables: JSON.parse(p.variables),
    isFeatured: p.isFeatured,
    useCount: p.useCount,
    createdAt: p.createdAt.toISOString(),
  })));
});

export default router;
