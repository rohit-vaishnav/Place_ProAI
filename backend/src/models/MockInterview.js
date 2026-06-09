import mongoose from "mongoose";

const qnaFeedbackSchema = new mongoose.Schema(
  {
    questionId: Number,
    question: String,
    candidateAnswer: String,
    score: Number,
    pros: String,
    cons: String,
    suggestedExcellentModelAnswer: String,
  },
  { _id: false }
);

const mockInterviewSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    roundType: {
      type: String,
      enum: ["Technical", "HR", "Behavioral"],
      default: "Technical",
    },
    totalScore: { type: Number, default: 0 },
    grade: String,
    verdict: String,
    readinessVerdict: String,
    strengths: [String],
    weaknesses: [String],
    detailedQnaFeedback: [qnaFeedbackSchema],
    actionableTips: [String],
    communicationScore: Number,
    confidenceScore: Number,
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
  },
  { timestamps: true }
);

export default mongoose.model("MockInterview", mockInterviewSchema);
