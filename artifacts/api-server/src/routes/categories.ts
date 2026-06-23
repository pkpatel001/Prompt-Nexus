import { Router } from "express";
import { db, categoriesTable, promptsTable } from "@workspace/db";
import { eq, sql, isNull } from "drizzle-orm";
import { ListCategoriesQueryParams, CreateCategoryBody, UpdateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListCategoriesQueryParams.safeParse(req.query);
  const parentId = query.success && query.data.parentId != null ? query.data.parentId : undefined;

  const rows = await db.select().from(categoriesTable)
    .where(parentId != null ? eq(categoriesTable.parentId, parentId) : isNull(categoriesTable.parentId))
    .orderBy(categoriesTable.sortOrder);

  const counts = await db.select({
    categoryId: promptsTable.categoryId,
    count: sql<number>`count(*)::int`,
  }).from(promptsTable).groupBy(promptsTable.categoryId);

  const countMap = Object.fromEntries(counts.map(c => [c.categoryId, c.count]));

  const result = rows.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    icon: r.icon,
    color: r.color,
    description: r.description,
    parentId: r.parentId ?? null,
    promptCount: countMap[r.id] ?? 0,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(result);
});

router.post("/", async (req, res) => {
  const body = CreateCategoryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [row] = await db.insert(categoriesTable).values(body.data).returning();
  res.status(201).json({
    ...row,
    parentId: row.parentId ?? null,
    promptCount: 0,
    createdAt: row.createdAt.toISOString(),
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  const [count] = await db.select({ count: sql<number>`count(*)::int` }).from(promptsTable).where(eq(promptsTable.categoryId, id));
  res.json({
    ...row,
    parentId: row.parentId ?? null,
    promptCount: count?.count ?? 0,
    createdAt: row.createdAt.toISOString(),
  });
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = UpdateCategoryBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db.update(categoriesTable).set(body.data).where(eq(categoriesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  const [count] = await db.select({ count: sql<number>`count(*)::int` }).from(promptsTable).where(eq(promptsTable.categoryId, id));
  res.json({
    ...row,
    parentId: row.parentId ?? null,
    promptCount: count?.count ?? 0,
    createdAt: row.createdAt.toISOString(),
  });
});

export default router;
