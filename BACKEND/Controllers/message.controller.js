import Message from "../Models/Message.model.js";
import Discussion from "../Models/Discussion.model.js";
import { getSocketIo } from "../Configs/socket.js";

const checkDiscussionAccess = async (discussionId, user) => {
  const discussion = await Discussion.findById(discussionId);

  if (!discussion || discussion.isDeleted) {
    return { allowed: false, discussion: null };
  }

  const isCreator =
    discussion.creatorId.toString() === user._id.toString();

  const isMember = discussion.members.some(
    (memberId) => memberId.toString() === user._id.toString()
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
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
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

    const message = await Message.create({
      discussionId,
      senderId: req.user._id,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name profileImage role");

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

export const getDiscussionMessages = async (req, res) => {
  try {
    const { discussionId } = req.params;

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

    const messages = await Message.find({ discussionId })
      .populate("senderId", "name profileImage role")
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