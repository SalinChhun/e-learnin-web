import { useSessionStorage } from "@/lib/hook/use-session-storage";
import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { localStroageEnum } from "../enums/enums";
import apiManagementService from "@/service/api-management.service";
import { usePopupStore } from "../store";
import toast from "@/utils/toastService";
import { useInfiniteScroll } from "./useInfiniteScroll";

/**
 * Hook to fetch API managements with pagination and filtering
 */
const useFetchApiManagement = () => {
  const params = useSearchParams();
  const pageSize = params.get("page_size") || 10;
  const searchParams = useSearchParams();
  const session = useSession();

  const [storeValue] = useSessionStorage<{
    start_date?: string;
    end_date?: string;
  }>(`${localStroageEnum.DATEPICK}-${session?.data?.user?.name}`, {
    start_date:
      searchParams.get("start_date") ??
      dayjs().subtract(1, "month").format("YYYYMMDD"),
    end_date: searchParams.get("end_date") ?? dayjs().format("YYYYMMDD"),
  });

  const requestParams = useMemo(
    () => ({
      page_size: +pageSize > 100 ? 100 : +pageSize,
      page_number: +(params.get("page_number") || 0),
      search_value: params.get("search_value") || "",
      status: params.get("status") || "",
      start_date: params.get("start_date") || storeValue?.start_date,
      end_date: params.get("end_date") || storeValue?.end_date,
      sort_columns: params.get("sort_columns") || "",
    }),
    [pageSize, params, storeValue]
  );

  const [apiManagementQuery] = useQueries({
    queries: [
      {
        queryKey: ["api-management", { requestParams }],
        queryFn: () => apiManagementService.getApiManagements(requestParams),
      },
    ],
  });

  return {
    apiManagementQuery,
  };
};

/**
 * Hook to create a new API management
 */
const useCreateApiManagement = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();

  const mutation = useMutation({
    mutationFn: (data: {
      provider_id: number;
      config_id: number;
      api_name: string;
      service_id: string;
      description?: string;
      method: string;
      is_enable: boolean;
      api_endpoint_url: string;
    }) => apiManagementService.createApiManagement(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: {
        provider_id: number;
        config_id: number;
        api_name: string;
        service_id: string;
        description?: string;
        method: string;
        is_enable: boolean;
        api_endpoint_url: string;
      },
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          toast.success("Created successfully");
          queryClient.invalidateQueries({ queryKey: ["api-management"] });
          queryClient.invalidateQueries({ queryKey: ["providers"] });
          queryClient.invalidateQueries({
            queryKey: ["available-auth-configs"],
            exact: false,
          });
          queryClient.invalidateQueries({
            queryKey: ["available-api-managements"],
            exact: false,
          });
          queryClient.invalidateQueries({ queryKey: ["report-count"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to create API management");
        },
      });
    },
  };
};

/**
 * Hook to update an existing API management
 */
const useUpdateApiManagement = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();

  const mutation = useMutation({
    mutationFn: (data: {
      apiId: number;
      provider_id: number;
      config_id: number;
      api_name: string;
      service_id: string;
      description?: string;
      method: string;
      is_enable: boolean;
      api_endpoint_url: string;
    }) =>
      apiManagementService.updateApiManagement(data.apiId, data),
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update API management");
    },
    onSuccess: () => {
      toast.success("Edited successfully");
      queryClient.invalidateQueries({ queryKey: ["api-management"] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({
        queryKey: ["available-auth-configs"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["available-api-managements"],
        exact: false,
      });
      closePopup();
    },
  });

  return {
    mutation: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
  };
};

/**
 * Hook to update API management status (bulk operation)
 */
const useUpdateApiManagementStatus = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();

  const mutation = useMutation({
    mutationFn: (data: { config_ids: number[]; is_enable: boolean }) =>
      apiManagementService.updateApiManagementStatus(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: { config_ids: number[]; is_enable: boolean },
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          const statusText = variables.is_enable ? "Enabled" : "Disabled";
          toast.success(`${statusText} successfully`);
          queryClient.invalidateQueries({ queryKey: ["api-management"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update API management status"
          );
        },
      });
    },
  };
};

/**
 * Hook to delete API managements (bulk operation)
 */
const useDeleteApiManagement = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (configIds: number[]) =>
      apiManagementService.deleteApiManagements(configIds),
  });

  return {
    ...mutation,
    mutation: (
      variables: any,
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          toast.success("Deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["api-management"] });
          queryClient.invalidateQueries({ queryKey: ["providers"] });
          queryClient.invalidateQueries({
            queryKey: ["available-auth-configs"],
            exact: false,
          });
          queryClient.invalidateQueries({
            queryKey: ["available-api-managements"],
            exact: false,
          });
          queryClient.invalidateQueries({ queryKey: ["report-count"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to delete API management(s)"
          );
        },
      });
    },
  };
};

/**
 * Hook to fetch providers with infinite scroll
 */
export const useProviders = (enabled: boolean = false) => {
  const [searchValue, setSearchValue] = useState("");

  const providersQuery = useInfiniteScroll({
    queryKey: ["providers"],
    queryFn: ({ pageParam, search }: { pageParam: number; search?: string }) =>
      apiManagementService.getProviders({ pageParam, search: search || "" }) as any,
    searchValue,
    enabled,
  });

  return {
    ...providersQuery,
    searchValue,
    setSearchValue,
  };
};

/**
 * Hook to fetch available auth configs with infinite scroll
 */
export const useAvailableAuthConfigs = (enabled: boolean = false) => {
  const [searchValue, setSearchValue] = useState("");

  const authConfigsQuery = useInfiniteScroll({
    queryKey: ["available-auth-configs"],
    queryFn: ({ pageParam, search }: { pageParam: number; search?: string }) =>
      apiManagementService.getAvailableAuthConfigs({ pageParam, search: search || "" }) as any,
    searchValue,
    enabled,
  });

  return {
    ...authConfigsQuery,
    searchValue,
    setSearchValue,
  };
};

/**
 * Hook to fetch available API managements with infinite scroll
 */
export const useAvailableApiManagements = (enabled: boolean = false) => {
  const [searchValue, setSearchValue] = useState("");

  const apiManagementsQuery = useInfiniteScroll({
    queryKey: ["available-api-managements"],
    queryFn: ({ pageParam, search }: { pageParam: number; search?: string }) =>
      apiManagementService.getAvailableApiManagements({ pageParam, search: search || "" }) as any,
    searchValue,
    enabled,
  });

  return {
    ...apiManagementsQuery,
    searchValue,
    setSearchValue,
  };
};

/**
 * Main hook object that exports all API management hooks
 */
export const useApiManagementMutation = {
  useFetchApiManagement,
  useCreateApiManagement,
  useUpdateApiManagement,
  useUpdateApiManagementStatus,
  useDeleteApiManagement,
  useProviders,
  useAvailableAuthConfigs,
  useAvailableApiManagements,
};

/**
 * Utility function to force refetch all API management related data
 */
export const refetchAllApiManagementData = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: ["api-management"] });
  queryClient.invalidateQueries({ queryKey: ["providers"] });
  queryClient.invalidateQueries({ queryKey: ["available-auth-configs"], exact: false });
  queryClient.invalidateQueries({ queryKey: ["available-api-managements"], exact: false });
};

export default useApiManagementMutation;
