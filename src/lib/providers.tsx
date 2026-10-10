"use client";

/**
 * Providers — wraps the entire app with:
 *   1. ReactQueryProvider  — TanStack Query client + devtools
 *   2. AuthProvider        — session context (login/logout/role)
 *   3. Toaster             — sonner toast notifications
 *
 * This file is a client component so it can hold state.
 * It is imported by the root layout (a server component) and used
 * to wrap {children} — that pattern is the standard Next.js App Router
 * way to add client-only providers without making the root layout itself
 * a client component.
 */

import React, { useState } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { queryErrorLifecycle } from "@/lib/query-error-toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  /**
   * Create the QueryClient inside useState so each browser session gets its
   * own instance (prevents shared state between requests in SSR contexts).
   */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache(queryErrorLifecycle),
        defaultOptions: {
          queries: {
            // Don't refetch on window focus in a financial app — confusing UX
            refetchOnWindowFocus: false,
            // Retry once on failure before showing an error
            retry: 1,
            // Data is considered fresh for 1 minute
            staleTime: 60_000,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        {/* Sonner toast stack — position top-right, ACADA brand */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-geist-sans)",
            },
          }}
        />
      </AuthProvider>
      {/* React Query devtools — only visible in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
