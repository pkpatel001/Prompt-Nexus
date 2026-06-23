import { Router } from "express";
import { db, platformsTable, promptsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreatePlatformBody } from "@workspace/api-zod";

const router = Router();

function parsePlatform(row: typeof platformsTable.$inferSelect, promptCount: number) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    description: row.description,
    logoUrl: row.logoUrl,
    website: row.website,
    capabilities: JSON.parse(row.capabilities) as string[],
    promptCount,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/", async (_req, res) => {
  const rows = await db.select().from(platformsTable).orderBy(platformsTable.name);

  const allPrompts = await db.select({ platformIds: promptsTable.platformIds }).from(promptsTable);
  const countMap: Record<number, number> = {};
  for (const p of allPrompts) {
    const ids: number[] = JSON.parse(p.platformIds);
    for (const id of ids) {
      countMap[id] = (countMap[id] ?? 0) + 1;
    }
  }

  res.json(rows.map(r => parsePlatform(r, countMap[r.id] ?? 0)));
});

router.post("/", async (req, res) => {
  const body = CreatePlatformBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const { capabilities, ...rest } = body.data;
  const [row] = await db.insert(platformsTable).values({
    ...rest,
    capabilities: JSON.stringify(capabilities ?? []),
  }).returning();
  res.status(201).json(parsePlatform(row, 0));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(platformsTable).where(eq(platformsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  const allPrompts = await db.select({ platformIds: promptsTable.platformIds }).from(promptsTable);
  const count = allPrompts.filter(p => (JSON.parse(p.platformIds) as number[]).includes(id)).length;
  res.json(parsePlatform(row, count));
});

export default router;
