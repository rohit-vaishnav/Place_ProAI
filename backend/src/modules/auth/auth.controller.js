import { body } from "express-validator";
import * as authService from "./auth.service.js";
import { success } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { USER_ROLES } from "../../constants/index.js";

export const registerValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(Object.values(USER_ROLES)).withMessage("Invalid role"),
];

export const loginValidators = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return success(res, result, "Registration successful", 201);
});

export const login = asyncHandler(async (req, res) => {
  console.log("1. LOGIN CONTROLLER START");

  const { email, password } = req.body;

  console.log("2. BEFORE SERVICE");

  const result = await authService.loginUser(email, password);

  console.log("3. AFTER SERVICE");

  return success(res, result, "Login successful");
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  return success(res, user);
});
