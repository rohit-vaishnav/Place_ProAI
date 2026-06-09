import { Router } from "express";
import * as analyticsController from "./analytics.controller.js";
import { authenticate, officerOrAdmin } from "../../middleware/auth.js";

const router = Router();

router.get("/", authenticate, officerOrAdmin, analyticsController.getAnalytics);

export default router;
