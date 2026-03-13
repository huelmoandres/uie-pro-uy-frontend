import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ─── QueryClient Configuration ────────────────────────────────────────────────
// staleTime: 5 min → no refetch while data is fresh
// gcTime: 30 min → keep cached data for offline reads
// retry: 2 → retry failed requests twice before showing error

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
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
