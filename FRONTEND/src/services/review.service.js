import api from "./api.service";

export const getCourseReviews = async (courseId, page = 1, limit = 5) => {
  const response = await api.get(`/api/reviews/course/${courseId}`, {
    params: { page, limit },
  });
  return response.data;
};

export const getCourseReviewSummary = async (courseId) => {
  const response = await api.get(`/api/reviews/course/${courseId}/summary`);
  return response.data;
};

export const getMyCourseReview = async (courseId) => {
  const response = await api.get(`/api/reviews/course/${courseId}/mine`);
  return response.data;
};

export const createCourseReview = async (courseId, reviewData) => {
  const response = await api.post(`/api/reviews/course/${courseId}`, reviewData);
  return response.data;
};

export const updateCourseReview = async (reviewId, reviewData) => {
  const response = await api.put(`/api/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const deleteCourseReview = async (reviewId) => {
  const response = await api.delete(`/api/reviews/${reviewId}`);
  return response.data;
};

export default {
  getCourseReviews,
  getCourseReviewSummary,
  getMyCourseReview,
  createCourseReview,
  updateCourseReview,
  deleteCourseReview,
};
