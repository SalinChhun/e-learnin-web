"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function TanstackQueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Global query configuration
                        staleTime: 60 * 1000, // 1 minute
                        gcTime: 5 * 60 * 1000, // 5 minutes
                        retry: 1,
                        refetchOnWindowFocus: process.env.NODE_ENV === "production",
                    },
                    mutations: {
                        // Global mutation configuration
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export const createQueryKeys = <T extends Record<string, unknown>>(
    baseKey: string,
    keys: T
) => {
    const queryKeys = {
        all: [baseKey] as const,
        lists: () => [...queryKeys.all, "list"] as const,
        list: (filters: Record<string, unknown>) =>
            [...queryKeys.lists(), filters] as const,
        details: () => [...queryKeys.all, "detail"] as const,
        detail: (id: string | number) => [...queryKeys.details(), id] as const,
        ...Object.entries(keys).reduce(
            (acc, [key, value]) => ({
                ...acc,
                [key]: value,
            }),
            {} as T
        ),
    };

    return queryKeys;
};