import api from './api.service';

export const getStudentProfile = async () => {
  const response = await api.get('/api/student/profile');
  return response.data;
};

export const updateStudentProfile = async (data) => {
  const response = await api.put('/api/student/profile', data);
  return response.data;
};

export const deleteStudentProfile = async () => {
  const response = await api.delete('/api/student/profile');
  return response.data;
};

export const uploadStudentProfileImage = async (formData) => {
  const response = await api.post('/api/student/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getAllStudents = async () => {
  const response = await api.get('/api/student');
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/api/student/${id}`);
  return response.data;
};

const studentService = {
  getStudentProfile,
  updateStudentProfile,
  deleteStudentProfile,
  uploadStudentProfileImage,
  getAllStudents,
  getStudentById,
};

export default studentService;
