import axios from "axios";

// Separate instance for Question admin routes. Question admin routes now
// live on the same backend (Render) as the rest of the app — the old
// temporary EC2 URL is no longer needed, but this instance is kept
// separate in case the two ever need to diverge again. Override with
// VITE_QUESTION_API_URL if needed.
const questionAxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_QUESTION_API_URL ||
    "https://math-scratch.onrender.com/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Attach Token) — same pattern as axiosInstance.js
questionAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
    const message = error?.response?.data?.message || error.message;
    return Promise.reject(message);
  },
);

export default questionAxiosInstance;
