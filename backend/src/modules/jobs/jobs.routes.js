import { Router } from "express";
import * as jobsController from "./jobs.controller.js";
import { authenticate, recruiterOnly, officerOrAdmin, studentOnly } from "../../middleware/auth.js";

const router = Router();

router.get("/", authenticate, jobsController.listJobs);
router.get("/:id", authenticate, jobsController.getJob);
router.post("/", authenticate, recruiterOnly, jobsController.createJob);
router.put("/:id", authenticate, recruiterOnly, jobsController.updateJob);
router.delete("/:id", authenticate, recruiterOnly, jobsController.deleteJob);
router.patch("/:id/verify", authenticate, officerOrAdmin, jobsController.verifyJob);

export default router;
