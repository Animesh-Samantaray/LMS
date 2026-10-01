
import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    lastRead: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  { timestamps: true }
);


discussionSchema.index({ members: 1 });

const Discussion =
  mongoose.models.Discussion ||
  mongoose.model("Discussion", discussionSchema);

export default Discussion;