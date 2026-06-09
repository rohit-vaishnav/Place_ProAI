import { Router } from "express";
import * as mockInterviewController from "./mock-interview.controller.js";
import { authenticate, studentOnly } from "../../middleware/auth.js";

const router = Router();

router.post("/", authenticate, studentOnly, mockInterviewController.saveResult);
router.get("/", authenticate, mockInterviewController.listResults);
router.get("/:id", authenticate, mockInterviewController.getResult);

export default router;
