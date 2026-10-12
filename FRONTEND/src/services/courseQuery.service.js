import api from './api.service';

const courseQueryService = {
  createQuery: async (payload) => {
    const res = await api.post('/api/course-queries', payload);
    return res.data;
  },

  getMyQueries: async () => {
    const res = await api.get('/api/course-queries/my-queries');
    return res.data;
  },

  getCourseQueries: async (courseId) => {
    const res = await api.get(`/api/course-queries/course/${courseId}`);
    return res.data;
  },

  getQueryById: async (queryId) => {
    const res = await api.get(`/api/course-queries/${queryId}`);
    return res.data;
  },

  replyToQuery: async (queryId, message) => {
    const res = await api.post(`/api/course-queries/${queryId}/replies`, { message });
    return res.data;
  },

  updateQueryStatus: async (queryId, status) => {
    const res = await api.patch(`/api/course-queries/${queryId}/status`, { status });
    return res.data;
  },

  getAllQueries: async () => {
    const res = await api.get('/api/course-queries/admin/all');
    return res.data;
  },

  getQueryStats: async () => {
    const res = await api.get('/api/course-queries/admin/stats');
    return res.data;
  },
};

export default courseQueryService;
