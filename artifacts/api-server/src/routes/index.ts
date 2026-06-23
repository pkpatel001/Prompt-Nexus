import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import platformsRouter from "./platforms";
import promptsRouter from "./prompts";
import tipsRouter from "./tips";
import favoritesRouter from "./favorites";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/categories", categoriesRouter);
router.use("/platforms", platformsRouter);
router.use("/prompts", promptsRouter);
router.use("/tips", tipsRouter);
router.use("/favorites", favoritesRouter);
router.use("/stats", statsRouter);

export default router;
