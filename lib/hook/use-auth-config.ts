import { useSessionStorage } from "@/lib/hook/use-session-storage";
import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { APIStatus, localStroageEnum } from "../enums/enums";
import authConfigService from "@/service/auth-config.service";
import { usePopupStore } from "../store";
import toast from "@/utils/toastService";
import { useInfiniteScroll } from "./useInfiniteScroll";

const useFetchAuthConfig = () => {
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
      page_size: +pageSize > 100 ? 100 : pageSize,
      page_number: params.get("page_number") || 0,
      search_value: params.get("search_value") || "",
      status: params.get("status") || "",
      start_date: params.get("start_date") || storeValue?.start_date,
      end_date: params.get("end_date") || storeValue?.end_date,
      sort_columns: params.get("sort_columns") || "",
    }),
    [pageSize, params, storeValue]
  );

  const [authConfigQuery] = useQueries({
    queries: [
      {
        queryKey: ["auth-config", { requestParams }],
        queryFn: () => authConfigService.getAuthConfigs(requestParams),
      },
    ],
  });

  return {
    authConfigQuery,
  };
};

const useCreateAuthConfig = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();

  const mutation = useMutation({
    mutationFn: (data: {
      config_name: string;
      provider_id: string;
      env: string;
      is_enable: boolean;
      base_url: string;
      auth_type?: string;
      client_id?: string;
      client_secret?: string;
      token_url?: string;
      username?: string;
      password?: string;
    }) => authConfigService.createAuthConfig(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: {
        config_name: string;
        provider_id: number | string;
        env: string;
        is_enable: boolean;
        base_url: string;
        auth_type?: string;
        client_id?: string;
        client_secret?: string;
        token_url?: string;
        username?: string;
        password?: string;
      },
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables as any, {
        onSuccess: (data) => {
          toast.success("Created successfully");
          queryClient.invalidateQueries({ queryKey: ["auth-config"] });
          queryClient.invalidateQueries({ queryKey: ["api-management"] });
          queryClient.invalidateQueries({ queryKey: ["providers"] });
          queryClient.invalidateQueries({
            queryKey: ["available-auth-configs"],
            exact: false,
          });
          queryClient.invalidateQueries({ queryKey: ["report-count"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to create auth config");
        },
      });
    },
  };
};

const useUpdateAuthConfig = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();

  const mutation = useMutation({
    mutationFn: (data: {
      configId: number;
      config_name: string;
      provider_id: number | string;
      env: string;
      is_enable: boolean;
      base_url: string;
      auth_type?: string;
      client_id?: string;
      client_secret?: string;
      token_url?: string;
      username?: string;
      password?: string;
    }) =>
      authConfigService.updateAuthConfig(data.configId, data),
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update auth config");
    },
    onSuccess: () => {
      toast.success("Edited successfully");
      queryClient.invalidateQueries({ queryKey: ["auth-config"] });
      queryClient.invalidateQueries({ queryKey: ["api-management"] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({
        queryKey: ["available-auth-configs"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["report-count"] });
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

const useUpdateAuthConfigStatus = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();

  const mutation = useMutation({
    mutationFn: (data: { config_ids: number[]; is_enable: boolean }) =>
      authConfigService.updateAuthConfigStatus(data),
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
          queryClient.invalidateQueries({ queryKey: ["auth-config"] });
          queryClient.invalidateQueries({ queryKey: ["api-management"] });
          queryClient.invalidateQueries({ queryKey: ["report-count"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update auth config status"
          );
        },
      });
    },
  };
};

export const useProviders = (enabled: boolean = false) => {
  const [searchValue, setSearchValue] = useState("");

  const providersQuery = useInfiniteScroll({
    queryKey: ["providers"],
    queryFn: ({ pageParam, search }: { pageParam: number; search?: string }) =>
      authConfigService.getProviders({ pageParam, search: search || "" }) as any,
    searchValue,
    enabled,
  });

  return {
    ...providersQuery,
    searchValue,
    setSearchValue,
  };
};

export const useAvailableAuthConfigs = () => {
  const [searchValue, setSearchValue] = useState("");

  const authConfigsQuery = useInfiniteScroll({
    queryKey: ["available-auth-configs"],
    queryFn: ({ pageParam, search }: { pageParam: number; search?: string }) =>
      authConfigService.getAvailableAuthConfigs({ pageParam, search: search || "" }) as any,
    searchValue,
    enabled: true,
  });

  return {
    ...authConfigsQuery,
    searchValue,
    setSearchValue,
  };
};

const useDeleteAuthConfig = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (configIds: number[]) =>
      authConfigService.deleteAuthConfig(configIds),
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
          queryClient.invalidateQueries({ queryKey: ["auth-config"] });
          queryClient.invalidateQueries({ queryKey: ["api-management"] });
          queryClient.invalidateQueries({ queryKey: ["providers"] });
          queryClient.invalidateQueries({
            queryKey: ["available-auth-configs"],
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
              "Failed to delete auth config(s)"
          );
        },
      });
    },
  };
};

export const useAuthConfigMutation = {
  useFetchAuthConfig,
  useCreateAuthConfig,
  useUpdateAuthConfig,
  useUpdateAuthConfigStatus,
  useDeleteAuthConfig,
  useProviders,
  useAvailableAuthConfigs,
};

// Utility function to force refetch all auth config related data
export const refetchAllAuthConfigData = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: ["auth-config"] });
  queryClient.invalidateQueries({ queryKey: ["api-management"] });
  queryClient.invalidateQueries({ queryKey: ["providers"] });
  queryClient.invalidateQueries({ queryKey: ["available-auth-configs"], exact: false });
};

export default useAuthConfigMutation;
