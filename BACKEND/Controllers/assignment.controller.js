import mongoose from "mongoose";
import Assignment from "../Models/Assignment.model.js";
import Course from "../Models/course.model.js";
import uploadToCloudinary from "../Utils/uploadToCloudinary.js";


export const createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      maximumMarks,
      deadline,
      status,
    } = req.body;

    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Assignment title is required",
      });
    }

    if (!maximumMarks || Number(maximumMarks) < 1) {
      return res.status(400).json({
        success: false,
        message: "Maximum marks must be at least 1",
      });
    }

    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: "Assignment deadline is required",
      });
    }

    const deadlineDate = new Date(deadline);

    if (Number.isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid deadline",
      });
    }

    if (deadlineDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Assignment deadline must be in the future",
      });
    }

    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Question file is required",
      });
    }

  
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    
    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only create assignments for your own courses",
      });
    }

   
    const existingAssignment = await Assignment.findOne({
      courseId,
      title: title.trim(),
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: "An assignment with this title already exists in this course",
      });
    }

    
    const uploadedFile = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const assignment = await Assignment.create({
      courseId,
      title: title.trim(),
      description: description?.trim() || "",
      questionFile: {
        url: uploadedFile.url,
        publicId: uploadedFile.publicId,
        originalName: uploadedFile.originalName || req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
      maximumMarks: Number(maximumMarks),
      deadline: deadlineDate,
      status: status === "published" ? "published" : "draft",
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An assignment with this title already exists in this course",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create assignment",
    });
  }
};


export const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const userId = req.user._id.toString();

    
    if (req.user.role === "Student") {
      const isEnrolled = course.enrolled.some(
        (studentId) => studentId.toString() === userId
      );

      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled in this course to access assignments",
        });
      }
    }

    
    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only access assignments from your own courses",
      });
    }

    const filter = { courseId };

  
    if (req.user.role === "Student") {
      filter.status = "published";
    }

    const assignments = await Assignment.find(filter)
      .populate("createdBy", "name email profileImage role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get course assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch course assignments",
    });
  }
};


export const getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const assignment = await Assignment.findById(assignmentId)
      .populate("createdBy", "name email profileImage role");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(assignment.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course associated with this assignment was not found",
      });
    }

    const userId = req.user._id.toString();

   
    if (req.user.role === "Student") {
      const isEnrolled = course.enrolled.some(
        (studentId) => studentId.toString() === userId
      );

      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled in this course to access this assignment",
        });
      }

   
      if (assignment.status !== "published") {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }
    }

  
    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only access assignments from your own courses",
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
    });
  }
};



export const updateAssignment = async (req, res) => {

  try {
    const { assignmentId } = req.params;
    const {
      title,
      description,
      maximumMarks,
      deadline,
      status,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(assignment.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course associated with this assignment was not found",
      });
    }

   
    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update assignments from your own courses",
      });
    }

   
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Assignment title cannot be empty",
        });
      }

      const existingAssignment = await Assignment.findOne({
        courseId: assignment.courseId,
        title: title.trim(),
        _id: { $ne: assignmentId },
      });

      if (existingAssignment) {
        return res.status(409).json({
          success: false,
          message: "An assignment with this title already exists in this course",
        });
      }

      assignment.title = title.trim();
    }

    if (description !== undefined) {
      assignment.description = description.trim();
    }

    if (maximumMarks !== undefined) {
      const marks = Number(maximumMarks);

      if (!Number.isFinite(marks) || marks < 1) {
        return res.status(400).json({
          success: false,
          message: "Maximum marks must be at least 1",
        });
      }

      assignment.maximumMarks = marks;
    }

    if (deadline !== undefined) {
      const deadlineDate = new Date(deadline);

      if (Number.isNaN(deadlineDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid deadline",
        });
      }

      if (deadlineDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Assignment deadline must be in the future",
        });
      }

      assignment.deadline = deadlineDate;
    }

    if (status !== undefined) {
      if (!["draft", "published"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assignment status",
        });
      }

      assignment.status = status;
    }

   
    if (req.file) {
      const uploadedFile = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      assignment.questionFile = {
        url: uploadedFile.url,
        publicId: uploadedFile.publicId,
        originalName:
          uploadedFile.originalName || req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      };
    }

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Update assignment error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An assignment with this title already exists in this course",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update assignment",
    });
  }
};



export const publishAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(assignment.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course associated with this assignment was not found",
      });
    }

    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only publish assignments from your own courses",
      });
    }

    if (assignment.status === "published") {
      return res.status(409).json({
        success: false,
        message: "Assignment is already published",
      });
    }

    if (assignment.deadline <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot publish an assignment with an expired deadline",
      });
    }

    assignment.status = "published";

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Assignment published successfully",
      assignment,
    });
  } catch (error) {
    console.error("Publish assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to publish assignment",
    });
  }
};


export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(assignment.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course associated with this assignment was not found",
      });
    }

    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete assignments from your own courses",
      });
    }

    await Assignment.findByIdAndDelete(assignmentId);

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
    });
  }
};