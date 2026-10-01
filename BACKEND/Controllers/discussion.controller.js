
import mongoose from "mongoose";
import Discussion from "../Models/Discussion.model.js";
import Course from "../Models/Course.model.js";
import User from "../Models/User.model.js";
import Message from "../Models/Message.model.js";

export const getMyDiscussions = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not identified" });
    }

    const isAdmin = req.user.role === "Admin";
    const isInstructor = req.user.role === "Instructor";

    let courses = [];

    if (isAdmin) {
      courses = await Course.find()
        .populate("createdBy", "name email profileImage role")
        .sort({ updatedAt: -1 });
    } else if (isInstructor) {
      courses = await Course.find({
        $or: [{ createdBy: userId }, { enrolled: userId }],
      })
        .populate("createdBy", "name email profileImage role")
        .sort({ updatedAt: -1 });
    } else {
      courses = await Course.find({
        enrolled: userId,
      })
        .populate("createdBy", "name email profileImage role")
        .sort({ updatedAt: -1 });
    }

    const discussionList = await Promise.all(
      courses.map(async (course) => {
        try {
          const courseCreatorId = course.createdBy?._id || course.createdBy || userId;

          let discussion = await Discussion.findOne({
            courseId: course._id,
            isDeleted: false,
          });

          if (!discussion) {
            const adminUsers = await User.find({ role: "Admin" }).select("_id");
            const initialMembers = [
              courseCreatorId,
              ...(course.enrolled || []),
              ...adminUsers.map((u) => u._id),
            ];
            const uniqueMembers = [
              ...new Set(initialMembers.filter(Boolean).map((id) => id.toString())),
            ];

            discussion = await Discussion.create({
              courseId: course._id,
              creatorId: courseCreatorId,
              members: uniqueMembers,
            });
          } else {
            const uIdStr = userId.toString();
            const creatorStr = courseCreatorId ? courseCreatorId.toString() : "";
            const isMember = discussion.members?.some((m) => m?.toString() === uIdStr);

            if (
              !isMember &&
              (isAdmin ||
                creatorStr === uIdStr ||
                course.enrolled?.some((e) => e?.toString() === uIdStr))
            ) {
              discussion.members = discussion.members || [];
              discussion.members.push(userId);
              await discussion.save();
            }
          }

          const lastMessage = await Message.findOne({
            discussionId: discussion._id,
          })
            .populate("senderId", "name profileImage role")
            .sort({ createdAt: -1 });

          return {
            _id: discussion._id,
            courseId: {
              _id: course._id,
              title: course.title || "Untitled Course",
              thumbnail: course.thumbnail || "",
              category: course.category || "",
              status: course.status || "draft",
              createdBy: course.createdBy,
              enrolledCount: course.enrolled?.length || 0,
            },
            creatorId: discussion.creatorId,
            memberCount: discussion.members?.length || 0,
            unreadCount: discussion.unreadCounts ? (discussion.unreadCounts.get(userId.toString()) || 0) : 0,
            lastMessage: lastMessage
              ? {
                  _id: lastMessage._id,
                  type: lastMessage.type,
                  content: lastMessage.content,
                  fileName: lastMessage.fileName,
                  createdAt: lastMessage.createdAt,
                  sender: lastMessage.senderId
                    ? {
                        _id: lastMessage.senderId._id,
                        name: lastMessage.senderId.name,
                        profileImage: lastMessage.senderId.profileImage,
                      }
                    : null,
                }
              : null,
            updatedAt: lastMessage ? lastMessage.createdAt : discussion.updatedAt,
          };
        } catch (innerErr) {
          console.error("Error processing discussion for course:", course?._id, innerErr);
          return null;
        }
      })
    );

    const validDiscussions = discussionList.filter(Boolean);
    validDiscussions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.status(200).json({
      success: true,
      data: validDiscussions,
    });
  } catch (error) {
    console.error("Get my discussions error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getCourseDiscussion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId).select(
      "title thumbnail category status createdBy enrolled"
    ).populate("createdBy", "name email profileImage role");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const isAdmin = req.user.role === "Admin";
    const isCreator = course.createdBy?._id?.toString() === userId.toString() || course.createdBy?.toString() === userId.toString();
    const isEnrolled = course.enrolled?.some(
      (e) => e.toString() === userId.toString()
    );

    if (!isAdmin && !isCreator && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this discussion",
      });
    }

    let discussion = await Discussion.findOne({
      courseId,
      isDeleted: false,
    }).populate("creatorId", "name profileImage role");

    if (!discussion) {
      const adminUsers = await User.find({ role: "Admin" });
      const initialMembers = [
        course.createdBy?._id || course.createdBy,
        ...(course.enrolled || []),
        ...adminUsers.map((u) => u._id),
      ];
      const uniqueMembers = [
        ...new Set(initialMembers.map((id) => id.toString())),
      ];

      discussion = await Discussion.create({
        courseId: course._id,
        creatorId: course.createdBy?._id || course.createdBy,
        members: uniqueMembers,
      });

      discussion = await Discussion.findById(discussion._id).populate(
        "creatorId",
        "name profileImage role"
      );
    } else {
      const uIdStr = userId.toString();
      if (!discussion.members.some((m) => m.toString() === uIdStr)) {
        discussion.members.push(userId);
      }
      if (discussion.unreadCounts && discussion.unreadCounts.get(uIdStr) > 0) {
        discussion.unreadCounts.set(uIdStr, 0);
      }
      await discussion.save();
    }

    return res.status(200).json({
      success: true,
      message: "Discussion fetched successfully",
      discussion: {
        _id: discussion._id,
        courseId: {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          category: course.category,
          status: course.status,
          createdBy: course.createdBy,
          enrolledCount: course.enrolled?.length || 0,
        },
        creatorId: discussion.creatorId,
        memberCount: discussion.members?.length || 0,
        createdAt: discussion.createdAt,
        updatedAt: discussion.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get course discussion error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user.id || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(400).json({ success: false, message: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(discussionId);

    if (!discussion || discussion.isDeleted) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    const isAdmin = req.user.role === "Admin";
    const isCreator = discussion.creatorId.toString() === userId.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only the course creator or an admin can delete this discussion",
      });
    }

    discussion.isDeleted = true;
    discussion.deletedAt = new Date();
    discussion.deletedBy = userId;

    await discussion.save();

    return res.status(200).json({
      success: true,
      message: "Discussion deleted successfully",
    });
  } catch (error) {
    console.error("Delete discussion error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
