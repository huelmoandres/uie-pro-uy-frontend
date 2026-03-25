import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isAxiosError } from "axios";

// ─── QueryClient Configuration ────────────────────────────────────────────────
// staleTime: 5 min → no refetch while data is fresh
// gcTime: 30 min → keep cached data for offline reads
// retry: hasta 2 reintentos solo si no es 4xx (429 throttler no debe re-dispararse)

const QUERY_MAX_RETRIES = 2;

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status != null && status >= 400 && status < 500) {
      return false;
    }
  }
  return failureCount < QUERY_MAX_RETRIES;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── Provider ─────────────────────────────────────────────────────────────────

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const client = useMemo(() => queryClient, []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export { queryClient };
