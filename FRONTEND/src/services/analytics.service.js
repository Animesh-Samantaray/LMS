import api from "./api.service";

const analyticsService = {
  getStudentDashboardAnalytics: async (range = "30") => {
    const response = await api.get(`/api/analytics/student/dashboard?range=${range}`);
    return response.data;
  },

  getInstructorDashboardAnalytics: async (range = "30") => {
    const response = await api.get(`/api/analytics/instructor/dashboard?range=${range}`);
    return response.data;
  },

  getCourseAnalytics: async (courseId, range = "30") => {
    const response = await api.get(`/api/analytics/course/${courseId}?range=${range}`);
    return response.data;
  },

  getStudentAnalytics: async (studentId, range = "30") => {
    const response = await api.get(`/api/analytics/student/${studentId}?range=${range}`);
    return response.data;
  },
};

export default analyticsService;
