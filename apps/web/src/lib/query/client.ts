import { QueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          error instanceof Error &&
          "status" in error &&
          typeof (error as { status: unknown }).status === "number" &&
          (error as { status: number }).status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
});

export function toastErrorFor(error: unknown): string {
  return getApiErrorMessage(error);
}
