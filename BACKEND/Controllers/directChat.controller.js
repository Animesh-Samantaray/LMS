import mongoose from "mongoose";
import DirectConversation from "../Models/DirectConversation.model.js";
import DirectMessage from "../Models/DirectMessage.model.js";
import User from "../Models/User.model.js";
import uploadToCloudinary from "../Utils/uploadToCloudinary.js";
import { getSocketIo } from "../Configs/socket.js";

const getUserId = (user) => {
  if (!user) return null;
  return (user._id || user.id)?.toString();
};

const checkDirectAccess = async (conversationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return { allowed: false, conversation: null };
  }

  const conversation = await DirectConversation.findById(conversationId)
    .select("participants")
    .lean();
  if (!conversation) {
    return { allowed: false, conversation: null };
  }

  const uId = userId.toString();
  const isParticipant = conversation.participants?.some(
    (p) => p.toString() === uId
  );

  return {
    allowed: isParticipant,
    conversation,
  };
};

export const getOrCreateDirectConversation = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const { targetUserId } = req.body;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "User not identified" });
    }

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ success: false, message: "Invalid target user ID" });
    }

    if (currentUserId === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a direct chat with yourself",
      });
    }

    const targetUser = await User.findById(targetUserId).select(
      "name email role profileImage accountStatus"
    ).lean();

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const sortedIds = [currentUserId, targetUserId.toString()].sort();
    const pairKey = `${sortedIds[0]}_${sortedIds[1]}`;

    let conversation = await DirectConversation.findOne({ pairKey })
      .populate("participants", "name email role profileImage")
      .lean();

    if (!conversation) {
      const created = await DirectConversation.create({
        pairKey,
        participants: [
          new mongoose.Types.ObjectId(sortedIds[0]),
          new mongoose.Types.ObjectId(sortedIds[1]),
        ],
        unreadCounts: new Map(),
      });

      conversation = await DirectConversation.findById(created._id)
        .populate("participants", "name email role profileImage")
        .lean();
    }

    return res.status(200).json({
      success: true,
      message: "Direct conversation retrieved successfully",
      conversation,
    });
  } catch (error) {
    console.error("getOrCreateDirectConversation error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getDirectMessages = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const { conversationId } = req.params;

    const { allowed, conversation } = await checkDirectAccess(
      conversationId,
      currentUserId
    );

    if (!allowed || !conversation) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this direct conversation",
      });
    }

    const uIdStr = currentUserId.toString();
    DirectConversation.updateOne(
      { _id: conversationId, [`unreadCounts.${uIdStr}`]: { $gt: 0 } },
      { $set: { [`unreadCounts.${uIdStr}`]: 0 } }
    ).catch(() => {});

    const messages = await DirectMessage.find({
      conversationId,
      deletedFor: { $ne: currentUserId },
    })
      .populate("senderId", "name email role profileImage")
      .populate({
        path: "parentMessageId",
        select: "content type fileName stickerId senderId isDeletedForEveryone",
        populate: { path: "senderId", select: "name" },
      })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("getDirectMessages error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const sendDirectMessage = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const { conversationId } = req.params;
    const {
      content,
      type = "text",
      stickerId,
      fileUrl,
      fileName,
      fileSize,
      fileMimeType,
      parentMessageId,
    } = req.body;

    const { allowed, conversation } = await checkDirectAccess(
      conversationId,
      currentUserId
    );

    if (!allowed || !conversation) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to send messages in this direct conversation",
      });
    }

    const messageType = ["text", "sticker", "file"].includes(type) ? type : "text";

    if (messageType === "text" && (!content || !content.trim())) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty" });
    }

    if (messageType === "file" && !fileUrl) {
      return res.status(400).json({ success: false, message: "File URL is required" });
    }

    if (parentMessageId) {
      const parent = await DirectMessage.findById(parentMessageId).select("conversationId").lean();
      if (!parent || parent.conversationId.toString() !== conversationId) {
        return res.status(400).json({ success: false, message: "Invalid parent message" });
      }
    }

    const message = await DirectMessage.create({
      conversationId,
      senderId: currentUserId,
      type: messageType,
      content: content ? content.trim() : "",
      stickerId: stickerId || "",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      fileSize: fileSize || 0,
      fileMimeType: fileMimeType || "",
      parentMessageId: parentMessageId || null,
    });

    const senderObj = {
      _id: req.userDoc?._id || currentUserId,
      name: req.userDoc?.name || req.user?.name || "User",
      email: req.userDoc?.email || req.user?.email || "",
      role: req.userDoc?.role || req.user?.role || "Student",
      profileImage: req.userDoc?.profileImage || "",
    };

    let responseData = message.toObject();
    responseData.senderId = senderObj;

    if (parentMessageId) {
      await message.populate({
        path: "parentMessageId",
        select: "content type fileName stickerId senderId",
        populate: { path: "senderId", select: "name" },
      });
      responseData = message.toObject();
      responseData.senderId = senderObj;
    }

    const otherParticipantId = conversation.participants?.find(
      (p) => p && p.toString() !== currentUserId.toString()
    );

    const lastMsgData = {
      content:
        messageType === "file"
          ? `📎 ${fileName || "Attachment"}`
          : messageType === "sticker"
          ? "🎨 [Sticker]"
          : content ? content.trim() : "",
      senderId: currentUserId,
      type: messageType,
      fileName: fileName || "",
      createdAt: new Date(),
    };

    const updateOps = {
      $set: { lastMessage: lastMsgData },
    };
    if (otherParticipantId) {
      updateOps.$inc = { [`unreadCounts.${otherParticipantId.toString()}`]: 1 };
    }

    DirectConversation.updateOne({ _id: conversationId }, updateOps).catch(() => {});

    const io = getSocketIo();
    if (io) {
      io.to(`direct:${conversationId}`).emit("direct:message:new", responseData);

      if (otherParticipantId) {
        io.to(`user:${otherParticipantId.toString()}`).emit("direct:notification", {
          conversationId,
          message: responseData,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Direct message sent successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("sendDirectMessage error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const uploadDirectFile = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const { conversationId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select a file to upload" });
    }

    const { allowed } = await checkDirectAccess(conversationId, currentUserId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this conversation",
      });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: "lms/direct-chats",
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
    console.error("uploadDirectFile error:", error);
    return res.status(500).json({ success: false, message: error.message || "Upload failed" });
  }
};

export const getMyDirectConversations = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "User not identified" });
    }

    const conversations = await DirectConversation.find({
      participants: currentUserId,
    })
      .populate("participants", "name email role profileImage")
      .populate("lastMessage.senderId", "name profileImage")
      .sort({ updatedAt: -1 })
      .lean();

    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants?.find(
        (p) => p && p._id.toString() !== currentUserId.toString()
      );
      const unreadCount = conv.unreadCounts
        ? (conv.unreadCounts instanceof Map ? conv.unreadCounts.get(currentUserId.toString()) : conv.unreadCounts[currentUserId.toString()]) || 0
        : 0;

      return {
        _id: conv._id,
        otherParticipant: otherParticipant || null,
        lastMessage: conv.lastMessage || null,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("getMyDirectConversations error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const toggleDirectReaction = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const { conversationId, messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ success: false, message: "Emoji is required" });
    }

    const { allowed } = await checkDirectAccess(conversationId, currentUserId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const message = await DirectMessage.findById(messageId);
    if (!message || message.conversationId.toString() !== conversationId) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const uId = currentUserId.toString();
    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === uId
    );

    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ userId: currentUserId, emoji });
    }

    await message.save();

    const populated = await DirectMessage.findById(message._id)
      .populate("senderId", "name email role profileImage")
      .populate({
        path: "parentMessageId",
        select: "content type fileName stickerId senderId",
        populate: { path: "senderId", select: "name" },
      });

    const io = getSocketIo();
    if (io) {
      io.to(`direct:${conversationId}`).emit("direct:message:reaction", populated);
    }

    return res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error("toggleDirectReaction error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const deleteDirectMessage = async (req, res) => {
  try {
    const currentUserId = getUserId(req.user);
    const { conversationId, messageId } = req.params;
    const deleteType = (req.query.deleteType || req.body?.deleteType || "me").toLowerCase();

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "User not identified" });
    }

    const { allowed, conversation } = await checkDirectAccess(conversationId, currentUserId);
    if (!allowed || !conversation) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this direct conversation",
      });
    }

    const message = await DirectMessage.findById(messageId);
    if (!message || message.conversationId.toString() !== conversationId) {
      return res.status(404).json({ success: false, message: "Direct message not found" });
    }

    if (deleteType === "me") {
      // Delete for Me: Only hides the message from the current user
      await DirectMessage.findByIdAndUpdate(messageId, {
        $addToSet: { deletedFor: currentUserId },
      });

      return res.status(200).json({
        success: true,
        message: "Message deleted for you",
        data: { messageId, deleteType: "me" },
      });
    }

    // Delete for Everyone: Must be original sender in 1-on-1 chat
    if (message.senderId.toString() !== currentUserId.toString()) {
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

    // Check if conversation last message needs update
    if (
      conversation.lastMessage &&
      conversation.lastMessage.createdAt &&
      new Date(conversation.lastMessage.createdAt).getTime() === new Date(message.createdAt).getTime()
    ) {
      await DirectConversation.updateOne(
        { _id: conversationId },
        { $set: { "lastMessage.content": "This message was deleted", "lastMessage.type": "text" } }
      );
    }

    const io = getSocketIo();
    if (io) {
      io.to(`direct:${conversationId}`).emit("direct:message:deletedForEveryone", {
        conversationId,
        messageId,
        deletedAt: message.deletedAt,
      });
      io.to(`direct:${conversationId}`).emit("direct:message:deleted", {
        conversationId,
        messageId,
        isDeletedForEveryone: true,
      });

      const otherParticipantId = conversation.participants?.find(
        (p) => p && p.toString() !== currentUserId.toString()
      );
      if (otherParticipantId) {
        io.to(`user:${otherParticipantId.toString()}`).emit("direct:message:deletedForEveryone", {
          conversationId,
          messageId,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted for everyone",
      data: { messageId, deleteType: "everyone" },
    });
  } catch (error) {
    console.error("deleteDirectMessage error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

