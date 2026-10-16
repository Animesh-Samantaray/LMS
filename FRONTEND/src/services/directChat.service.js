import api from './api.service';

export const directChatService = {
  getOrCreateDirectConversation: async (targetUserId) => {
    const res = await api.post('/api/direct-chat/get-or-create', { targetUserId });
    return res.data;
  },

  getMyDirectConversations: async () => {
    const res = await api.get('/api/direct-chat/my-conversations');
    return res.data;
  },

  getArchivedDirectConversations: async () => {
    const res = await api.get('/api/direct-chat/archived');
    return res.data;
  },

  archiveDirectConversation: async (conversationId) => {
    const res = await api.patch(`/api/direct-chat/${conversationId}/archive`);
    return res.data;
  },

  unarchiveDirectConversation: async (conversationId) => {
    const res = await api.patch(`/api/direct-chat/${conversationId}/unarchive`);
    return res.data;
  },

  getDirectMessages: async (conversationId) => {
    const res = await api.get(`/api/direct-chat/${conversationId}/messages`);
    return res.data;
  },

  sendDirectMessage: async (conversationId, { content, type = 'text', stickerId, fileUrl, fileName, fileSize, fileMimeType, parentMessageId }) => {
    const res = await api.post(`/api/direct-chat/${conversationId}/messages`, {
      content,
      type,
      stickerId,
      fileUrl,
      fileName,
      fileSize,
      fileMimeType,
      parentMessageId,
    });
    return res.data;
  },

  uploadDirectFile: async (conversationId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post(`/api/direct-chat/${conversationId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  toggleDirectReaction: async (conversationId, messageId, emoji) => {
    const res = await api.post(`/api/direct-chat/${conversationId}/message/${messageId}/react`, { emoji });
    return res.data;
  },

  deleteDirectMessage: async (conversationId, messageId, deleteType = 'everyone') => {
    const res = await api.delete(`/api/direct-chat/${conversationId}/message/${messageId}`, {
      params: { deleteType },
    });
    return res.data;
  },
};

export default directChatService;
