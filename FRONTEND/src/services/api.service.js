import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

import { auth } from '../configs/firebase';

api.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(true);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestError = new Error(
      error.response?.data?.message ||
        (error.request
          ? 'Unable to reach the server. Please check your connection and try again.'
          : 'Something went wrong. Please try again.')
    );

    requestError.status = error.response?.status;
    return Promise.reject(requestError);
  }
);

export { API_BASE_URL };
export default api;
