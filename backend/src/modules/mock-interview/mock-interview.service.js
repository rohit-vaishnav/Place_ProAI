import MockInterview from "../../models/MockInterview.js";
import Application from "../../models/Application.js";
import Student from "../../models/Student.js";
import { mapMockInterview } from "../../utils/mappers.js";
import { APPLICATION_STATUS } from "../../constants/index.js";

export async function saveMockInterview(studentUser, payload) {
  const student = await Student.findOne({ userId: studentUser._id });
  const mock = await MockInterview.create({
    studentId: studentUser._id,
    studentName: student?.name || studentUser.name,
    jobTitle: payload.jobTitle,
    roundType: payload.roundType,
    totalScore: payload.totalScore,
    grade: payload.grade,
    verdict: payload.verdict || payload.readinessVerdict,
    readinessVerdict: payload.readinessVerdict,
    strengths: payload.strengths || [],
    weaknesses: payload.weaknesses || [],
    detailedQnaFeedback: payload.detailedQnaFeedback || [],
    actionableTips: payload.actionableTips || [],
    communicationScore: payload.communicationScore ?? Math.round(payload.totalScore * 0.9),
    confidenceScore: payload.confidenceScore ?? Math.round(payload.totalScore * 0.85),
  });

  return mapMockInterview(mock);
}

export async function listMockInterviews({ studentId, page = 1, limit = 20 }) {
  const filter = {};
  if (studentId) filter.studentId = studentId;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    MockInterview.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    MockInterview.countDocuments(filter),
  ]);

  return {
    items: items.map(mapMockInterview),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getMockInterviewById(id, studentId) {
  const mock = await MockInterview.findById(id);
  if (!mock) {
    const err = new Error("Mock interview result not found");
    err.statusCode = 404;
    throw err;
  }
  if (studentId && mock.studentId.toString() !== studentId.toString()) {
    const err = new Error("Access denied");
    err.statusCode = 403;
    throw err;
  }
  return mapMockInterview(mock);
}
