import { Router } from "express";
import * as adminController from "./admin.controller.js";
import { authenticate, adminOnly } from "../../middleware/auth.js";

const router = Router();

router.get("/stats", authenticate, adminOnly, adminController.getStats);
router.get("/users", authenticate, adminOnly, adminController.listUsers);
router.post("/students/:id/grant-verification", authenticate, adminOnly, adminController.grantVerification);
router.post("/reset", authenticate, adminOnly, adminController.resetData);

export default router;
