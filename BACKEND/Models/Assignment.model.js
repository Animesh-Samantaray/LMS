import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    questionFile: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        default: "",
      },
      originalName: {
        type: String,
        default: "",
      },
      fileSize: {
        type: Number,
        default: 0,
      },
      mimeType: {
        type: String,
        default: "",
      },
    },

    maximumMarks: {
      type: Number,
      required: true,
      min: 1,
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


assignmentSchema.index(
  { courseId: 1, title: 1 },
  { unique: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;