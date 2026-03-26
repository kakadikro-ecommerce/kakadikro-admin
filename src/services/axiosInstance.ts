import axios from "axios";

const axiosInstance = axios.create({
  // Replace with your local or production IP
  baseURL: "http://192.168.1.4:5000/api", 
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // FIXED: Added backticks for template literal
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors (like 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logic for logout if token is expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Prevent infinite redirect loop if already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"; 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;