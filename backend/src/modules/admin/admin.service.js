import User from "../../models/User.js";
import Student from "../../models/Student.js";
import Job from "../../models/Job.js";
import Application from "../../models/Application.js";
import PlacementDrive from "../../models/PlacementDrive.js";
import MockInterview from "../../models/MockInterview.js";
import { VERIFICATION_STATUS } from "../../constants/index.js";

export async function getPlatformStats() {
  const [
    totalUsers,
    students,
    recruiters,
    officers,
    admins,
    jobs,
    applications,
    drives,
    mockInterviews,
    pendingVerifications,
    pendingJobs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "recruiter" }),
    User.countDocuments({ role: "placementOfficer" }),
    User.countDocuments({ role: "admin" }),
    Job.countDocuments({ isActive: true }),
    Application.countDocuments(),
    PlacementDrive.countDocuments(),
    MockInterview.countDocuments(),
    Student.countDocuments({ verificationStatus: VERIFICATION_STATUS.PENDING }),
    Job.countDocuments({ verificationStatus: "Pending", isActive: true }),
  ]);

  const selected = await Application.countDocuments({ status: "selected" });
  const shortlisted = await Application.countDocuments({ status: "shortlisted" });

  return {
    totalUsers,
    students,
    recruiters,
    officers,
    admins,
    jobs,
    applications,
    drives,
    mockInterviews,
    pendingVerifications,
    pendingJobs,
    selected,
    shortlisted,
    hireRate: applications > 0 ? Math.round((selected / applications) * 100) : 0,
  };
}

export async function listAllUsers({ role, page = 1, limit = 50 }) {
  const filter = {};
  if (role) filter.role = role;
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return {
    items: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      companyName: u.companyName,
      isActive: u.isActive,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function grantStudentVerification(studentUserId) {
  const student = await Student.findOneAndUpdate(
    { userId: studentUserId },
    { verificationStatus: VERIFICATION_STATUS.VERIFIED },
    { new: true }
  );
  if (!student) {
    const err = new Error("Student not found");
    err.statusCode = 404;
    throw err;
  }
  return student;
}

export async function resetPlatformData() {
  await Promise.all([
    Application.deleteMany({}),
    MockInterview.deleteMany({}),
    Job.deleteMany({}),
    PlacementDrive.deleteMany({}),
    Student.deleteMany({}),
    User.deleteMany({}),
  ]);
  return { reset: true };
}
