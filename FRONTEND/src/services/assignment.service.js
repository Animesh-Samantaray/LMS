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


export const submitAssignment = async (assignmentId, formData) => {
  const response = await api.post(`/api/assignment/${assignmentId}/submit`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMySubmission = async (assignmentId) => {
  const response = await api.get(`/api/assignment/${assignmentId}/my-submission`);
  return response.data;
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const response = await api.get(`/api/assignment/${assignmentId}/submissions`);
  return response.data;
};

export const evaluateSubmission = async (submissionId, marks, feedback) => {
  const response = await api.patch(`/api/assignment/submissions/${submissionId}/evaluate`, { marks, feedback });
  return response.data;
};

export default {
  getCourseAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  publishAssignment,
  deleteAssignment,
  submitAssignment,
  getMySubmission,
  getAssignmentSubmissions,
  evaluateSubmission,
};
