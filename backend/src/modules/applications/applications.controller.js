import * as applicationsService from "./applications.service.js";
import { success, paginated } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { USER_ROLES } from "../../constants/index.js";

export const listApplications = asyncHandler(async (req, res) => {
  const { jobId, status, page, limit } = req.query;
  let studentId;
  let recruiterId;

  if (req.user.role === USER_ROLES.STUDENT) studentId = req.user._id;
  if (req.user.role === USER_ROLES.RECRUITER) recruiterId = req.user._id;

  const result = await applicationsService.listApplications({
    studentId,
    recruiterId,
    jobId,
    status,
    page: parseInt(page || "1", 10),
    limit: parseInt(limit || "50", 10),
  });
  return paginated(res, result.items, result.pagination);
});

export const applyToJob = asyncHandler(async (req, res) => {
  const application = await applicationsService.applyToJob(req.user, req.params.jobId);
  return success(res, application, "Application submitted", 201);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const application = await applicationsService.updateApplicationStatus(
    req.params.id,
    req.user._id,
    req.body,
    isAdmin
  );
  return success(res, application, "Application status updated");
});

export const getJobApplicants = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const applicants = await applicationsService.getApplicantProfilesForJob(
    req.params.jobId,
    req.user._id,
    isAdmin
  );
  return success(res, applicants);
});
