import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
}, { _id: false });

const practiceChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  instructions: { type: String },
  language: { type: String, required: true },
  initialCode: { type: String },
  testCases: [testCaseSchema],
  timeLimit: { type: Number, default: 1000 }
}, { timestamps: true });

const PracticeChallenge = mongoose.model("PracticeChallenge", practiceChallengeSchema);

export default PracticeChallenge;
