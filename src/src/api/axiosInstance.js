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

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://13.203.232.239:3000/api",
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Attach Token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
    const message = error?.response?.data?.message || error.message;
    return Promise.reject(message);
  },
);

export default axiosInstance;