import api from './api.service';

export const getInstructorProfile = async () => {
  const response = await api.get('/api/instructor/profile');
  return response.data;
};

export const updateInstructorProfile = async (data) => {
  const response = await api.put('/api/instructor/profile', data);
  return response.data;
};

export const deleteInstructorProfile = async () => {
  const response = await api.delete('/api/instructor/profile');
  return response.data;
};

export const uploadInstructorProfileImage = async (formData) => {
  const response = await api.post('/api/instructor/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getAllInstructors = async () => {
  const response = await api.get('/api/instructor');
  return response.data;
};

export const getInstructorById = async (id) => {
  const response = await api.get(`/api/instructor/${id}`);
  return response.data;
};

const instructorService = {
  getInstructorProfile,
  updateInstructorProfile,
  deleteInstructorProfile,
  uploadInstructorProfileImage,
  getAllInstructors,
  getInstructorById,
};

export default instructorService;
