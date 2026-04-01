import { getAxiosErrorMessage } from '../../services/axiosError';

export const getErrorMessage = (error: unknown, fallback: string) =>
  getAxiosErrorMessage(error, fallback);
