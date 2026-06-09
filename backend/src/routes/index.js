import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import studentsRoutes from "../modules/students/students.routes.js";
import jobsRoutes from "../modules/jobs/jobs.routes.js";
import applicationsRoutes from "../modules/applications/applications.routes.js";
import drivesRoutes from "../modules/drives/drives.routes.js";
import mockInterviewRoutes from "../modules/mock-interview/mock-interview.routes.js";
import aiRoutes from "../modules/ai/ai.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import analyticsRoutes from "../modules/analytics/analytics.routes.js";
import { success } from "../utils/apiResponse.js";

const router = Router();

router.get("/health", (_req, res) => success(res, { status: "ok", service: "placepro-api" }));

router.use("/auth", authRoutes);
router.use("/students", studentsRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/drives", drivesRoutes);
router.use("/mock-interviews", mockInterviewRoutes);
router.use("/", aiRoutes);
router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
