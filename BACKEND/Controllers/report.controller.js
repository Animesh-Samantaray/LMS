import mongoose from "mongoose";
import Report from "../Models/Report.model.js";
import uploadToCloudinary from "../Utils/uploadToCloudinary.js";

const VALID_REPORT_TYPES = [
  "Course",
  "Content",
  "Message",
  "Discussion",
  "User",
  "Quiz",
  "Assignment",
  "Technical",
  "Other",
];

const VALID_REPORT_STATUSES = [
  "Open",
  "In Review",
  "Resolved",
  "Rejected",
];

export const createReport = async (req, res) => {
  try {
    const { type, name, description, courseId } = req.body;

    if (!type || !type.trim() || !name || !name.trim() || !description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Type, name and description are required",
      });
    }

    if (!VALID_REPORT_TYPES.includes(type.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid report type",
      });
    }

    if (courseId && !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    let attachment = {
      url: "",
      publicId: "",
      resourceType: "",
      name: "",
      size: 0,
      mimeType: "",
    };

    if (req.file) {
      if (req.file.size > 25 * 1024 * 1024) {
        return res.status(413).json({
          success: false,
          message: "File size exceeds the allowed limit (25 MB)",
        });
      }

      const uploadedFile = await uploadToCloudinary(
        req.file.buffer,
        {
          folder: "lms/reports",
          mimeType: req.file.mimetype,
          originalName: req.file.originalname,
        }
      );

      attachment = {
        url: uploadedFile.url,
        publicId: uploadedFile.publicId,
        resourceType: uploadedFile.resourceType,
        name: uploadedFile.originalName || req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      };
    }

    const report = await Report.create({
      reportId: `REP-${Date.now()}`,
      reportedBy: req.user._id,
      type: type.trim(),
      name: name.trim(),
      description: description.trim(),
      attachment,
      courseId: courseId || null,
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("Create Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create report",
    });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const filter = { reportedBy: req.user._id };

    if (status && status !== "All" && VALID_REPORT_STATUSES.includes(status)) {
      filter.status = status;
    }

    if (type && type !== "All" && VALID_REPORT_TYPES.includes(type)) {
      filter.type = type;
    }

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { reportId: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const reports = await Report.find(filter)
      .populate("courseId", "title thumbnail")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Get My Reports Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your reports",
    });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!reportId || !reportId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Report ID is required",
      });
    }

    const isMongoId = mongoose.Types.ObjectId.isValid(reportId);
    const query = isMongoId ? { $or: [{ reportId }, { _id: reportId }] } : { reportId };

    const report = await Report.findOne(query)
      .populate("reportedBy", "name email profileImage")
      .populate("courseId", "title thumbnail");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const isAdmin = req.user.role === "Admin";
    const isOwner = report.reportedBy && (report.reportedBy._id || report.reportedBy).toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this report",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch report",
    });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const filter = {};

    if (status && status !== "All" && VALID_REPORT_STATUSES.includes(status)) {
      filter.status = status;
    }

    if (type && type !== "All" && VALID_REPORT_TYPES.includes(type)) {
      filter.type = type;
    }

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { reportId: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const reports = await Report.find(filter)
      .populate("reportedBy", "name email profileImage")
      .populate("courseId", "title thumbnail")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Get All Reports Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!VALID_REPORT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status",
      });
    }

    const isMongoId = mongoose.Types.ObjectId.isValid(reportId);
    const query = isMongoId ? { $or: [{ reportId }, { _id: reportId }] } : { reportId };

    const report = await Report.findOneAndUpdate(
      query,
      { status },
      { returnDocument: "after" }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      report,
    });
  } catch (error) {
    console.error("Update Report Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update report status",
    });
  }
};

export const replyToReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply is required",
      });
    }

    const isMongoId = mongoose.Types.ObjectId.isValid(reportId);
    const query = isMongoId ? { $or: [{ reportId }, { _id: reportId }] } : { reportId };

    const report = await Report.findOneAndUpdate(
      query,
      { reply: reply.trim() },
      { returnDocument: "after" }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      report,
    });
  } catch (error) {
    console.error("Reply To Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reply to report",
    });
  }
};