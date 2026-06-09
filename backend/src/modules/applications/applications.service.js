import Application from "../../models/Application.js";
import Job from "../../models/Job.js";
import Student from "../../models/Student.js";
import MockInterview from "../../models/MockInterview.js";
import PlacementDrive from "../../models/PlacementDrive.js";
import { mapApplication } from "../../utils/mappers.js";
import { APPLICATION_STATUS, STATUS_FROM_FRONTEND, JOB_VERIFICATION_STATUS, VERIFICATION_STATUS } from "../../constants/index.js";

export async function listApplications({ studentId, recruiterId, jobId, status, page = 1, limit = 50 }) {
  const filter = {};
  if (studentId) filter.studentId = studentId;
  if (recruiterId) filter.recruiterId = recruiterId;
  if (jobId) filter.jobId = jobId;
  if (status) {
    filter.status = STATUS_FROM_FRONTEND[status] || status;
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Application.find(filter).sort({ appliedAt: -1 }).skip(skip).limit(limit),
    Application.countDocuments(filter),
  ]);

  return {
    items: items.map(mapApplication),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function applyToJob(studentUser, jobId) {
  const job = await Job.findById(jobId);
  if (!job || !job.isActive) {
    const err = new Error("Job not found");
    err.statusCode = 404;
    throw err;
  }
  if (job.verificationStatus !== JOB_VERIFICATION_STATUS.APPROVED) {
    const err = new Error("This job is not yet approved for student applications");
    err.statusCode = 400;
    throw err;
  }

  const student = await Student.findOne({ userId: studentUser._id });
  if (!student || student.verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
    const err = new Error("Your profile must be verified before applying to jobs");
    err.statusCode = 403;
    throw err;
  }

  const existing = await Application.findOne({ studentId: studentUser._id, jobId });
  if (existing) {
    const err = new Error("You have already applied to this job");
    err.statusCode = 409;
    throw err;
  }

  const application = await Application.create({
    studentId: studentUser._id,
    jobId,
    recruiterId: job.recruiterId,
    studentName: student.name,
    status: APPLICATION_STATUS.APPLIED,
  });

  // Increment drive registered count if company name matches
  const drives = await PlacementDrive.find({
    companyName: new RegExp(job.recruiterName, "i"),
    status: { $in: ["Upcoming", "Active"] },
  });
  for (const drive of drives) {
    drive.registeredCount += 1;
    await drive.save();
  }

  return mapApplication(application);
}

export async function updateApplicationStatus(appId, recruiterId, payload, isAdmin = false) {
  const application = await Application.findById(appId);
  if (!application) {
    const err = new Error("Application not found");
    err.statusCode = 404;
    throw err;
  }
  if (!isAdmin && application.recruiterId.toString() !== recruiterId.toString()) {
    const err = new Error("You can only manage applications for your own jobs");
    err.statusCode = 403;
    throw err;
  }

  const frontendStatus = payload.status;
  const backendStatus = STATUS_FROM_FRONTEND[frontendStatus] || payload.status;

  application.status = backendStatus;
  if (payload.interviewDate) application.interviewDate = payload.interviewDate;
  if (payload.recruiterFeedback) application.recruiterFeedback = payload.recruiterFeedback;
  if (payload.interviewScore !== undefined) application.interviewScore = payload.interviewScore;

  if (backendStatus === APPLICATION_STATUS.MOCK_INTERVIEW_ASSIGNED) {
    const mock = await MockInterview.findOne({ studentId: application.studentId }).sort({ createdAt: -1 });
    if (mock) {
      application.mockInterviewId = mock._id;
      application.interviewScore = mock.totalScore;
    }
  }

  await application.save();
  return mapApplication(application);
}

export async function getApplicantProfilesForJob(jobId, recruiterId, isAdmin = false) {
  const job = await Job.findById(jobId);
  if (!job) {
    const err = new Error("Job not found");
    err.statusCode = 404;
    throw err;
  }
  if (!isAdmin && job.recruiterId.toString() !== recruiterId.toString()) {
    const err = new Error("Access denied");
    err.statusCode = 403;
    throw err;
  }

  const applications = await Application.find({ jobId });
  const studentIds = applications.map((a) => a.studentId);
  const students = await Student.find({ userId: { $in: studentIds } });

  return applications.map((app) => {
    const student = students.find((s) => s.userId.toString() === app.studentId.toString());
    return {
      application: mapApplication(app),
      student: student ? {
        id: student.userId.toString(),
        name: student.name,
        skills: student.skills,
        resumeScore: student.resumeScore,
        atsScore: student.atsScore,
        verificationStatus: student.verificationStatus,
        academic: student.academic,
        resumeText: student.resumeText,
      } : null,
    };
  });
}
