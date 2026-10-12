import CourseQuery from "../Models/CourseQuery.model.js";
import Course from "../Models/Course.model.js";

export const createQuery = async (req, res) => {
  try {
    const { courseId, subject, description } = req.body;

    if (!courseId || !subject?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const query = await CourseQuery.create({
      courseId,
      studentId: req.user._id,
      subject: subject.trim(),
      description: description.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Query submitted successfully",
      data: query,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyQueries = async (req, res) => {
  try {
    const queries = await CourseQuery.find({
      studentId: req.user._id,
    })
      .populate("courseId", "title")
      .populate("replies.from", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: queries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCourseQueries = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (
      req.user.role === "Instructor" &&
      String(course.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const queries = await CourseQuery.find({
      courseId: req.params.courseId,
    })
      .populate("courseId", "title createdBy")
      .populate("studentId", "name email")
      .populate("replies.from", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: queries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQueryById = async (req, res) => {
  try {
    const query = await CourseQuery.findById(req.params.queryId)
      .populate("courseId", "title createdBy")
      .populate("studentId", "name email")
      .populate("replies.from", "name role");

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    const isStudent =
      String(query.studentId._id) === String(req.user._id);

    const isInstructor =
      String(query.courseId.createdBy) === String(req.user._id);

    if (
      req.user.role !== "Admin" &&
      !isStudent &&
      !(req.user.role === "Instructor" && isInstructor)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      data: query,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const replyToQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const query = await CourseQuery.findById(req.params.queryId)
      .populate("courseId", "createdBy");

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    const isStudent =
      String(query.studentId) === String(req.user._id);

    const isInstructor =
      String(query.courseId.createdBy) === String(req.user._id);

    if (
      req.user.role !== "Admin" &&
      !isStudent &&
      !(req.user.role === "Instructor" && isInstructor)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (query.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "This query is closed",
      });
    }

    query.replies.push({
      from: req.user._id,
      fromRole: req.user.role,
      message: message.trim(),
    });

    query.lastRepliedAt = new Date();

    if (req.user.role === "Student") {
      query.status = "in_progress";
    } else {
      query.status = "answered";
    }

    await query.save();

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: query,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateQueryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "in_progress", "answered", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const query = await CourseQuery.findById(req.params.queryId)
      .populate("courseId", "createdBy");

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    const isInstructor =
      String(query.courseId.createdBy) === String(req.user._id);

    if (
      req.user.role !== "Admin" &&
      !(req.user.role === "Instructor" && isInstructor)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    query.status = status;
    await query.save();

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: query,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllQueries = async (req, res) => {
  try {
    const queries = await CourseQuery.find()
      .populate("courseId", "title createdBy")
      .populate("studentId", "name email")
      .populate("replies.from", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: queries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQueryStats = async (req, res) => {
  try {
    const total = await CourseQuery.countDocuments();
    const pending = await CourseQuery.countDocuments({ status: "pending" });
    const inProgress = await CourseQuery.countDocuments({ status: "in_progress" });
    const answered = await CourseQuery.countDocuments({ status: "answered" });
    const closed = await CourseQuery.countDocuments({ status: "closed" });

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        answered,
        closed,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};