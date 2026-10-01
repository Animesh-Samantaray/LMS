
import mongoose from "mongoose";
import Discussion from "../Models/Discussion.model.js";
import Course from "../Models/course.model.js";

export const getCourseDiscussion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId).select(
      "createdBy enrolled"
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isAdmin = req.user.role === "Admin";
    const isCreator = course.createdBy.toString() === userId.toString();

    const discussion = await Discussion.findOne({
      courseId,
      isDeleted: false,
    })
      .populate("creatorId", "name profilePicture")
      .select("-members");

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const isMember = discussion.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (!isAdmin && !isCreator && !isMember) {
      return res.status(403).json({
        message: "You are not allowed to access this discussion",
      });
    }

    return res.status(200).json({
      message: "Discussion fetched successfully",
      discussion,
    });
  } catch (error) {
    console.error("Get course discussion error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(400).json({ message: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(discussionId);

    if (!discussion || discussion.isDeleted) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const isAdmin = req.user.role === "Admin";
    const isCreator = discussion.creatorId.toString() === userId.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        message: "Only the course creator or an admin can delete this discussion",
      });
    }

    discussion.isDeleted = true;
    discussion.deletedAt = new Date();
    discussion.deletedBy = userId;

    await discussion.save();

    return res.status(200).json({
      message: "Discussion deleted successfully",
    });
  } catch (error) {
    console.error("Delete discussion error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};