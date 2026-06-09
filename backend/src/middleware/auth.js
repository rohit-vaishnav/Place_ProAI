import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import { fail } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { USER_ROLES } from "../constants/index.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return fail(res, "Authentication required", 401);
  }

  const token = header.split(" ")[1];
  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    return fail(res, "User account not found or inactive", 401);
  }

  req.user = user;
  next();
});

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, "You do not have permission to perform this action", 403);
    }
    next();
  };
}

export const studentOnly = authorize(USER_ROLES.STUDENT);
export const recruiterOnly = authorize(USER_ROLES.RECRUITER);
export const officerOnly = authorize(USER_ROLES.PLACEMENT_OFFICER);
export const adminOnly = authorize(USER_ROLES.ADMIN);
export const officerOrAdmin = authorize(USER_ROLES.PLACEMENT_OFFICER, USER_ROLES.ADMIN);
export const recruiterOrAdmin = authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN);
