import AssignmentSubmission from "../Models/AssignmentSubmission.model.js";
import Assignment from "../Models/Assignment.model.js";
import Course from "../Models/Course.model.js";
import uploadToCloudinary from "../Utils/uploadToCloudinary.js";

export const submitAssignment = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    if (assignment.status !== "published") {
      return res.status(403).json({ success: false, message: "Assignment is not published." });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const isEnrolled = course.enrolled.some((id) => id.toString() === studentId.toString());
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this course." });
    }

    const existingSubmission = await AssignmentSubmission.findOne({ assignmentId, studentId });
    if (existingSubmission) {
      return res.status(409).json({ success: false, message: "Assignment already submitted." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one answer file is required." });
    }

    const answerFiles = [];
    for (const file of req.files) {
      const uploadResult = await uploadToCloudinary(file.buffer, {
        mimeType: file.mimetype,
        originalName: file.originalname,
        folder: "lms/assignments/submissions",
      });

      answerFiles.push({
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      });
    }

    const now = new Date();
    const isLate = now > new Date(assignment.deadline);

    const submissionData = {
      assignmentId,
      studentId,
      answerFiles,
      submittedAt: now,
      status: isLate ? "marked" : "submitted",
      isLate,
      marks: isLate ? 0 : null,
    };

    const submission = await AssignmentSubmission.create(submissionData);

    return res.status(201).json({
      success: true,
      message: "Assignment submitted successfully.",
      submission,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Assignment already submitted." });
    }
    return res.status(500).json({ success: false, message: error.message || "Server error." });
  }
};

export const getMySubmission = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const isEnrolled = course.enrolled.some((id) => id.toString() === studentId.toString());
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this course." });
    }

    const submission = await AssignmentSubmission.findOne({ assignmentId, studentId });
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server error." });
  }
};

export const getAssignmentSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (role === "Instructor" && course.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view submissions for this course." });
    }

    const submissions = await AssignmentSubmission.find({ assignmentId }).populate("studentId", "name email profileImage");
    const totalEnrolled = course.enrolled.length;
    const totalSubmissions = submissions.length;
    
    let marked = 0;
    let toEvaluate = 0;

    submissions.forEach((sub) => {
      if (sub.status === "marked") marked++;
      if (sub.status === "submitted") toEvaluate++;
    });

    const pending = totalEnrolled > totalSubmissions ? totalEnrolled - totalSubmissions : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalEnrolled,
        totalSubmissions,
        submitted: totalSubmissions,
        pending,
        marked,
        toEvaluate,
        submissions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server error." });
  }
};

export const evaluateSubmission = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const { submissionId } = req.params;
    const { marks, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (role === "Instructor" && course.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to evaluate this submission." });
    }

    if (submission.isLate) {
      return res.status(400).json({ success: false, message: "Late submissions cannot be manually evaluated." });
    }

    const numericMarks = Number(marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > assignment.maximumMarks) {
      return res.status(400).json({ success: false, message: "Invalid marks provided." });
    }

    submission.marks = numericMarks;
    submission.feedback = feedback || "";
    submission.status = "marked";
    submission.evaluatedBy = userId;
    submission.evaluatedAt = new Date();

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Submission evaluated successfully.",
      submission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server error." });
  }
};
