import api from "./api.service";

export const sendChatMessage = async (message, messages = []) => {
  const response = await api.post("/api/chatbot/chat", {
    message,
    messages,
  });
  return response.data;
};

export const getChatbotLogs = async (params = {}) => {
  const response = await api.get("/api/chatbot/logs", { params });
  return response.data;
};

export const deleteChatbotLog = async (id) => {
  const response = await api.delete(`/api/chatbot/logs/${id}`);
  return response.data;
};

export const clearAllChatbotLogs = async () => {
  const response = await api.delete("/api/chatbot/logs");
  return response.data;
};

export default {
  sendChatMessage,
  getChatbotLogs,
  deleteChatbotLog,
  clearAllChatbotLogs,
};
