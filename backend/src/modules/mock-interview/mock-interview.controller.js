import * as mockInterviewService from "./mock-interview.service.js";
import { success, paginated } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { USER_ROLES } from "../../constants/index.js";

export const saveResult = asyncHandler(async (req, res) => {
  const result = await mockInterviewService.saveMockInterview(req.user, req.body);
  return success(res, result, "Mock interview saved", 201);
});

export const listResults = asyncHandler(async (req, res) => {
  const studentId = req.user.role === USER_ROLES.STUDENT ? req.user._id : req.query.studentId;
  const result = await mockInterviewService.listMockInterviews({
    studentId,
    page: parseInt(req.query.page || "1", 10),
    limit: parseInt(req.query.limit || "20", 10),
  });
  return paginated(res, result.items, result.pagination);
});

export const getResult = asyncHandler(async (req, res) => {
  const studentId = req.user.role === USER_ROLES.STUDENT ? req.user._id : null;
  const result = await mockInterviewService.getMockInterviewById(req.params.id, studentId);
  return success(res, result);
});
