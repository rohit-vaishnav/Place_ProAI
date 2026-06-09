import * as adminService from "./admin.service.js";
import { success, paginated } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getStats = asyncHandler(async (_req, res) => {
  const stats = await adminService.getPlatformStats();
  return success(res, stats);
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listAllUsers({
    role: req.query.role,
    page: parseInt(req.query.page || "1", 10),
    limit: parseInt(req.query.limit || "50", 10),
  });
  return paginated(res, result.items, result.pagination);
});

export const grantVerification = asyncHandler(async (req, res) => {
  await adminService.grantStudentVerification(req.params.id);
  return success(res, null, "Student verification granted");
});

export const resetData = asyncHandler(async (_req, res) => {
  await adminService.resetPlatformData();
  return success(res, null, "Platform data reset — run seed script to repopulate");
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await adminService.createUserByAdmin(req.body);
  return success(res, user, "User created successfully by Administrator", 201);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUserByAdmin(req.params.id);
  return success(res, null, "User deleted successfully");
});


