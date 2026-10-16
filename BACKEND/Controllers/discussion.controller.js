import mongoose from "mongoose";
import Discussion from "../Models/Discussion.model.js";
import Course from "../Models/Course.model.js";
import User from "../Models/User.model.js";
import Message from "../Models/Message.model.js";
import { getSocketIo } from "../Configs/socket.js";

// get my discussions
export const getMyDiscussions = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not identified" });
    }

    const { search } = req.query;
    const isAdmin = req.user.role === "Admin";
    const isInstructor = req.user.role === "Instructor";

    let courseFilter = {};

    if (isAdmin) {
      courseFilter = {};
    } else if (isInstructor) {
      courseFilter = {
        $or: [{ createdBy: userId }, { enrolled: userId }],
      };
    } else {
      courseFilter = {
        enrolled: userId,
      };
    }

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      courseFilter.$and = courseFilter.$and || [];
      courseFilter.$and.push({
        $or: [
          { title: { $regex: safeSearch, $options: "i" } },
          { category: { $regex: safeSearch, $options: "i" } },
        ],
      });
    }

    const courses = await Course.find(courseFilter)
      .populate("createdBy", "name email profileImage role")
      .sort({ updatedAt: -1 });

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
            deletedFor: { $ne: userId },
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
            isArchived: Boolean(
              discussion.archivedBy?.some((a) => a.user?.toString() === userId.toString())
            ),
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

// get course discussion
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

// delete discussion
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

// get discussion members
export const getDiscussionMembers = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(400).json({ success: false, message: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findOne({
      _id: discussionId,
      isDeleted: false,
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    const course = await Course.findById(discussion.courseId)
      .populate("createdBy", "name email profileImage role")
      .populate("enrolled", "name email profileImage role");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const currentUserIdStr = userId ? userId.toString() : "";
    const isAdmin = req.user?.role === "Admin";
    const courseCreatorId = course.createdBy?._id || course.createdBy;
    const isCreator = courseCreatorId ? courseCreatorId.toString() === currentUserIdStr : false;
    const isEnrolled = Array.isArray(course.enrolled) && course.enrolled.some(
      (e) => (e._id ? e._id.toString() : e.toString()) === currentUserIdStr
    );
    const isMember = Array.isArray(discussion.members) && discussion.members.some(
      (m) => m?.toString() === currentUserIdStr
    );

    if (!isAdmin && !isCreator && !isEnrolled && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view the members of this group.",
      });
    }

    // Collect all member IDs
    const memberIdSet = new Set();
    if (courseCreatorId) {
      memberIdSet.add(courseCreatorId.toString());
    }
    if (Array.isArray(course.enrolled)) {
      course.enrolled.forEach((e) => {
        const id = e?._id ? e._id.toString() : e?.toString();
        if (id) memberIdSet.add(id);
      });
    }
    if (Array.isArray(discussion.members)) {
      discussion.members.forEach((m) => {
        if (m) memberIdSet.add(m.toString());
      });
    }

    const memberIds = Array.from(memberIdSet).filter((id) => mongoose.Types.ObjectId.isValid(id));
    const users = await User.find({
      _id: { $in: memberIds },
    })
      .select("name email role profileImage createdAt")
      .lean();

    // Sync any newly discovered members into discussion.members
    const existingMemberStrings = new Set((discussion.members || []).map((m) => m.toString()));
    const missingMembers = memberIds.filter((id) => !existingMemberStrings.has(id));
    if (missingMembers.length > 0) {
      discussion.members = Array.from(new Set([...(discussion.members || []), ...missingMembers]));
      await discussion.save();
    }

    const members = users.map((u) => {
      const uIdStr = u._id.toString();
      const isOwner = courseCreatorId ? courseCreatorId.toString() === uIdStr : false;
      return {
        _id: u._id,
        name: u.name || "Member",
        email: u.email || "",
        role: u.role || (isOwner ? "Instructor" : "Student"),
        profileImage: u.profileImage || "",
        isCreator: isOwner,
        isCurrentUser: uIdStr === currentUserIdStr,
        joinedAt: u.createdAt,
      };
    });

    members.sort((a, b) => {
      if (a.isCreator && !b.isCreator) return -1;
      if (!a.isCreator && b.isCreator) return 1;

      const priority = { Instructor: 1, Admin: 2, Student: 3 };
      const aPri = priority[a.role] || 4;
      const bPri = priority[b.role] || 4;
      if (aPri !== bPri) return aPri - bPri;

      return (a.name || "").localeCompare(b.name || "");
    });

    return res.status(200).json({
      success: true,
      data: {
        discussionId: discussion._id,
        courseId: course._id,
        courseTitle: course.title || "Course Group",
        courseThumbnail: course.thumbnail || "",
        category: course.category || "",
        memberCount: members.length,
        members,
      },
    });
  } catch (error) {
    console.error("Get discussion members error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const archiveDiscussion = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { discussionId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not identified" });
    }

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(400).json({ success: false, message: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    const alreadyArchived = discussion.archivedBy?.some(
      (entry) => entry.user?.toString() === userId.toString()
    );

    if (!alreadyArchived) {
      discussion.archivedBy = discussion.archivedBy || [];
      discussion.archivedBy.push({
        user: userId,
        archivedAt: new Date(),
      });
      await discussion.save();
    }

    const io = getSocketIo();
    if (io) {
      io.to(`user:${userId}`).emit("discussion:archived", {
        discussionId,
        isArchived: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Group discussion archived successfully",
      data: { discussionId, isArchived: true },
    });
  } catch (error) {
    console.error("archiveDiscussion error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const unarchiveDiscussion = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { discussionId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not identified" });
    }

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(400).json({ success: false, message: "Invalid discussion ID" });
    }

    await Discussion.findByIdAndUpdate(discussionId, {
      $pull: {
        archivedBy: {
          user: userId,
        },
      },
    });

    const io = getSocketIo();
    if (io) {
      io.to(`user:${userId}`).emit("discussion:unarchived", {
        discussionId,
        isArchived: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Group discussion unarchived successfully",
      data: { discussionId, isArchived: false },
    });
  } catch (error) {
    console.error("unarchiveDiscussion error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};