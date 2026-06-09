import { Router } from "express";
import * as studentsController from "./students.controller.js";
import { authenticate, studentOnly, officerOrAdmin, adminOnly } from "../../middleware/auth.js";

const router = Router();

router.get("/me", authenticate, studentOnly, studentsController.getMyProfile);
router.put("/me", authenticate, studentOnly, studentsController.updateMyProfile);
router.post("/me/request-verification", authenticate, studentOnly, studentsController.requestVerification);

router.get("/", authenticate, officerOrAdmin, studentsController.listStudents);
router.get("/:id", authenticate, officerOrAdmin, studentsController.getStudentById);
router.patch("/:id/verify", authenticate, officerOrAdmin, studentsController.verifyStudent);
router.delete("/:id", authenticate, adminOnly, studentsController.deleteStudent);

export default router;
