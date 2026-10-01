import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    discussionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "sticker", "file"],
      default: "text",
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileMimeType: {
      type: String,
      default: "",
    },
    stickerId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

messageSchema.index({ discussionId: 1, createdAt: 1 });

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;