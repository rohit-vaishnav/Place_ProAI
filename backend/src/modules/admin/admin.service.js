import User from "../../models/User.js";
import Student from "../../models/Student.js";
import Job from "../../models/Job.js";
import Application from "../../models/Application.js";
import PlacementDrive from "../../models/PlacementDrive.js";
import MockInterview from "../../models/MockInterview.js";
import { USER_ROLES, VERIFICATION_STATUS } from "../../constants/index.js";


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

export async function createUserByAdmin(payload) {
  const { name, email, password, role, companyName, location } = payload;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }
  
  const user = await User.create({
    name,
    email,
    password,
    role,
    companyName: role === USER_ROLES.RECRUITER ? companyName : undefined,
    location: role === USER_ROLES.RECRUITER ? location : undefined,
  });

  if (role === USER_ROLES.STUDENT) {
    await Student.create({
      userId: user._id,
      name,
      email,
      phone: "+91 ",
      linkedin: "https://linkedin.com/in/",
      github: "https://github.com/",
      skills: ["React", "JavaScript", "HTML/CSS", "Python"],
      projects: [],
      certifications: ["PlacePro AI Academy Graduate"],
      resumeText: `${name.toUpperCase()} - Software Aspirant`,
      academic: {
        degree: "B.Tech",
        major: "Computer Science",
        institution: "State Engineering College",
        graduationYear: "2026",
        cgpa: "8.5"
      },
      verificationStatus: VERIFICATION_STATUS.PENDING,
      resumeScore: 70,
      atsScore: 68,
      readinessScore: 72,
    });
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    companyName: user.companyName,
    isActive: user.isActive,
  };
}

export async function deleteUserByAdmin(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  
  if (user.role === "student") {
    await Student.findOneAndDelete({ userId });
  }
  
  await User.findByIdAndDelete(userId);
  return { deleted: true };
}


