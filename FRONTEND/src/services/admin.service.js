import api from './api.service';

export const getAdminProfile = async () => {
  const response = await api.get('/api/admin/profile');
  return response.data;
};

export const updateAdminProfile = async (data) => {
  const response = await api.put('/api/admin/profile', data);
  return response.data;
};

export const uploadAdminProfileImage = async (formData) => {
  const response = await api.post('/api/admin/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/api/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/api/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/admin/users/${id}`);
  return response.data;
};

const adminService = {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfileImage,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

export default adminService;
