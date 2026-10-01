import Message from "../Models/Message.model.js";
import Discussion from "../Models/Discussion.model.js";
import Course from "../Models/Course.model.js";
import uploadToCloudinary from "../Utils/uploadToCloudinary.js";
import { getSocketIo } from "../Configs/socket.js";

const checkDiscussionAccess = async (discussionId, user) => {
  const discussion = await Discussion.findById(discussionId);

  if (!discussion || discussion.isDeleted) {
    return { allowed: false, discussion: null };
  }

  const uId = user._id ? user._id.toString() : user.id.toString();

  const isCreator = discussion.creatorId.toString() === uId;

  const isMember = discussion.members.some(
    (memberId) => memberId.toString() === uId
  );

  const isAdmin = user.role === "Admin";

  return {
    allowed: isCreator || isMember || isAdmin,
    discussion,
  };
};

export const sendMessage = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, type = "text", stickerId, fileUrl, fileName, fileSize, fileMimeType, parentMessageId } = req.body;

    const messageType = ["text", "sticker", "file"].includes(type) ? type : "text";

    if (messageType === "text" && (!content || !content.trim())) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    if (messageType === "sticker" && !stickerId) {
      return res.status(400).json({
        success: false,
        message: "Sticker is required",
      });
    }

    if (messageType === "file" && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "File URL is required",
      });
    }

    const { allowed, discussion } = await checkDiscussionAccess(
      discussionId,
      req.user
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this discussion",
      });
    }

    if (parentMessageId) {
      const parentMsg = await Message.findById(parentMessageId);
      if (!parentMsg || parentMsg.discussionId.toString() !== discussionId) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent message",
        });
      }
    }

    const message = await Message.create({
      discussionId,
      senderId: req.user._id || req.user.id,
      type: messageType,
      content: content ? content.trim() : "",
      stickerId: stickerId || "",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      fileSize: fileSize || 0,
      fileMimeType: fileMimeType || "",
      parentMessageId: parentMessageId || null,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name profileImage role")
      .populate({ path: "parentMessageId", select: "content type fileName stickerId senderId", populate: { path: "senderId", select: "name" } })
      .populate({ path: "parentMessageId", select: "content type fileName stickerId senderId", populate: { path: "senderId", select: "name" } });

    const io = getSocketIo();

    if (io) {
      io.to(`discussion:${discussionId}`).emit(
        "message:new",
        populatedMessage
      );
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadDiscussionFile = async (req, res) => {
  try {
    const { discussionId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload",
      });
    }

    const { allowed } = await checkDiscussionAccess(
      discussionId,
      req.user
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this discussion",
      });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: "lms/discussions",
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
    });

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileUrl: uploadResult.url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileMimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("Upload discussion file error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "File upload failed",
    });
  }
};

export const getDiscussionMessages = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const { allowed, discussion } = await checkDiscussionAccess(
      discussionId,
      req.user
    );

    if (discussion) {
      const uIdStr = (req.user._id || req.user.id).toString();
      if (discussion.unreadCounts && discussion.unreadCounts.get(uIdStr) > 0) {
        discussion.unreadCounts.set(uIdStr, 0);
        await discussion.save();
      }
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this discussion",
      });
    }

    const messages = await Message.find({ discussionId })
      .populate("senderId", "name profileImage role")
      .populate({ path: "parentMessageId", select: "content type fileName stickerId senderId", populate: { path: "senderId", select: "name" } })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const clearDiscussionMessages = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = (req.user.id || req.user._id).toString();

    const discussion = await Discussion.findById(discussionId);

    if (!discussion || discussion.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    const course = await Course.findById(discussion.courseId);

    const isAdmin = req.user.role === "Admin";
    const isCreator =
      discussion.creatorId.toString() === userId ||
      (course && course.createdBy.toString() === userId);

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only course creators or admins can clear discussion messages",
      });
    }

    await Message.deleteMany({ discussionId });

    const io = getSocketIo();
    if (io) {
      io.to(`discussion:${discussionId}`).emit("discussion:cleared", {
        discussionId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "All discussion messages have been cleared successfully",
    });
  } catch (error) {
    console.error("Clear discussion messages error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear discussion messages",
    });
  }
};
