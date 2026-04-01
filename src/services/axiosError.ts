import axios, { AxiosError } from "axios";

const NETWORK_ERROR_MESSAGE =
  "Unable to reach the API server. Check that the backend is running, the API URL is correct, and CORS/firewall settings allow this request.";

export const getAxiosErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const responseMessage =
      axiosError.response?.data?.message || axiosError.response?.data?.error;

    if (responseMessage) {
      return responseMessage;
    }

    if (axiosError.code === "ECONNABORTED") {
      return "The API request timed out. Verify the backend is reachable and responding on time.";
    }

    if (!axiosError.response) {
      return NETWORK_ERROR_MESSAGE;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
