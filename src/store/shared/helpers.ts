import {
  getAxiosErrorMessage,
  parseApiError,
  type ApiErrorInfo,
} from '../../services/axiosError';

export type { ApiErrorInfo };

export const getErrorMessage = (error: unknown, fallback: string) =>
  getAxiosErrorMessage(error, fallback);

export const getApiError = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): ApiErrorInfo => parseApiError(error, fallback);

/** Prefer this in thunks so forms can map `details` paths to fields. */
export const rejectApiError = (
  error: unknown,
  fallback: string,
): ApiErrorInfo => parseApiError(error, fallback);

export const getRejectedErrorMessage = (
  payload: unknown,
  fallback: string,
): string => {
  if (typeof payload === 'string') {
    return payload || fallback;
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as ApiErrorInfo).message === 'string'
  ) {
    return (payload as ApiErrorInfo).message || fallback;
  }

  return fallback;
};
