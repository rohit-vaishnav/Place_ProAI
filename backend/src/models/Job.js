import mongoose from "mongoose";
import { JOB_VERIFICATION_STATUS } from "../constants/index.js";

const jobSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recruiterName: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    skills: [{ type: String }],
    location: { type: String, default: "" },
    salary: { type: String, default: "" },
    eligibility: { type: String, default: "" },
    deadline: { type: String, default: "" },
    verificationStatus: {
      type: String,
      enum: Object.values(JOB_VERIFICATION_STATUS),
      default: JOB_VERIFICATION_STATUS.PENDING,
    },
    verificationRemarks: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ recruiterId: 1, verificationStatus: 1 });
jobSchema.index({ title: "text", description: "text" });

export default mongoose.model("Job", jobSchema);
