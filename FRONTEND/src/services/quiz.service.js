import api from "./api.service";

export const getCourseQuizzes = async (courseId) => {
  const response = await api.get(`/api/quizzes/course/${courseId}`);
  return response.data;
};

export const getQuizById = async (quizId) => {
  const response = await api.get(`/api/quizzes/${quizId}`);
  return response.data;
};

export const createQuiz = async (courseId, quizData) => {
  const response = await api.post(`/api/quizzes/course/${courseId}`, quizData);
  return response.data;
};

export const updateQuiz = async (quizId, quizData) => {
  const response = await api.put(`/api/quizzes/${quizId}`, quizData);
  return response.data;
};

export const publishQuiz = async (quizId) => {
  const response = await api.patch(`/api/quizzes/${quizId}/publish`);
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await api.delete(`/api/quizzes/${quizId}`);
  return response.data;
};

export const createQuestion = async (quizId, questionData) => {
  const response = await api.post(`/api/quiz-questions/quiz/${quizId}`, questionData);
  return response.data;
};

export const getQuizQuestions = async (quizId) => {
  const response = await api.get(`/api/quiz-questions/quiz/${quizId}`);
  return response.data;
};

export const getQuestionById = async (questionId) => {
  const response = await api.get(`/api/quiz-questions/${questionId}`);
  return response.data;
};

export const updateQuestion = async (questionId, questionData) => {
  const response = await api.put(`/api/quiz-questions/${questionId}`, questionData);
  return response.data;
};

export const deleteQuestion = async (questionId) => {
  const response = await api.delete(`/api/quiz-questions/${questionId}`);
  return response.data;
};


export const evaluateQuiz = async (quizId, answers) => {
  const response = await api.post(`/api/quizzes/${quizId}/evaluate`, { answers });
  return response.data;
};


export const getMyQuizzes = async () => {
  const response = await api.get("/api/quizzes/student/my-quizzes");
  return response.data;
};

export default {
  getMyQuizzes,
  evaluateQuiz,
  getCourseQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  publishQuiz,
  deleteQuiz,
  createQuestion,
  getQuizQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
