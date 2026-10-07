import api from "./api.service";

export const sendChatMessage = async (message, messages = []) => {
  const response = await api.post("/api/chatbot/chat", {
    message,
    messages,
  });
  return response.data;
};
