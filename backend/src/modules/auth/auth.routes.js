import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.post("/register", authController.registerValidators, validate, authController.register);
router.post("/login", authController.loginValidators, validate, authController.login);
router.get("/me", authenticate, authController.me);

export default router;
