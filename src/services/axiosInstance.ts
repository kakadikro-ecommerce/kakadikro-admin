import axios, { AxiosHeaders } from 'axios';

const DEFAULT_API_BASE_URL = 'https://api.kakadikro.com/api';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers);

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      headers.delete('Content-Type');
    }

    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
