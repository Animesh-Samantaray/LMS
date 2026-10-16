import mongoose from "mongoose";

const directConversationSchema = new mongoose.Schema(
  {
    pairKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      content: {
        type: String,
        default: "",
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      type: {
        type: String,
        enum: ["text", "sticker", "file"],
        default: "text",
      },
      fileName: {
        type: String,
        default: "",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    archivedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        archivedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

directConversationSchema.index({ participants: 1 });
directConversationSchema.index({ "archivedBy.user": 1 });

const DirectConversation =
  mongoose.models.DirectConversation ||
  mongoose.model("DirectConversation", directConversationSchema);

export default DirectConversation;
