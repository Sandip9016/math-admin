// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL:
//     import.meta.env.VITE_API_URL || "https://math-scratch.onrender.com/api",
//   timeout: 300000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Request Interceptor (Attach Token)
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// // Response Interceptor (Handle Errors)
// axiosInstance.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     const message = error?.response?.data?.message || error.message;
//     return Promise.reject(message);
//   },
// );

// export default axiosInstance;



import axios from "axios";
import { getToken, handleAuthError } from "./authSession";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://43.204.228.107:3000/api",
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Attach Token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor (Handle Errors)
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    handleAuthError(error);
    const message = error?.response?.data?.message || error.message;
    return Promise.reject(message);
  },
);

export default axiosInstance;