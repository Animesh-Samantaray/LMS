import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    type: {
      type: String,
      required: true,
      enum: ["PDF", "Document", "Link", "Video", "Code", "Other"],
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;