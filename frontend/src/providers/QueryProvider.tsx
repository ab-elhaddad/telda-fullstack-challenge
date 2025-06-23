import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/services/queries/queryClient";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app with React Query
 * Makes React Query available throughout the app
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
