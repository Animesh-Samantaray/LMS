import mongoose from "mongoose";
import Message from "../Models/Message.model.js";
import Discussion from "../Models/Discussion.model.js";
import Course from "../Models/Course.model.js";
import DirectConversation from "../Models/DirectConversation.model.js";
import DirectMessage from "../Models/DirectMessage.model.js";
import User from "../Models/User.model.js";
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

// send chat message
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
      .populate({ path: "parentMessageId", select: "content type fileName stickerId senderId", populate: { path: "senderId", select: "name" } });

  
    if (discussion) {
      const uIdStr = (req.user._id || req.user.id).toString();
      
      if (!discussion.unreadCounts) {
        discussion.unreadCounts = new Map();
      }

      const memberIds = discussion.members || [];
      const creatorId = discussion.creatorId;
      
      const allMembers = new Set([
        ...memberIds.map(id => id.toString()),
        creatorId ? creatorId.toString() : null
      ].filter(Boolean));

      allMembers.forEach((memberIdStr) => {
        if (memberIdStr !== uIdStr) {
          const currentCount = discussion.unreadCounts.get(memberIdStr) || 0;
          discussion.unreadCounts.set(memberIdStr, currentCount + 1);
        }
      });

      await discussion.save();
    }

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

// upload discussion file
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

// get discussion messages
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

    const currentUserId = req.user._id || req.user.id;
    const messages = await Message.find({
      discussionId,
      deletedFor: { $ne: currentUserId },
    })
      .populate("senderId", "name profileImage role")
      .populate({
        path: "parentMessageId",
        select: "content type fileName stickerId senderId isDeletedForEveryone",
        populate: { path: "senderId", select: "name" },
      })
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

// clear discussion messages
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


// toggle reaction
export const toggleReaction = async (req, res) => {
  try {
    const { discussionId, messageId } = req.params;
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({ success: false, message: "Emoji is required" });
    }

    const { allowed, discussion } = await checkDiscussionAccess(discussionId, req.user);
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const message = await Message.findById(messageId);
    if (!message || message.discussionId.toString() !== discussionId) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const userId = (req.user._id || req.user.id).toString();
    // Find any existing reaction from this user on this message
    const existingUserReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingUserReactionIndex > -1) {
      // If they clicked the exact same emoji they already had, remove it (toggle off)
      if (message.reactions[existingUserReactionIndex].emoji === emoji) {
        message.reactions.splice(existingUserReactionIndex, 1);
      } else {
        // If they clicked a different emoji, replace their old reaction
        message.reactions[existingUserReactionIndex].emoji = emoji;
      }
    } else {
      // No previous reaction, add the new one
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name profileImage role")
      .populate({ path: "parentMessageId", select: "content type fileName stickerId senderId", populate: { path: "senderId", select: "name" } });

    const io = getSocketIo();
    if (io) {
      io.to(`discussion:${discussionId}`).emit("message:reaction", populatedMessage);
    }

    return res.status(200).json({ success: true, message: "Reaction toggled", data: populatedMessage });
  } catch (error) {
    console.error("Toggle reaction error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// delete message (Delete for Me or Delete for Everyone)
export const deleteMessage = async (req, res) => {
  try {
    const { discussionId, messageId } = req.params;
    const deleteType = (req.query.deleteType || req.body?.deleteType || "me").toLowerCase();

    const { allowed, discussion } = await checkDiscussionAccess(discussionId, req.user);
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Unauthorized to access this discussion" });
    }

    const message = await Message.findById(messageId);
    if (!message || message.discussionId.toString() !== discussionId) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const userId = (req.user._id || req.user.id).toString();

    if (deleteType === "me") {
      // Delete for Me: Only hides the message from the current user
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { deletedFor: userId },
      });

      return res.status(200).json({
        success: true,
        message: "Message deleted for you",
        data: { messageId, deleteType: "me" },
      });
    }

    // Delete for Everyone: Check permissions (Sender, Admin, or Discussion Creator)
    const isSender = message.senderId.toString() === userId;
    const isAdmin = req.user.role === "Admin";
    const isCreator = discussion.creatorId && discussion.creatorId.toString() === userId;

    if (!isSender && !isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages for everyone",
      });
    }

    message.isDeletedForEveryone = true;
    message.deletedAt = new Date();
    message.content = "This message was deleted";
    message.fileUrl = "";
    message.fileName = "";
    message.fileSize = 0;
    message.fileMimeType = "";
    message.stickerId = "";
    message.reactions = [];

    await message.save();

    const io = getSocketIo();
    if (io) {
      io.to(`discussion:${discussionId}`).emit("message:deletedForEveryone", {
        discussionId,
        messageId,
        deletedAt: message.deletedAt,
      });
      io.to(`discussion:${discussionId}`).emit("message:deleted", {
        discussionId,
        messageId,
        isDeletedForEveryone: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted for everyone",
      data: { messageId, deleteType: "everyone" },
    });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// forward message (between course discussions and direct chats)
export const forwardMessage = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const {
      sourceType = "discussion", // "discussion" | "direct"
      sourceMessageId,
      targetDiscussionIds = [],
      targetConversationIds = [],
      targetUserIds = [],
    } = req.body;

    if (!sourceMessageId) {
      return res.status(400).json({ success: false, message: "Source message ID is required" });
    }

    if (
      (!targetDiscussionIds || targetDiscussionIds.length === 0) &&
      (!targetConversationIds || targetConversationIds.length === 0) &&
      (!targetUserIds || targetUserIds.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one recipient or course group to forward to",
      });
    }

    // 1. Fetch source message and verify access
    let sourceMessage = null;
    if (sourceType === "discussion") {
      sourceMessage = await Message.findById(sourceMessageId);
      if (!sourceMessage) {
        return res.status(404).json({ success: false, message: "Source message not found" });
      }
      const { allowed } = await checkDiscussionAccess(sourceMessage.discussionId, req.user);
      if (!allowed) {
        return res.status(403).json({ success: false, message: "Unauthorized to access source message" });
      }
    } else {
      sourceMessage = await DirectMessage.findById(sourceMessageId);
      if (!sourceMessage) {
        return res.status(404).json({ success: false, message: "Source message not found" });
      }
      const conversation = await DirectConversation.findById(sourceMessage.conversationId);
      if (!conversation || !conversation.participants.some((p) => p && p.toString() === userId)) {
        return res.status(403).json({ success: false, message: "Unauthorized to access source message" });
      }
    }

    if (sourceMessage.isDeletedForEveryone) {
      return res.status(400).json({ success: false, message: "Cannot forward a deleted message" });
    }

    const io = getSocketIo();
    const results = {
      discussions: [],
      directChats: [],
    };

    const payload = {
      type: sourceMessage.type || "text",
      content: sourceMessage.content || "",
      fileUrl: sourceMessage.fileUrl || "",
      fileName: sourceMessage.fileName || "",
      fileSize: sourceMessage.fileSize || 0,
      fileMimeType: sourceMessage.fileMimeType || "",
      stickerId: sourceMessage.stickerId || "",
      isForwarded: true,
    };

    // 2. Forward to target course discussions
    for (const discId of targetDiscussionIds) {
      try {
        const { allowed, discussion } = await checkDiscussionAccess(discId, req.user);
        if (!allowed || !discussion) continue;

        const newMsg = await Message.create({
          discussionId: discId,
          senderId: userId,
          ...payload,
        });

        const populated = await Message.findById(newMsg._id)
          .populate("senderId", "name profileImage role");

        if (discussion.unreadCounts) {
          const allMembers = new Set([
            ...(discussion.members || []).map((id) => id.toString()),
            discussion.creatorId ? discussion.creatorId.toString() : null,
          ].filter(Boolean));

          allMembers.forEach((memberIdStr) => {
            if (memberIdStr !== userId) {
              const currentCount = discussion.unreadCounts.get(memberIdStr) || 0;
              discussion.unreadCounts.set(memberIdStr, currentCount + 1);
            }
          });
          await discussion.save();
        }

        if (io) {
          io.to(`discussion:${discId}`).emit("message:new", populated);
        }

        results.discussions.push({ discussionId: discId, message: populated });
      } catch (err) {
        console.error("Error forwarding to discussion:", discId, err);
      }
    }

    // 3. Resolve any targetUserIds into direct conversation IDs
    const allDirectConvIds = new Set(targetConversationIds.map((id) => id.toString()));

    for (const tUserId of targetUserIds) {
      if (!tUserId || tUserId.toString() === userId) continue;
      const sortedIds = [userId, tUserId.toString()].sort();
      const pairKey = `${sortedIds[0]}_${sortedIds[1]}`;
      let conv = await DirectConversation.findOne({ pairKey });
      if (!conv) {
        conv = await DirectConversation.create({
          pairKey,
          participants: [
            new mongoose.Types.ObjectId(sortedIds[0]),
            new mongoose.Types.ObjectId(sortedIds[1]),
          ],
          unreadCounts: new Map(),
        });
      }
      if (conv) {
        allDirectConvIds.add(conv._id.toString());
      }
    }

    // 4. Forward to direct conversations
    for (const convId of allDirectConvIds) {
      try {
        const conversation = await DirectConversation.findById(convId);
        if (
          !conversation ||
          !conversation.participants.some((p) => p && p.toString() === userId)
        ) {
          continue;
        }

        const newMsg = await DirectMessage.create({
          conversationId: convId,
          senderId: userId,
          ...payload,
        });

        const otherParticipantId = conversation.participants.find(
          (p) => p && p.toString() !== userId
        );

        const senderDoc = await User.findById(userId)
          .select("name email role profileImage")
          .lean();

        const senderObj = {
          _id: userId,
          name: senderDoc?.name || req.user?.name || "User",
          email: senderDoc?.email || req.user?.email || "",
          role: senderDoc?.role || req.user?.role || "Student",
          profileImage: senderDoc?.profileImage || "",
        };

        const responseData = newMsg.toObject();
        responseData.senderId = senderObj;

        const lastMsgData = {
          content:
            payload.type === "file"
              ? `📎 ${payload.fileName || "Attachment"}`
              : payload.type === "sticker"
              ? "🎨 [Sticker]"
              : payload.content,
          senderId: userId,
          type: payload.type,
          fileName: payload.fileName || "",
          createdAt: new Date(),
        };

        const updateOps = {
          $set: { lastMessage: lastMsgData },
        };
        if (otherParticipantId) {
          updateOps.$inc = { [`unreadCounts.${otherParticipantId.toString()}`]: 1 };
        }

        await DirectConversation.updateOne({ _id: convId }, updateOps);

        if (io) {
          io.to(`direct:${convId}`).emit("direct:message:new", responseData);
          if (otherParticipantId) {
            io.to(`user:${otherParticipantId.toString()}`).emit("direct:notification", {
              conversationId: convId,
              message: responseData,
            });
          }
        }

        results.directChats.push({ conversationId: convId, message: responseData });
      } catch (err) {
        console.error("Error forwarding to direct chat:", convId, err);
      }
    }

    const totalForwarded = results.discussions.length + results.directChats.length;
    return res.status(200).json({
      success: true,
      message: `Message forwarded successfully to ${totalForwarded} destination(s)`,
      data: results,
    });
  } catch (error) {
    console.error("forwardMessage error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

