import { useApiQuery } from "./use-api";

const commonKey = {
    all: ['profile'] as const,
    lists: () => [...commonKey.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...commonKey.lists(), filters] as const,
    details: () => [...commonKey.all, 'detail'] as const,
    detail: (id: string) => [...commonKey.details(), id] as const,
};

export function useGetMyProfile() {
    return useApiQuery<any>(
        commonKey.all,
        '/api/wba/v1/profile'
    );
}


export function useGetReportCount() {
    return useApiQuery<any>(
        ['report-count'],
        '/api/wba/v1/common'
    );
}