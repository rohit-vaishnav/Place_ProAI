import { Router } from "express";
import * as drivesController from "./drives.controller.js";
import { authenticate, officerOrAdmin } from "../../middleware/auth.js";

const router = Router();

router.get("/", authenticate, drivesController.listDrives);
router.post("/", authenticate, officerOrAdmin, drivesController.createDrive);
router.delete("/:id", authenticate, officerOrAdmin, drivesController.deleteDrive);

export default router;
