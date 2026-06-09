import mongoose from "mongoose";
import { VERIFICATION_STATUS } from "../constants/index.js";

const academicSchema = new mongoose.Schema(
  {
    degree: String,
    major: String,
    institution: String,
    graduationYear: String,
    cgpa: String,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: String,
    desc: String,
    tech: String,
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    skills: [{ type: String }],
    projects: [projectSchema],
    certifications: [{ type: String }],
    resumeText: { type: String, default: "" },
    academic: { type: academicSchema, default: () => ({}) },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.UNSUBMITTED,
    },
    verificationRemarks: String,
    resumeScore: { type: Number, default: 0 },
    atsScore: { type: Number, default: 0 },
    readinessScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
