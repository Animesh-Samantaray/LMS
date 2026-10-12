import mongoose from "mongoose";

const chatbotLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      default: "",
      trim: true,
    },
    userEmail: {
      type: String,
      default: "",
      trim: true,
    },
    userRole: {
      type: String,
      default: "Student",
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    response: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

chatbotLogSchema.index({ createdAt: -1 });
chatbotLogSchema.index({ userName: "text", userEmail: "text", question: "text" });

const ChatbotLog = mongoose.model("ChatbotLog", chatbotLogSchema);

export default ChatbotLog;
