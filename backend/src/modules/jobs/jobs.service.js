import Job from "../../models/Job.js";
import { mapJob } from "../../utils/mappers.js";
import { JOB_VERIFICATION_STATUS } from "../../constants/index.js";

export async function listJobs({ recruiterId, verificationStatus, search, forStudents, page = 1, limit = 50 }) {
  const filter = { isActive: true };
  if (recruiterId) filter.recruiterId = recruiterId;
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (forStudents) filter.verificationStatus = JOB_VERIFICATION_STATUS.APPROVED;
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);

  return {
    items: items.map(mapJob),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getJobById(jobId) {
  const job = await Job.findById(jobId);
  if (!job) {
    const err = new Error("Job not found");
    err.statusCode = 404;
    throw err;
  }
  return mapJob(job);
}

export async function createJob(recruiter, payload) {
  const job = await Job.create({
    recruiterId: recruiter._id,
    recruiterName: recruiter.companyName || recruiter.name,
    title: payload.title,
    description: payload.description,
    skills: payload.skills || [],
    location: payload.location,
    salary: payload.salary,
    eligibility: payload.eligibility,
    deadline: payload.deadline,
    verificationStatus: JOB_VERIFICATION_STATUS.PENDING,
  });
  return mapJob(job);
}

export async function updateJob(jobId, recruiterId, payload, isAdmin = false) {
  const job = await Job.findById(jobId);
  if (!job) {
    const err = new Error("Job not found");
    err.statusCode = 404;
    throw err;
  }
  if (!isAdmin && job.recruiterId.toString() !== recruiterId.toString()) {
    const err = new Error("You can only update your own job postings");
    err.statusCode = 403;
    throw err;
  }

  const fields = ["title", "description", "skills", "location", "salary", "eligibility", "deadline"];
  for (const f of fields) {
    if (payload[f] !== undefined) job[f] = payload[f];
  }

  await job.save();
  return mapJob(job);
}

export async function deleteJob(jobId, recruiterId, isAdmin = false) {
  const job = await Job.findById(jobId);
  if (!job) {
    const err = new Error("Job not found");
    err.statusCode = 404;
    throw err;
  }
  if (!isAdmin && job.recruiterId.toString() !== recruiterId.toString()) {
    const err = new Error("You can only delete your own job postings");
    err.statusCode = 403;
    throw err;
  }
  job.isActive = false;
  await job.save();
  return { deleted: true };
}

export async function verifyJob(jobId, status, remarks) {
  const job = await Job.findByIdAndUpdate(
    jobId,
    { verificationStatus: status, verificationRemarks: remarks },
    { new: true }
  );
  if (!job) {
    const err = new Error("Job not found");
    err.statusCode = 404;
    throw err;
  }
  return mapJob(job);
}
