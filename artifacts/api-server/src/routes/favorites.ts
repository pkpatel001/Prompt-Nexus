import { Router } from "express";
import { db, favoritesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AddFavoriteBody } from "@workspace/api-zod";


const router = Router();

router.get("/", async (_req, res) => {
  const rows = await db.select({ promptId: favoritesTable.promptId }).from(favoritesTable);
  res.json(rows.map(r => r.promptId));
});

router.post("/", async (req, res) => {
  const body = AddFavoriteBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const existing = await db.select().from(favoritesTable).where(eq(favoritesTable.promptId, body.data.promptId));
  if (existing.length === 0) {
    await db.insert(favoritesTable).values({ promptId: body.data.promptId });
  }
  res.status(201).json({ ok: true });
});

router.delete("/:promptId", async (req, res) => {
  const promptId = parseInt(req.params.promptId);
  await db.delete(favoritesTable).where(eq(favoritesTable.promptId, promptId));
  res.status(204).end();
});

export default router;
