import CourseQuery from "../Models/CourseQuery.model.js";
import Course from "../Models/Course.model.js";
import sendMail from "../Utils/sendMail.js";

// create query
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

// get my queries
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

// get course queries
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

// get query by id
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

// reply to query
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
      String(query.studentId?._id || query.studentId) === String(req.user._id);

    const isInstructor =
      query.courseId?.createdBy &&
      String(query.courseId.createdBy._id || query.courseId.createdBy) === String(req.user._id);

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

    if (req.user.role === "Admin" || req.user.role === "Instructor") {
      try {
        await query.populate([
          { path: "studentId", select: "name email" },
          { path: "courseId", select: "title" },
        ]);

        if (query.studentId?.email) {
          const studentName = query.studentId.name || "Student";
          const courseTitle = query.courseId?.title || "your course";
          const responderRole = req.user.role === "Admin" ? "Administrator" : "Course Instructor";
          const responderName = req.user.name || responderRole;

          const emailSubject = `Response to your query: "${query.subject}" - ${courseTitle}`;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
              <div style="padding-bottom: 16px; border-bottom: 2px solid #6366f1;">
                <h2 style="color: #1e293b; margin: 0; font-size: 20px;">Course Query Update</h2>
                <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">${courseTitle}</p>
              </div>

              <div style="padding: 20px 0;">
                <p style="color: #334155; font-size: 15px; margin: 0 0 12px;">Hello <strong>${studentName}</strong>,</p>
                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                  Your query <em>"${query.subject}"</em> has received a new reply from <strong>${responderName}</strong> (${responderRole}):
                </p>

                <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; border-radius: 6px; margin: 16px 0;">
                  <p style="margin: 0; color: #1e293b; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">${message.trim()}</p>
                </div>

                <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 6px; margin-top: 16px;">
                  <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Original Question:</span>
                  <p style="margin: 6px 0 0; color: #475569; font-size: 13px;">${query.description}</p>
                </div>
              </div>

              <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  Please log in to your LMS account to continue the discussion or mark this query as closed.
                </p>
              </div>
            </div>
          `;

          await sendMail({
            to: query.studentId.email,
            subject: emailSubject,
            html: emailHtml,
            text: `Hello ${studentName},\n\nYour query "${query.subject}" in ${courseTitle} received a reply from ${responderName}:\n\n${message.trim()}\n\nLog in to your LMS to view and respond.`,
          });
        }
      } catch (mailError) {
        console.error("Failed to send query reply email notification:", mailError.message);
      }
    }

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

// update query status
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
      query.courseId?.createdBy &&
      String(query.courseId.createdBy._id || query.courseId.createdBy) === String(req.user._id);

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

// get all queries
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

// get query stats
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