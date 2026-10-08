import mongoose from "mongoose";
import Course from "../Models/Course.model.js";
import Discussion from "../Models/Discussion.model.js";
import User from "../Models/User.model.js";

export const createCourse = async (req, res) => {
  try {
    const { title, description = "", thumbnail = "", category } = req.body;

    if (!title || !title.trim() || !category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and category are required",
      });
    }

    const userId = req.user?._id || req.user?.id;

    const course = await Course.create({
      title: title.trim(),
      description: description ? description.trim() : "Course description",
      thumbnail: thumbnail ? thumbnail.trim() : "",
      category: category.trim(),
      createdBy: userId,
    });

    try {
      const adminUsers = await User.find({ role: "Admin" });
      const initialMembers = [userId, ...adminUsers.map((u) => u._id)];
      const uniqueMembers = [...new Set(initialMembers.filter(Boolean).map((id) => id.toString()))];

      await Discussion.findOneAndUpdate(
        { courseId: course._id },
        {
          $setOnInsert: {
            courseId: course._id,
            creatorId: userId,
            members: uniqueMembers,
          },
        },
        { upsert: true, returnDocument: "after" }
      );
    } catch (discErr) {
      console.warn("Discussion auto-creation warning:", discErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create Course Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create course",
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const { search, category, status, sort } = req.query;
    const filter = {};

    if (status && ["draft", "published", "archived"].includes(status)) {
      filter.status = status;
    } else {
      filter.status = "published";
    }

    if (category && category !== "All" && category.trim()) {
      filter.category = category.trim();
    }

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "title-asc") {
      sortOption = { title: 1 };
    } else if (sort === "title-desc") {
      sortOption = { title: -1 };
    }

    const courses = await Course.find(filter)
      .populate("createdBy", "name email profileImage role")
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Get Courses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(id).populate(
      "createdBy",
      "name email profileImage role"
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Get Course Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const filter = req.user?.role === "Admin" ? {} : { createdBy: req.user._id };

    if (status && ["draft", "published", "archived"].includes(status)) {
      filter.status = status;
    }

    if (category && category !== "All" && category.trim()) {
      filter.category = category.trim();
    }

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Get My Courses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your courses",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail, category, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isAdmin = req.user.role === "Admin";
    const isOwner =
      course.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this course",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Course title cannot be empty",
        });
      }
      course.title = title.trim();
    }
    if (description !== undefined) {
      course.description = description.trim();
    }
    if (thumbnail !== undefined) {
      course.thumbnail = thumbnail.trim();
    }
    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be empty",
        });
      }
      course.category = category.trim();
    }

    if (status !== undefined) {
      if (!["draft", "published", "archived"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course status",
        });
      }

      course.status = status;
    }

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Update Course Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isAdmin = req.user.role === "Admin";
    const isOwner =
      course.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this course",
      });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete Course Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

export const publishCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isAdmin = req.user.role === "Admin";
    const isOwner =
      course.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to publish this course",
      });
    }

    if (course.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Course is already published",
      });
    }

    course.status = "published";
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course published successfully",
      course,
    });
  } catch (error) {
    console.error("Publish Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to publish course",
    });
  }
};

export const enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Cannot enroll in an unpublished course",
      });
    }

    const userId = req.user._id || req.user.id;
    const alreadyEnrolled = course.enrolled.some(
      (e) => e.toString() === userId.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    course.enrolled.push(userId);
    await course.save();

    let discussion = await Discussion.findOne({
      courseId: course._id,
    });

    if (discussion) {
      if (!discussion.members.some((m) => m.toString() === userId.toString())) {
        discussion.members.push(userId);
        await discussion.save();
      }
    } else {
      const adminUsers = await User.find({ role: "Admin" });
      const initialMembers = [req.user._id, course.createdBy, ...adminUsers.map((u) => u._id)];
      const uniqueMembers = [...new Set(initialMembers.map((id) => id.toString()))];
      await Discussion.create({
        courseId: course._id,
        creatorId: course.createdBy,
        members: uniqueMembers,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Enrolled successfully",
      course,
    });
  } catch (error) {
    console.error("Enroll Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enroll in course",
    });
  }
};

export const getStudentEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const courses = await Course.find({
      enrolled: userId,
    })
      .populate("createdBy", "name email profileImage role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Get Enrolled Courses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses",
    });
  }
};