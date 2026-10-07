import mongoose from "mongoose";

const practiceSubmissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "PracticeChallenge", required: true },
    code: { type: String, default: "" },
    language: { type: String, default: "javascript" },
    status: { type: String, enum: ["Attempted", "Completed"], default: "Attempted" }
  },
  { timestamps: true }
);

practiceSubmissionSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

const PracticeSubmission = mongoose.models.PracticeSubmission || mongoose.model("PracticeSubmission", practiceSubmissionSchema);

export default PracticeSubmission;
