import api from './api.service';

export const discussionService = {
  getMyDiscussions: async () => {
    const res = await api.get('/api/discussions/my');
    return res.data;
  },

  getCourseDiscussion: async (courseId) => {
    const res = await api.get(`/api/discussions/course/${courseId}`);
    return res.data;
  },

  getDiscussionMessages: async (discussionId) => {
    const res = await api.get(`/api/messages/discussion/${discussionId}`);
    return res.data;
  },

  sendMessage: async (discussionId, { content, type = 'text', stickerId, fileUrl, fileName, fileSize, fileMimeType, parentMessageId }) => {
    const res = await api.post(`/api/messages/discussion/${discussionId}`, {
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

  deleteMessage: async (discussionId, messageId) => {
    const res = await api.delete(`/api/messages/discussion/${discussionId}/message/${messageId}`);
    return res.data;
  },

  toggleReaction: async (discussionId, messageId, emoji) => {
    const res = await api.post(`/api/messages/discussion/${discussionId}/message/${messageId}/react`, { emoji });
    return res.data;
  },

  uploadFile: async (discussionId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post(`/api/messages/discussion/${discussionId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  clearDiscussionMessages: async (discussionId) => {
    const res = await api.delete(`/api/messages/discussion/${discussionId}/clear`);
    return res.data;
  },
};

export default discussionService;
