import mongoose from "mongoose";
import { APPLICATION_STATUS } from "../constants/index.js";

const applicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
    },
    appliedAt: { type: Date, default: Date.now },
    interviewDate: Date,
    recruiterFeedback: String,
    mockInterviewId: { type: mongoose.Schema.Types.ObjectId, ref: "MockInterview" },
    interviewScore: Number,
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ recruiterId: 1, status: 1 });
applicationSchema.index({ jobId: 1 });

export default mongoose.model("Application", applicationSchema);
