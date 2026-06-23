import { Router } from "express";
import { db, tipsTable, platformsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListTipsQueryParams, CreateTipBody } from "@workspace/api-zod";

const router = Router();

async function enrichTip(row: typeof tipsTable.$inferSelect) {
  let platformName = "";
  if (row.platformId) {
    const [p] = await db.select({ name: platformsTable.name }).from(platformsTable).where(eq(platformsTable.id, row.platformId));
    platformName = p?.name ?? "";
  }
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    level: row.level,
    categoryId: row.categoryId ?? null,
    platformId: row.platformId ?? null,
    platformName,
    tags: JSON.parse(row.tags) as string[],
    sortOrder: row.sortOrder,
  };
}

router.get("/", async (req, res) => {
  const query = ListTipsQueryParams.safeParse(req.query);
  const params = query.success ? query.data : {};

  const conditions = [];
  if (params.categoryId != null) conditions.push(eq(tipsTable.categoryId, params.categoryId));
  if (params.level != null) conditions.push(eq(tipsTable.level, params.level));
  if (params.platformId != null) conditions.push(eq(tipsTable.platformId, params.platformId));

  const rows = await db.select().from(tipsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(tipsTable.sortOrder, tipsTable.id);

  res.json(await Promise.all(rows.map(enrichTip)));
});

router.post("/", async (req, res) => {
  const body = CreateTipBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const { tags, ...rest } = body.data;
  const [row] = await db.insert(tipsTable).values({
    ...rest,
    tags: JSON.stringify(tags ?? []),
  }).returning();
  res.status(201).json(await enrichTip(row));
});

export default router;
