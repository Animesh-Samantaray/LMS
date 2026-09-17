import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
