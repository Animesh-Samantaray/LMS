import axios from "axios";
import { auth } from "../configs/firebase";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();

        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error(
          "[API] Failed to get Firebase ID token:",
          error
        );
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
          ? "Unable to reach the server. Please check your connection."
          : "Something went wrong. Please try again.")
    );

    requestError.status = error.response?.status;
    requestError.response = error.response;

    return Promise.reject(requestError);
  }
);

export { API_BASE_URL };

export default api;