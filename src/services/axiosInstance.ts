import axios, { AxiosHeaders } from 'axios';

const DEFAULT_API_BASE_URL = 'https://api.kakadikro.com/api';

/** Prefer VITE_API_BASE_URL; accept legacy VITE_API_BASE_URL_LOCAL if the primary key is unset. */
const resolveApiBaseUrl = (): string => {
  const primary = import.meta.env.VITE_API_BASE_URL?.trim();
  if (primary) return primary;

  const legacyLocal = import.meta.env.VITE_API_BASE_URL_LOCAL?.trim();
  if (legacyLocal) {
    console.warn(
      '[API] VITE_API_BASE_URL is unset; using VITE_API_BASE_URL_LOCAL. Rename it to VITE_API_BASE_URL.',
    );
    return legacyLocal;
  }

  return DEFAULT_API_BASE_URL;
};

const API_BASE_URL = resolveApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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
      // Product uploads can include up to 9 images and one 50MB video.
      if (config.timeout == null || config.timeout < 300000) {
        config.timeout = 300000;
      }
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
