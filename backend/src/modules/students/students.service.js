import Student from "../../models/Student.js";
import User from "../../models/User.js";
import { mapStudent } from "../../utils/mappers.js";
import { VERIFICATION_STATUS } from "../../constants/index.js";

export async function getStudentByUserId(userId) {
  const student = await Student.findOne({ userId });
  if (!student) {
    const err = new Error("Student profile not found");
    err.statusCode = 404;
    throw err;
  }
  return mapStudent(student);
}

export async function listStudents({ status, search, page = 1, limit = 50 }) {
  const filter = {};
  if (status) filter.verificationStatus = status;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Student.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Student.countDocuments(filter),
  ]);

  return {
    items: items.map((s) => mapStudent(s)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function updateStudentProfile(userId, updates) {
  const allowed = [
    "name", "phone", "linkedin", "github", "skills", "projects",
    "certifications", "resumeText", "academic", "resumeScore", "atsScore", "readinessScore",
  ];

  const payload = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) payload[key] = updates[key];
  }

  const student = await Student.findOneAndUpdate({ userId }, payload, { new: true, runValidators: true });
  if (!student) {
    const err = new Error("Student profile not found");
    err.statusCode = 404;
    throw err;
  }

  if (updates.name) {
    await User.findByIdAndUpdate(userId, { name: updates.name });
  }

  return mapStudent(student);
}

export async function requestVerification(userId) {
  const student = await Student.findOneAndUpdate(
    { userId },
    { verificationStatus: VERIFICATION_STATUS.PENDING },
    { new: true }
  );
  if (!student) {
    const err = new Error("Student profile not found");
    err.statusCode = 404;
    throw err;
  }
  return mapStudent(student);
}

export async function verifyStudent(studentUserId, status, remarks, officerId) {
  const student = await Student.findOneAndUpdate(
    { userId: studentUserId },
    { verificationStatus: status, verificationRemarks: remarks },
    { new: true }
  );
  if (!student) {
    const err = new Error("Student not found");
    err.statusCode = 404;
    throw err;
  }
  return mapStudent(student);
}

export async function deleteStudent(studentUserId) {
  const student = await Student.findOneAndDelete({ userId: studentUserId });
  if (!student) {
    const err = new Error("Student not found");
    err.statusCode = 404;
    throw err;
  }
  await User.findByIdAndDelete(studentUserId);
  return { deleted: true };
}
