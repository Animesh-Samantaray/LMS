import { generateChatResponse } from "../Services/chatbot.service.js";
import ChatbotLog from "../Models/ChatbotLog.model.js";
import User from "../Models/User.model.js";

// handle chat message
export const handleChatMessage = async (req, res) => {
  try {
    const { message, messages } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required and must be a string",
      });
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    if (trimmedMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message exceeds the maximum allowed length of 2000 characters",
      });
    }

    const aiReply = await generateChatResponse(trimmedMessage, messages);

    if (req.user) {
      try {
        const dbUser = await User.findById(req.user.id || req.user._id).select("name email role");
        await ChatbotLog.create({
          userId: req.user.id || req.user._id,
          userName: dbUser?.name || req.user.email || "User",
          userEmail: dbUser?.email || req.user.email || "",
          userRole: dbUser?.role || req.user.role || "Student",
          question: trimmedMessage,
          response: aiReply || "",
        });
      } catch (logErr) {
        console.error("Failed to save chatbot log:", logErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: aiReply,
    });
  } catch (error) {
    if (error.message === "GROQ_API_KEY_MISSING") {
      console.error("Chatbot Error: GROQ_API_KEY is not configured.");
      return res.status(500).json({
        success: false,
        message: "AI assistant is currently unavailable.",
      });
    }

    console.error("Chatbot Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get a response right now. Please try again.",
    });
  }
};

// get chatbot logs
export const getChatbotLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || "").trim();

    const query = {};
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { question: { $regex: search, $options: "i" } },
      ];
    }

    const total = await ChatbotLog.countDocuments(query);
    const logs = await ChatbotLog.find(query)
      .populate("userId", "name email role profileImage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalQuestions = await ChatbotLog.countDocuments();
    const distinctUsers = await ChatbotLog.distinct("userId");

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayQuestions = await ChatbotLog.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    return res.status(200).json({
      success: true,
      logs,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      stats: {
        totalQuestions,
        uniqueUsers: distinctUsers.length,
        todayQuestions,
      },
    });
  } catch (error) {
    console.error("Get Chatbot Logs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve chatbot logs",
    });
  }
};

// delete chatbot log
export const deleteChatbotLog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ChatbotLog.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Chat log not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Chat log deleted successfully",
    });
  } catch (error) {
    console.error("Delete Chatbot Log Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete chat log",
    });
  }
};

// clear all chatbot logs
export const clearAllChatbotLogs = async (req, res) => {
  try {
    await ChatbotLog.deleteMany({});
    return res.status(200).json({
      success: true,
      message: "All chatbot logs have been cleared",
    });
  } catch (error) {
    console.error("Clear Chatbot Logs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear chatbot logs",
    });
  }
};
