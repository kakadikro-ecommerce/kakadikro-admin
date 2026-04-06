import axios, { AxiosHeaders } from 'axios';

const DEFAULT_API_BASE_URL = 'http://192.168.1.13:5000/api';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      const headers =
        config.headers instanceof AxiosHeaders
          ? config.headers
          : new AxiosHeaders(config.headers);

      headers.set('Authorization', `Bearer ${accessToken}`);
      config.headers = headers;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
