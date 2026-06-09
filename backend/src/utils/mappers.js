import { STATUS_TO_FRONTEND } from "../constants/index.js";

export function toId(doc) {
  if (!doc) return null;
  if (typeof doc === "string") return doc;
  return doc._id?.toString() || doc.id;
}

export function mapUser(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : user;
  return {
    id: toId(obj),
    name: obj.name,
    email: obj.email,
    role: obj.role,
    companyName: obj.companyName,
    isActive: obj.isActive !== false,
  };
}

export function mapStudent(student, user = null) {
  if (!student) return null;
  const obj = student.toObject ? student.toObject() : student;
  const u = user || obj.userId;
  return {
    id: toId(obj.userId || obj.user),
    name: obj.name || u?.name,
    email: obj.email || u?.email,
    phone: obj.phone || "",
    linkedin: obj.linkedin || "",
    github: obj.github || "",
    skills: obj.skills || [],
    projects: obj.projects || [],
    certifications: obj.certifications || [],
    resumeText: obj.resumeText || "",
    academic: obj.academic || {},
    verificationStatus: obj.verificationStatus || "Unsubmitted",
    verificationRemarks: obj.verificationRemarks,
    resumeScore: obj.resumeScore ?? 0,
    atsScore: obj.atsScore ?? 0,
    readinessScore: obj.readinessScore ?? 0,
  };
}

export function mapJob(job) {
  if (!job) return null;
  const obj = job.toObject ? job.toObject() : job;
  return {
    id: toId(obj),
    recruiterId: toId(obj.recruiterId),
    recruiterName: obj.recruiterName,
    title: obj.title,
    description: obj.description,
    skills: obj.skills || [],
    location: obj.location,
    salary: obj.salary,
    eligibility: obj.eligibility,
    deadline: obj.deadline,
    verificationStatus: obj.verificationStatus,
    verificationRemarks: obj.verificationRemarks,
  };
}

export function mapApplication(app) {
  if (!app) return null;
  const obj = app.toObject ? app.toObject() : app;
  return {
    id: toId(obj),
    jobId: toId(obj.jobId),
    studentId: toId(obj.studentId),
    studentName: obj.studentName,
    status: STATUS_TO_FRONTEND[obj.status] || obj.status,
    appliedDate: obj.appliedAt
      ? new Date(obj.appliedAt).toISOString().split("T")[0]
      : obj.appliedDate,
    mockInterviewId: obj.mockInterviewId ? toId(obj.mockInterviewId) : undefined,
    interviewScore: obj.interviewScore,
    interviewDate: obj.interviewDate,
    recruiterFeedback: obj.recruiterFeedback,
  };
}

export function mapDrive(drive) {
  if (!drive) return null;
  const obj = drive.toObject ? drive.toObject() : drive;
  return {
    id: toId(obj),
    companyName: obj.companyName,
    startDate: obj.startDate,
    eligibleCourses: obj.eligibleCourses || [],
    cgpaCutoff: obj.cgpaCutoff,
    registeredCount: obj.registeredCount ?? 0,
    status: obj.status,
    location: obj.location,
  };
}

export function mapMockInterview(mock) {
  if (!mock) return null;
  const obj = mock.toObject ? mock.toObject() : mock;
  return {
    id: toId(obj),
    studentId: toId(obj.studentId),
    studentName: obj.studentName,
    jobTitle: obj.jobTitle,
    roundType: obj.roundType,
    totalScore: obj.totalScore,
    grade: obj.grade,
    verdict: obj.verdict || obj.readinessVerdict,
    strengths: obj.strengths || [],
    weaknesses: obj.weaknesses || [],
    detailedQnaFeedback: obj.detailedQnaFeedback || [],
    actionableTips: obj.actionableTips || [],
    communicationScore: obj.communicationScore,
    confidenceScore: obj.confidenceScore,
  };
}
