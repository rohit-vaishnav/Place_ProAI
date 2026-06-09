import * as jobsService from "./jobs.service.js";
import { success, paginated } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { USER_ROLES } from "../../constants/index.js";

export const listJobs = asyncHandler(async (req, res) => {
  const { verificationStatus, search, page, limit } = req.query;
  const forStudents = req.user?.role === USER_ROLES.STUDENT;
  const recruiterId = req.user?.role === USER_ROLES.RECRUITER ? req.user._id : req.query.recruiterId;

  const result = await jobsService.listJobs({
    recruiterId,
    verificationStatus,
    search,
    forStudents,
    page: parseInt(page || "1", 10),
    limit: parseInt(limit || "50", 10),
  });
  return paginated(res, result.items, result.pagination);
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await jobsService.getJobById(req.params.id);
  return success(res, job);
});

export const createJob = asyncHandler(async (req, res) => {
  const job = await jobsService.createJob(req.user, req.body);
  return success(res, job, "Job created — pending placement officer verification", 201);
});

export const updateJob = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const job = await jobsService.updateJob(req.params.id, req.user._id, req.body, isAdmin);
  return success(res, job, "Job updated");
});

export const deleteJob = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  await jobsService.deleteJob(req.params.id, req.user._id, isAdmin);
  return success(res, null, "Job deleted");
});

export const verifyJob = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const job = await jobsService.verifyJob(req.params.id, status, remarks);
  return success(res, job, `Job ${status.toLowerCase()}`);
});
