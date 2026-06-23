import { Router } from "express";
import { db, promptsTable, categoriesTable, platformsTable, promptExamplesTable, tipsTable } from "@workspace/db";
import { eq, and, ilike, sql, inArray } from "drizzle-orm";
import {
  ListPromptsQueryParams,
  CreatePromptBody,
  UpdatePromptBody,
  CreatePromptExampleBody,
} from "@workspace/api-zod";

const router = Router();

async function buildPrompt(p: typeof promptsTable.$inferSelect, cats: Map<number, string>, plats: Map<number, string>) {
  const platformIds: number[] = JSON.parse(p.platformIds);
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    template: p.template,
    categoryId: p.categoryId,
    categoryName: cats.get(p.categoryId) ?? "",
    difficulty: p.difficulty,
    platformIds,
    platformNames: platformIds.map(id => plats.get(id) ?? ""),
    tags: JSON.parse(p.tags) as string[],
    variables: JSON.parse(p.variables),
    isFeatured: p.isFeatured,
    useCount: p.useCount,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const q = ListPromptsQueryParams.safeParse(req.query);
  const params = q.success ? q.data : {};

  let rows = await db.select().from(promptsTable).orderBy(sql`${promptsTable.isFeatured} desc, ${promptsTable.useCount} desc`);

  if (params.categoryId != null) rows = rows.filter(r => r.categoryId === params.categoryId);
  if (params.difficulty != null) rows = rows.filter(r => r.difficulty === params.difficulty);
  if (params.featured != null) rows = rows.filter(r => r.isFeatured === params.featured);
  if (params.search) {
    const s = params.search.toLowerCase();
    rows = rows.filter(r =>
      r.title.toLowerCase().includes(s) ||
      r.description.toLowerCase().includes(s) ||
      r.template.toLowerCase().includes(s)
    );
  }
  if (params.platformId != null) {
    const pid = params.platformId;
    rows = rows.filter(r => (JSON.parse(r.platformIds) as number[]).includes(pid));
  }

  const total = rows.length;
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 50;
  rows = rows.slice(offset, offset + limit);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const plats = await db.select().from(platformsTable);
  const platMap = new Map(plats.map(p => [p.id, p.name]));

  const prompts = await Promise.all(rows.map(p => buildPrompt(p, catMap, platMap)));
  res.json({ prompts, total });
});

router.post("/", async (req, res) => {
  const body = CreatePromptBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const { platformIds, tags, variables, ...rest } = body.data;
  const [row] = await db.insert(promptsTable).values({
    ...rest,
    platformIds: JSON.stringify(platformIds ?? []),
    tags: JSON.stringify(tags ?? []),
    variables: JSON.stringify(variables ?? []),
  }).returning();

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const plats = await db.select().from(platformsTable);
  const platMap = new Map(plats.map(p => [p.id, p.name]));

  res.status(201).json(await buildPrompt(row, catMap, platMap));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [p] = await db.select().from(promptsTable).where(eq(promptsTable.id, id));
  if (!p) { res.status(404).json({ error: "Not found" }); return; }

  // increment use count
  await db.update(promptsTable).set({ useCount: p.useCount + 1 }).where(eq(promptsTable.id, id));

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const plats = await db.select().from(platformsTable);
  const platMap = new Map(plats.map(pl => [pl.id, pl.name]));

  const examples = await db.select().from(promptExamplesTable).where(eq(promptExamplesTable.promptId, id)).orderBy(promptExamplesTable.sortOrder);
  const tips = await db.select().from(tipsTable).where(eq(tipsTable.categoryId, p.categoryId)).limit(5);

  const platformIds: number[] = JSON.parse(p.platformIds);

  res.json({
    id: p.id,
    title: p.title,
    description: p.description,
    template: p.template,
    categoryId: p.categoryId,
    categoryName: catMap.get(p.categoryId) ?? "",
    difficulty: p.difficulty,
    platformIds,
    platformNames: platformIds.map(pid => platMap.get(pid) ?? ""),
    tags: JSON.parse(p.tags) as string[],
    variables: JSON.parse(p.variables),
    isFeatured: p.isFeatured,
    useCount: p.useCount + 1,
    examples: examples.map(ex => ({
      id: ex.id,
      promptId: ex.promptId,
      title: ex.title,
      description: ex.description,
      userInput: ex.userInput,
      aiOutput: ex.aiOutput,
      platformId: ex.platformId ?? null,
      platformName: ex.platformId ? (platMap.get(ex.platformId) ?? "") : "",
      quality: ex.quality,
      sortOrder: ex.sortOrder,
    })),
    tips: tips.map(t => ({
      id: t.id,
      title: t.title,
      content: t.content,
      level: t.level,
      categoryId: t.categoryId ?? null,
      platformId: t.platformId ?? null,
      platformName: t.platformId ? (platMap.get(t.platformId) ?? "") : "",
      tags: JSON.parse(t.tags) as string[],
      sortOrder: t.sortOrder,
    })),
    createdAt: p.createdAt.toISOString(),
  });
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = UpdatePromptBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const update: Record<string, unknown> = { ...body.data };
  if (body.data.platformIds) update.platformIds = JSON.stringify(body.data.platformIds);
  if (body.data.tags) update.tags = JSON.stringify(body.data.tags);

  const [row] = await db.update(promptsTable).set(update as Parameters<typeof db.update>[0]).where(eq(promptsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const plats = await db.select().from(platformsTable);
  const platMap = new Map(plats.map(p => [p.id, p.name]));
  res.json(await buildPrompt(row, catMap, platMap));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(promptsTable).where(eq(promptsTable.id, id));
  res.status(204).end();
});

router.get("/:id/examples", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(promptExamplesTable).where(eq(promptExamplesTable.promptId, id)).orderBy(promptExamplesTable.sortOrder);
  const plats = await db.select().from(platformsTable);
  const platMap = new Map(plats.map(p => [p.id, p.name]));

  res.json(rows.map(ex => ({
    id: ex.id,
    promptId: ex.promptId,
    title: ex.title,
    description: ex.description,
    userInput: ex.userInput,
    aiOutput: ex.aiOutput,
    platformId: ex.platformId ?? null,
    platformName: ex.platformId ? (platMap.get(ex.platformId) ?? "") : "",
    quality: ex.quality,
    sortOrder: ex.sortOrder,
  })));
});

router.post("/:id/examples", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = CreatePromptExampleBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db.insert(promptExamplesTable).values({ ...body.data, promptId: id }).returning();
  const plats = await db.select().from(platformsTable);
  const platMap = new Map(plats.map(p => [p.id, p.name]));
  res.status(201).json({
    id: row.id,
    promptId: row.promptId,
    title: row.title,
    description: row.description,
    userInput: row.userInput,
    aiOutput: row.aiOutput,
    platformId: row.platformId ?? null,
    platformName: row.platformId ? (platMap.get(row.platformId) ?? "") : "",
    quality: row.quality,
    sortOrder: row.sortOrder,
  });
});

export default router;
