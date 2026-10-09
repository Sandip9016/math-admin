import axios from "axios";
import { getToken, handleAuthError } from "./authSession";

// Separate instance for Question admin routes. Question admin routes now
// live on the same backend (Render) as the rest of the app — the old
// temporary EC2 URL is no longer needed, but this instance is kept
// separate in case the two ever need to diverge again. Override with
// VITE_QUESTION_API_URL if needed.
const questionAxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_QUESTION_API_URL ||
    "http://13.203.232.239:3000/api",
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Attach Token) — same pattern as axiosInstance.js
questionAxiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor (Handle Errors) — same pattern as axiosInstance.js
questionAxiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    handleAuthError(error);
    const data = error?.response?.data;
    let message = data?.message || error.message;
    // 400 validation: show every field error (one per line).
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join("\n");
    } else if (error?.response?.status === 409) {
      // server message says why (duplicate, deleted, not deleted)
      const st = data?.existingStatus;
      message = data?.message
        ? st
          ? `${data.message} (existing question is ${st})`
          : data.message
        : "This question already exists";
    }
    return Promise.reject(message);
  },
);

export default questionAxiosInstance;