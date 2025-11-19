import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ApiItem, Provider, UseInfiniteScrollParams } from '../types/api-permission';
import { InfiniteScrollItem } from '../types/common';

export const useInfiniteScroll = ({
    queryKey,
    queryFn,
    searchValue = '',
    enabled = true,
}: UseInfiniteScrollParams) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: [...queryKey, searchValue],
        queryFn: ({ pageParam = 0 }) =>
            queryFn({ pageParam, search: searchValue }),
        getNextPageParam: (lastPage) => {
            // Support both { data: { pagination: {...} }} and { pagination: {...} } shapes
            const pagination = (lastPage as any)?.data?.pagination || (lastPage as any)?.pagination;
            if (!pagination) return undefined;
            return pagination.last ? undefined : (pagination.current_page ?? 0) + 1;
        },
        initialPageParam: 0,
        enabled,
        staleTime: 0, // Data is always considered stale
        gcTime: 0, // No garbage collection time - data is immediately removed from cache
    });

    const flattenedData = useMemo(() => {
        if (!data?.pages) return [];

        return data.pages.flatMap((page, pageIndex) => {
            // Handle partners data
            const providers = (page as any)?.data?.providers || (page as any)?.providers;
            if (providers) {
                return providers.map((provider: any, index: number): InfiniteScrollItem => {
                    const pid = provider.provider_id ?? provider.id;
                    const title = provider.partner_name ?? provider.name ?? "";
                    const subtitle = provider.partner_code ?? provider.code ?? undefined;
                    return {
                        id: pid,
                        title,
                        subtitle,
                        value: { ...provider, _uniqueKey: `${pid}_${pageIndex}_${index}` },
                    };
                });
            }

            // Handle APIs data
            const apis = (page as any)?.data?.apis || (page as any)?.apis;
            if (apis) {
                return apis.map((api: ApiItem, index: number): InfiniteScrollItem => ({
                    id: api.api_id,
                    title: api.api_name,
                    subtitle: api.api_endpoint,
                    value: { ...api, _uniqueKey: `${api.api_id}_${pageIndex}_${index}` },
                }));
            }

            // Handle api_permissions data
            const apiPermissions = (page as any)?.data?.api_permissions || (page as any)?.api_permissions;
            if (apiPermissions) {
                return apiPermissions.map((api: any, index: number): InfiniteScrollItem => ({
                    id: api.apiId,
                    title: api.apiName,
                    subtitle: api.apiPath,
                    value: { ...api, _uniqueKey: `${api.apiId}_${pageIndex}_${index}` },
                }));
            }

            // Handle categories data
            const categories = (page as any)?.data?.categories || (page as any)?.categories;
            if (categories) {
                return categories.map((category: any, index: number): InfiniteScrollItem => ({
                    id: category.id,
                    title: category.category_name,
                    subtitle: undefined,
                    value: { ...category, _uniqueKey: `${category.id}_${pageIndex}_${index}` },
                }));
            }

            // Handle auth_configs data
            const authConfigs = (page as any)?.data?.auth_configs || (page as any)?.auth_configs;
            if (authConfigs) {
                return authConfigs.map((config: any, index: number): InfiniteScrollItem => ({
                    id: config.config_id,
                    title: config.config_name,
                    subtitle: undefined,
                    value: { ...config, _uniqueKey: `${config.config_id}_${pageIndex}_${index}` },
                }));
            }

            // Handle users data
            const users = (page as any)?.data?.users || (page as any)?.users;
            if (users) {
                return users.map((user: any, index: number): InfiniteScrollItem => ({
                    id: user.id,
                    title: user.full_name || user.username || "",
                    subtitle: user.email || user.department || undefined,
                    value: { ...user, _uniqueKey: `${user.id}_${pageIndex}_${index}` },
                }));
            }

            return [];
        });
    }, [data?.pages]);

    const totalElements = (data?.pages?.[0] as any)?.data?.pagination?.total_elements || (data?.pages?.[0] as any)?.pagination?.total_elements || 0;

    return {
        items: flattenedData,
        fetchNextPage,
        hasNextPage: hasNextPage || false,
        isFetchingNextPage,
        isLoading,
        error: error as Error | null,
        totalElements,
        refetch,
    };
};
