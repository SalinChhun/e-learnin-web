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
import apiPermissionService from "@/service/api-permission.service";
import { usePopupStore } from "../store";
import toast from "@/utils/toastService";
import { useInfiniteScroll } from "./useInfiniteScroll";

const useFetchApiPermission = () => {
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
      // start_date: params.get('start_date'),
      // end_date: params.get('end_date'),
      sort_columns: params.get("sort_columns") || "",
    }),
    [pageSize, params, storeValue]
  );

  const [apiPermissionQuery] = useQueries({
    queries: [
      {
        queryKey: ["api-permission", { requestParams }],
        queryFn: () => apiPermissionService.getApiPermissions(requestParams),
      },
    ],
  });

  return {
    apiPermissionQuery,
  };
};

const useCreateApiPermission = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();

  const mutation = useMutation({
    mutationFn: (data: {
      partner_id: number;
      api_id: number;
      category_id?: number;
      is_enabled: boolean;
    }) => apiPermissionService.assignApiPermissions(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: {
        partner_id: number;
        api_id: number;
        category_id?: number;
        is_enabled: boolean;
      },
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          toast.success("API permissions assigned successfully");
          queryClient.invalidateQueries({ queryKey: ["api-permission"] });
          queryClient.invalidateQueries({ queryKey: ["providers"] });
          queryClient.invalidateQueries({
            queryKey: ["available-apis"],
            exact: false,
          });
          queryClient.invalidateQueries({ queryKey: ["report-count"] });
          queryClient.invalidateQueries({ queryKey: ["all-available-apis"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to assign API permissions");
        },
      });
    },
  };
};

const useUpdatedApiPermission = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();

  const mutation = useMutation({
    mutationFn: (data: {
      api_permission_id: number;
      partner_id: number;
      api_id: number;
      is_enabled: boolean;
    }) =>
      apiPermissionService.assignUpdatedApiPermissions(
        data.api_permission_id,
        data
      ),
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update API permissions");
    },
    onSuccess: () => {
      toast.success("API permissions updated successfully");
      queryClient.invalidateQueries({ queryKey: ["api-permission"] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({
        queryKey: ["available-apis"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["all-available-apis"] });
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

const useUpdateApiPermissionStatus = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();

  const mutation = useMutation({
    mutationFn: (data: { api_permission_ids: number[]; status: APIStatus }) =>
      apiPermissionService.updateApiPermissionStatus(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: { api_permission_ids: number[]; status: APIStatus },
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          const statusText =
            variables.status === APIStatus.ENABLED ? "Enabled" : "Disabled";
          toast.success(`API permission ${statusText} successfully`);
          queryClient.invalidateQueries({ queryKey: ["api-permission"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update permission status"
          );
        },
      });
    },
  };
};

export const usePartners = () => {
  const [searchValue, setSearchValue] = useState("");

  const partnersQuery = useInfiniteScroll({
    queryKey: ["providers"],
    queryFn: ({ pageParam, search }: { pageParam: number; search?: string }) =>
      apiPermissionService.getPartners({ pageParam, search }),
    searchValue,
  });

  return {
    ...partnersQuery,
    searchValue,
    setSearchValue,
  };
};

export const useApis = (partnerId?: number, categoryId?: number | null) => {
  const [searchValue, setSearchValue] = useState("");

  const apisQuery = useInfiniteScroll({
    queryKey: [
      "available-apis",
      partnerId?.toString() || "",
      categoryId?.toString() || "",
    ],
    queryFn: ({ pageParam, search }: { pageParam: number; search?: string }) =>
      apiPermissionService.getAvailableApis({
        pageParam,
        search,
        partner_id: partnerId,
        category_id: categoryId || undefined,
      }),
    searchValue,
    enabled: !!partnerId,
  });

  return {
    ...apisQuery,
    searchValue,
    setSearchValue,
  };
};

export const useAllApis = () => {
  const [searchValue, setSearchValue] = useState("");

  const apisQuery = useInfiniteScroll({
    queryKey: ["all-available-apis"],
    queryFn: ({ pageParam, search }: { pageParam: number; search?: string }) =>
      apiPermissionService.getAvailableApis({ pageParam, search }),
    searchValue,
    enabled: true,
  });

  return {
    ...apisQuery,
    searchValue,
    setSearchValue,
  };
};

const useDeleteApiPermission = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (apiPermissionIds: number[]) =>
      apiPermissionService.deleteApiPermission(apiPermissionIds),
  });

  return {
    ...mutation,
    mutation: (
      variables: any,
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          toast.success("API permission(s) deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["api-permission"] });
          queryClient.invalidateQueries({ queryKey: ["providers"] });
          queryClient.invalidateQueries({
            queryKey: ["available-apis"],
            exact: false,
          });
          queryClient.invalidateQueries({ queryKey: ["all-available-apis"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to delete API permission(s)"
          );
        },
      });
    },
  };
};

export const useApiPermissionMutation = {
  useFetchApiPermission,
  useCreateApiPermission,
  useUpdateApiPermissionStatus,
  useDeleteApiPermission,
  useApis,
  usePartners,
  useAllApis,
  useUpdatedApiPermission,
};

// Utility function to force refetch all API-related data
export const refetchAllApiData = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: ["api-permission"] });
  queryClient.invalidateQueries({ queryKey: ["providers"] });
  queryClient.invalidateQueries({ queryKey: ["available-apis"], exact: false });
  queryClient.invalidateQueries({ queryKey: ["all-available-apis"] });
};

export default useApiPermissionMutation;
