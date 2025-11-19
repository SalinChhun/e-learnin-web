import { http } from '@/utils/http';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

type ApiError = {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
};

export function useApiQuery<TData = unknown, TError = ApiError>(
    queryKey: readonly unknown[],
    endpoint: string,
    options?: {
        enabled?: boolean;
        staleTime?: number;
        gcTime?: number;
        retry?: boolean | number;
        select?: (data: any) => TData;
        onSuccess?: (data: TData) => void;
        onError?: (error: AxiosError<TError>) => void;
    }
) {
    return useQuery<TData, AxiosError<TError>>({
        queryKey,
        queryFn: async () => {
            const response = await http.get(endpoint);
            return response.data;
        },
        ...options,
    });
}

export function useApiCreate<TData = unknown, TVariables = unknown, TError = ApiError>(
    endpoint: string,
    options?: {
        onSuccess?: (data: TData, variables: TVariables) => void;
        onError?: (error: AxiosError<TError>, variables: TVariables) => void;
        onSettled?: (data: TData | undefined, error: AxiosError<TError> | null, variables: TVariables) => void;
        invalidateQueries?: readonly unknown[];
    }
) {
    const queryClient = useQueryClient();

    return useMutation<TData, AxiosError<TError>, TVariables>({
        mutationFn: async (variables) => {
            const response = await http.post(endpoint, variables);
            return response.data;
        },
        onSuccess: (data, variables) => {
            if (options?.invalidateQueries) {
                queryClient.invalidateQueries({ queryKey: options.invalidateQueries });
            }
            options?.onSuccess?.(data, variables);
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    });
}

export function useApiUpdate<TData = unknown, TVariables = unknown, TError = ApiError>(
    endpoint: string,
    options?: {
        onSuccess?: (data: TData, variables: TVariables) => void;
        onError?: (error: AxiosError<TError>, variables: TVariables) => void;
        onSettled?: (data: TData | undefined, error: AxiosError<TError> | null, variables: TVariables) => void;
        invalidateQueries?: readonly unknown[];
    }
) {
    const queryClient = useQueryClient();

    return useMutation<TData, AxiosError<TError>, TVariables>({
        mutationFn: async (variables: any) => {
            const { id, ...data } = variables;
            const response = await http.put(`${endpoint}/${id}`, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            if (options?.invalidateQueries) {
                queryClient.invalidateQueries({ queryKey: options.invalidateQueries });
            }
            options?.onSuccess?.(data, variables);
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    });
}

export function useApiDelete<TData = unknown, TVariables = string | number, TError = ApiError>(
    endpoint: string,
    options?: {
        onSuccess?: (data: TData, variables: TVariables) => void;
        onError?: (error: AxiosError<TError>, variables: TVariables) => void;
        onSettled?: (data: TData | undefined, error: AxiosError<TError> | null, variables: TVariables) => void;
        invalidateQueries?: readonly unknown[];
    }
) {
    const queryClient = useQueryClient();

    return useMutation<TData, AxiosError<TError>, TVariables>({
        mutationFn: async (id) => {
            const response = await http.delete(`${endpoint}/${id}`);
            return response.data;
        },
        onSuccess: (data, variables) => {
            if (options?.invalidateQueries) {
                queryClient.invalidateQueries({ queryKey: options.invalidateQueries });
            }
            options?.onSuccess?.(data, variables);
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    });
}