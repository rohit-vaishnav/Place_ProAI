import mongoose from "mongoose";

const placementDriveSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    startDate: { type: String, required: true },
    eligibleCourses: [{ type: String }],
    cgpaCutoff: { type: Number, default: 7.0 },
    registeredCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Upcoming", "Active", "Completed"],
      default: "Upcoming",
    },
    location: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("PlacementDrive", placementDriveSchema);
