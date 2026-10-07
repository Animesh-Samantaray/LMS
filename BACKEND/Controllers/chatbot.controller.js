import { generateChatResponse } from "../Services/chatbot.service.js";

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
