import mongoose from "mongoose";
import Resource from "../Models/Resource.model.js";
import Lesson from "../Models/Lesson.model.js";
import Unit from "../Models/Unit.model.js";
import Course from "../Models/course.model.js";
import uploadToCloudinary from "../Utils/uploadToCloudinary.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const canManageLesson = async (lessonId, user) => {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    return {
      allowed: false,
      status: 404,
      message: "Lesson not found",
    };
  }

  const unit = await Unit.findById(lesson.unitId);

  if (!unit) {
    return {
      allowed: false,
      status: 404,
      message: "Unit not found",
    };
  }

  const course = await Course.findById(unit.courseId);

  if (!course) {
    return {
      allowed: false,
      status: 404,
      message: "Course not found",
    };
  }

  if (
    user.role !== "Admin" &&
    course.createdBy.toString() !== user._id.toString()
  ) {
    return {
      allowed: false,
      status: 403,
      message: "You are not allowed to manage this resource",
    };
  }

  return {
    allowed: true,
    lesson,
    unit,
    course,
  };
};


const determineResourceTypeFromMime = (mimeType = "", fallbackType = "Other") => {
  if (!mimeType) return fallbackType || "Other";

  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("image/")) return "Image";
  if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "Document";
  }
  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "Spreadsheet";
  }
  if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return "Presentation";
  }
  if (mimeType === "text/plain") return "Text";
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-zip-compressed"
  ) {
    return "ZIP";
  }

  return fallbackType || "Other";
};

export const createResource = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description, type, url, order } = req.body;
    const file = req.file;

    if (!isValidObjectId(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!file && (!url || !url.trim())) {
      return res.status(400).json({
        success: false,
        message: "Either a file upload or an external URL is required",
      });
    }

    const access = await canManageLesson(lessonId, req.user);

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    let finalUrl = url ? url.trim() : "";
    let publicId = "";
    let originalName = "";
    let fileSize = 0;
    let mimeType = "";
    let source = "external";
    let finalType = type || "Link";

    if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer, {
        folder: "LMS/resources",
        mimeType: file.mimetype,
        originalName: file.originalname,
      });

      finalUrl = uploadResult.url;
      publicId = uploadResult.publicId;
      originalName = file.originalname;
      fileSize = file.size;
      mimeType = file.mimetype;
      source = "upload";
      finalType = determineResourceTypeFromMime(file.mimetype, type);
    }

    const resource = await Resource.create({
      lessonId,
      title: title.trim(),
      description: description ? description.trim() : "",
      type: finalType,
      url: finalUrl,
      publicId,
      originalName,
      fileSize,
      mimeType,
      source,
      order: order !== undefined && order !== "" ? Number(order) : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Resource created successfully",
      resource,
    });
  } catch (error) {
    console.error("Create Resource Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create resource",
    });
  }
};


export const getLessonResources = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!isValidObjectId(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const resources = await Resource.find({ lessonId }).sort({
      order: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error("Get Lesson Resources Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resources",
    });
  }
};


export const getResourceById = async (req, res) => {
  try {
    const { resourceId } = req.params;

    if (!isValidObjectId(resourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID",
      });
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    console.error("Get Resource Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resource",
    });
  }
};


export const updateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { title, description, type, url, order } = req.body;
    const file = req.file;

    if (!isValidObjectId(resourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID",
      });
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const access = await canManageLesson(resource.lessonId, req.user);

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    if (title !== undefined) resource.title = title.trim();
    if (description !== undefined) resource.description = description.trim();
    if (type !== undefined && type.trim() !== "") resource.type = type;
    if (order !== undefined && order !== "") resource.order = Number(order);

    if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer, {
        folder: "LMS/resources",
        mimeType: file.mimetype,
        originalName: file.originalname,
      });

      resource.url = uploadResult.url;
      resource.publicId = uploadResult.publicId;
      resource.originalName = file.originalname;
      resource.fileSize = file.size;
      resource.mimeType = file.mimetype;
      resource.source = "upload";
      resource.type = determineResourceTypeFromMime(file.mimetype, resource.type);
    } else if (url !== undefined && url.trim() !== "") {
      resource.url = url.trim();
      resource.source = "external";
    }

    await resource.save();

    return res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      resource,
    });
  } catch (error) {
    console.error("Update Resource Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update resource",
    });
  }
};


export const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    if (!isValidObjectId(resourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID",
      });
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const access = await canManageLesson(resource.lessonId, req.user);

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    await Resource.findByIdAndDelete(resourceId);

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Delete Resource Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete resource",
    });
  }
};


export const reorderResources = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { resources } = req.body;

    if (!isValidObjectId(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    if (!Array.isArray(resources)) {
      return res.status(400).json({
        success: false,
        message: "Resources must be an array",
      });
    }

    const access = await canManageLesson(lessonId, req.user);

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    for (let i = 0; i < resources.length; i++) {
      if (!isValidObjectId(resources[i])) {
        return res.status(400).json({
          success: false,
          message: "Invalid resource ID",
        });
      }

      await Resource.updateOne(
        {
          _id: resources[i],
          lessonId,
        },
        {
          $set: {
            order: i,
          },
        }
      );
    }

    const updatedResources = await Resource.find({ lessonId }).sort({
      order: 1,
    });

    return res.status(200).json({
      success: true,
      message: "Resources reordered successfully",
      resources: updatedResources,
    });
  } catch (error) {
    console.error("Reorder Resources Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reorder resources",
    });
  }
};