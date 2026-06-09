import { Router } from "express";
import * as applicationsController from "./applications.controller.js";
import { authenticate, studentOnly, recruiterOnly } from "../../middleware/auth.js";

const router = Router();

router.get("/", authenticate, applicationsController.listApplications);
router.post("/jobs/:jobId/apply", authenticate, studentOnly, applicationsController.applyToJob);
router.patch("/:id/status", authenticate, recruiterOnly, applicationsController.updateStatus);
router.get("/jobs/:jobId/applicants", authenticate, recruiterOnly, applicationsController.getJobApplicants);

export default router;
