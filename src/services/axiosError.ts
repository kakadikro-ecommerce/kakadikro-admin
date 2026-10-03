import axios, { AxiosError } from 'axios';

const DEFAULT_FALLBACK = 'Something went wrong. Please try again.';

const NETWORK_ERROR_MESSAGE =
  'Unable to reach the API server. Check that the backend is running, the API URL is correct, and CORS/firewall settings allow this request.';

const PAYLOAD_TOO_LARGE_MESSAGE =
  'Upload is too large. Use up to 5 images, each 5MB or smaller. If this persists against the production API, the server proxy must allow larger uploads (nginx client_max_body_size).';

const isFormDataRequest = (error: AxiosError): boolean => {
  const data = error.config?.data;
  return typeof FormData !== 'undefined' && data instanceof FormData;
};

const getHttpStatus = (error: AxiosError): number | undefined => {
  if (typeof error.response?.status === 'number') {
    return error.response.status;
  }

  // Some browsers expose status on the XHR even when CORS hides response headers.
  const request = error.request as { status?: number } | undefined;
  if (request && typeof request.status === 'number' && request.status > 0) {
    return request.status;
  }

  return undefined;
};

export type ApiErrorDetail = {
  message?: string;
  path?: string | Array<string | number>;
  field?: string;
};

export type ApiErrorInfo = {
  message: string;
  fieldErrors: Record<string, string>;
};

const isTechnicalMessage = (message: string): boolean => {
  const value = message.trim();
  if (!value) return true;

  const lower = value.toLowerCase();

  return (
    value.length > 400 ||
    lower.includes('<!doctype') ||
    lower.includes('<html') ||
    lower.includes('mongodb') ||
    lower.includes('mongoerror') ||
    lower.includes('cast to objectid') ||
    lower.includes('validationerror:') ||
    lower.includes('econnrefused') ||
    lower.includes('enotfound') ||
    lower.includes('at object.') ||
    lower.includes('at module.') ||
    lower.includes('axioserror') ||
    lower.includes('request failed with status code') ||
    /at\s+\S+\s+\(/.test(value)
  );
};

const sanitizeMessage = (message: unknown, fallback: string): string => {
  if (typeof message !== 'string') return fallback;
  const trimmed = message.trim();
  if (!trimmed || isTechnicalMessage(trimmed)) return fallback;
  return trimmed;
};

const normalizePath = (path: string | Array<string | number> | undefined): string => {
  if (path == null) return '';

  if (Array.isArray(path)) {
    return path
      .map((segment) => String(segment))
      .join('.')
      .replace(/\[(\d+)\]/g, '.$1');
  }

  return String(path)
    .trim()
    .replace(/\[(\d+)\]/g, '.$1')
    .replace(/^\./, '');
};

const collectFieldErrors = (details: unknown): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  if (!Array.isArray(details)) return fieldErrors;

  details.forEach((item: ApiErrorDetail) => {
    if (!item || typeof item !== 'object') return;

    const key =
      normalizePath(item.path) ||
      (typeof item.field === 'string' ? item.field.trim() : '');

    const message = sanitizeMessage(item.message, '');
    if (!key || !message) return;

    if (!fieldErrors[key]) {
      fieldErrors[key] = message;
    }
  });

  return fieldErrors;
};

const isApiErrorInfo = (value: unknown): value is ApiErrorInfo =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ApiErrorInfo).message === 'string' &&
  typeof (value as ApiErrorInfo).fieldErrors === 'object' &&
  (value as ApiErrorInfo).fieldErrors !== null;

export const parseApiError = (
  error: unknown,
  fallback: string = DEFAULT_FALLBACK,
): ApiErrorInfo => {
  if (isApiErrorInfo(error)) {
    return {
      message: sanitizeMessage(error.message, fallback),
      fieldErrors: error.fieldErrors || {},
    };
  }

  if (typeof error === 'string') {
    return {
      message: sanitizeMessage(error, fallback),
      fieldErrors: {},
    };
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      details?: ApiErrorDetail[] | null;
      errors?: ApiErrorDetail[] | Record<string, string | string[]>;
      fieldErrors?: Record<string, string | string[]>;
    }>;

    const data = axiosError.response?.data;
    const fieldErrors = {
      ...collectFieldErrors(data?.details),
      ...collectFieldErrors(data?.errors),
    };

    if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
      Object.entries(data.fieldErrors).forEach(([key, value]) => {
        const message = Array.isArray(value) ? value[0] : value;
        const sanitized = sanitizeMessage(message, '');
        if (key && sanitized) fieldErrors[key] = sanitized;
      });
    }

    if (data?.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
      Object.entries(data.errors).forEach(([key, value]) => {
        const message = Array.isArray(value) ? value[0] : value;
        const sanitized = sanitizeMessage(message, '');
        if (key && sanitized) fieldErrors[key] = sanitized;
      });
    }

    if (axiosError.code === 'ECONNABORTED') {
      return {
        message: isFormDataRequest(axiosError)
          ? 'Image upload timed out. Try fewer or smaller images, then try again.'
          : 'The API request timed out. Please try again.',
        fieldErrors,
      };
    }

    const status = getHttpStatus(axiosError);
    if (status === 413) {
      return {
        message: sanitizeMessage(data?.message ?? data?.error, PAYLOAD_TOO_LARGE_MESSAGE),
        fieldErrors,
      };
    }

    if (!axiosError.response) {
      // Proxy 413 responses often omit CORS headers, so Axios reports a network
      // error even though DevTools shows 413. Hint at both causes for uploads.
      if (isFormDataRequest(axiosError)) {
        return {
          message: `${NETWORK_ERROR_MESSAGE} If DevTools shows 413, the upload is too large for the API proxy — use smaller images or raise nginx client_max_body_size.`,
          fieldErrors,
        };
      }

      return {
        message: NETWORK_ERROR_MESSAGE,
        fieldErrors,
      };
    }

    return {
      message: sanitizeMessage(data?.message ?? data?.error, fallback),
      fieldErrors,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const maybe = error as {
      message?: unknown;
      data?: { message?: unknown; details?: unknown };
      response?: { data?: { message?: unknown; details?: unknown } };
      details?: unknown;
    };

    const data = maybe.response?.data ?? maybe.data ?? maybe;
    const messageCandidate =
      (typeof data === 'object' && data && 'message' in data
        ? (data as { message?: unknown }).message
        : undefined) ?? maybe.message;

    return {
      message: sanitizeMessage(messageCandidate, fallback),
      fieldErrors: collectFieldErrors(
        (typeof data === 'object' && data && 'details' in data
          ? (data as { details?: unknown }).details
          : undefined) ?? maybe.details,
      ),
    };
  }

  if (error instanceof Error) {
    return {
      message: sanitizeMessage(error.message, fallback),
      fieldErrors: {},
    };
  }

  return {
    message: fallback,
    fieldErrors: {},
  };
};

export const getAxiosErrorMessage = (
  error: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string => parseApiError(error, fallback).message;
