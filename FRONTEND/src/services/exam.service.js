import api from "./api.service";

export const getCourseExams = async (courseId) => {
  const response = await api.get(`/api/exams/course/${courseId}`);
  return response.data;
};

export const getMyExams = async () => {
  const response = await api.get("/api/exams/student/my-exams");
  return response.data;
};

export const getExamById = async (examId) => {
  const response = await api.get(`/api/exams/${examId}`);
  return response.data;
};

export const createExam = async (courseId, examData) => {
  const response = await api.post(`/api/exams/course/${courseId}`, examData);
  return response.data;
};

export const updateExam = async (examId, examData) => {
  const response = await api.put(`/api/exams/${examId}`, examData);
  return response.data;
};

export const publishExam = async (examId) => {
  const response = await api.patch(`/api/exams/${examId}/publish`);
  return response.data;
};

export const deleteExam = async (examId) => {
  const response = await api.delete(`/api/exams/${examId}`);
  return response.data;
};

export const generateExamQuestions = async (examId, generationData) => {
  if (!generationData?.document) {
    throw new Error("A document is required");
  }

  const formData = new FormData();
  formData.append("document", generationData.document);
  formData.append("numberOfQuestions", generationData.numberOfQuestions);
  formData.append("difficulty", generationData.difficulty);
  formData.append("marksPerQuestion", generationData.marksPerQuestion);
  formData.append("instructions", generationData.instructions || "");

  const response = await api.post(
    `/api/exams/${examId}/ai-generate-questions`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getExamQuestions = async (examId) => {
  const response = await api.get(`/api/exam-questions/exam/${examId}`);
  return response.data;
};

export const getQuestionById = async (questionId) => {
  const response = await api.get(`/api/exam-questions/${questionId}`);
  return response.data;
};

export const createQuestion = async (examId, questionData) => {
  const response = await api.post(
    `/api/exam-questions/exam/${examId}`,
    questionData
  );
  return response.data;
};

export const updateQuestion = async (questionId, questionData) => {
  const response = await api.put(
    `/api/exam-questions/${questionId}`,
    questionData
  );
  return response.data;
};

export const deleteQuestion = async (questionId) => {
  const response = await api.delete(`/api/exam-questions/${questionId}`);
  return response.data;
};

export const startExamAttempt = async (examId) => {
  const response = await api.post(`/api/exam-attempts/exam/${examId}/start`);
  return response.data;
};

export const getActiveAttempt = async (examId) => {
  const response = await api.get(`/api/exam-attempts/exam/${examId}/active`);
  return response.data;
};

export const saveExamAnswers = async (attemptId, answers) => {
  const response = await api.put(`/api/exam-attempts/${attemptId}/answers`, {
    answers,
  });
  return response.data;
};

export const submitExam = async (attemptId, answers) => {
  const response = await api.post(`/api/exam-attempts/${attemptId}/submit`, {
    answers,
  });
  return response.data;
};

export const getExamResult = async (attemptId) => {
  const response = await api.get(`/api/exam-attempts/${attemptId}/result`);
  return response.data;
};

export const getExamLeaderboard = async (examId) => {
  const response = await api.get(`/api/exam-attempts/exam/${examId}/leaderboard`);
  return response.data;
};

export default {
  getCourseExams,
  getMyExams,
  getExamById,
  createExam,
  updateExam,
  publishExam,
  deleteExam,
  generateExamQuestions,
  getExamQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  startExamAttempt,
  getActiveAttempt,
  saveExamAnswers,
  submitExam,
  getExamResult,
  getExamLeaderboard,
};
