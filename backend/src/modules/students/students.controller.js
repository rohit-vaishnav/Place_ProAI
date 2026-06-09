import * as studentsService from "./students.service.js";
import { success, paginated } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await studentsService.getStudentByUserId(req.user._id);
  return success(res, profile);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await studentsService.updateStudentProfile(req.user._id, req.body);
  return success(res, profile, "Profile updated");
});

export const requestVerification = asyncHandler(async (req, res) => {
  const profile = await studentsService.requestVerification(req.user._id);
  return success(res, profile, "Verification request submitted");
});

export const listStudents = asyncHandler(async (req, res) => {
  const { status, search, page, limit } = req.query;
  const result = await studentsService.listStudents({
    status,
    search,
    page: parseInt(page || "1", 10),
    limit: parseInt(limit || "50", 10),
  });
  return paginated(res, result.items, result.pagination);
});

export const verifyStudent = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const profile = await studentsService.verifyStudent(req.params.id, status, remarks, req.user._id);
  return success(res, profile, `Student ${status.toLowerCase()}`);
});

export const deleteStudent = asyncHandler(async (req, res) => {
  await studentsService.deleteStudent(req.params.id);
  return success(res, null, "Student deleted");
});

export const getStudentById = asyncHandler(async (req, res) => {
  const profile = await studentsService.getStudentByUserId(req.params.id);
  return success(res, profile);
});
