import api from "./api.service";

export const getCourseAssignments = async (courseId) => {
  const response = await api.get(`/api/assignment/course/${courseId}`);
  return response.data;
};

export const getAssignmentById = async (assignmentId) => {
  const response = await api.get(`/api/assignment/${assignmentId}`);
  return response.data;
};

export const createAssignment = async (courseId, formData) => {
  const response = await api.post(`/api/assignment/course/${courseId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateAssignment = async (assignmentId, formData) => {
  const response = await api.put(`/api/assignment/${assignmentId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const publishAssignment = async (assignmentId) => {
  const response = await api.patch(`/api/assignment/${assignmentId}/publish`);
  return response.data;
};

export const deleteAssignment = async (assignmentId) => {
  const response = await api.delete(`/api/assignment/${assignmentId}`);
  return response.data;
};

export default {
  getCourseAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  publishAssignment,
  deleteAssignment,
};
