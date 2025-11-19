import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import toast from "@/utils/toastService";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSessionStorage } from "@/lib/hook/use-session-storage";
import dayjs from "dayjs";
import { useMemo } from "react";
import { usePopupStore } from "@/lib/store";
import { DateFormatEnum, localStroageEnum } from "../enums/enums";
import providerService from "@/service/provider.service";

const useCreateProvider = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();

  const mutation = useMutation({
    mutationFn: (data: any) => providerService.createProvider(data),
    onError: (error: any) => {
      toast.error(error?.message);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({ queryKey: ["report-count"] });
      toast.success("Create provider successfully");
      closePopup();
    },
  });

  return {
    mutation: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isSuccess: mutation.isSuccess,
    isLoading: mutation.isPending,
  };
};

const useFetchProviders = () => {
  const params = useSearchParams();
  const pageSize = params.get("page_size") || 10;
  const searchParams = useSearchParams();
  const session = useSession();

  const [storeValue] = useSessionStorage<{
    start_date?: string;
    end_date?: string;
  }>(`${localStroageEnum.DATEPICK}-${session?.data?.user.id}`, {
    start_date:
      searchParams.get("start_date") ??
      dayjs().subtract(1, "month").format(DateFormatEnum.DATE4),
    end_date:
      searchParams.get("end_date") ?? dayjs().format(DateFormatEnum.DATE4),
  });

  const requestParams = useMemo(
    () => ({
      page_size: +pageSize > 100 ? 100 : pageSize,
      page_number: params.get("page_number") || 0,
      search_value: params.get("search_value") || "",
      status: params.get("status") || "",
      business_type: params.get("business_type") || "",
      start_date: params.get("start_date") || storeValue?.start_date,
      end_date: params.get("end_date") || storeValue?.end_date,
      sort_columns: params.get("sort_columns") || "id:desc",
    }),
    [pageSize, params, storeValue]
  );

  const [providerQuery] = useQueries({
    queries: [
      {
        queryKey: ["providers", { requestParams }],
        queryFn: () => providerService.getProviders(requestParams),
      },
    ],
  });

  return {
    providerQuery,
  };
};

const useUpdateProvider = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (data: any) => providerService.updateProvider(data),
    onError: (error: any) => {
      toast.error(error?.message);
    },
    onSuccess: (data: any) => {
      toast.success("Update provider successfully");
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({ queryKey: ["api-permission"] });
      closePopup();
    },
  });

  return {
    mutation: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isLoading: mutation.isPending,
  };
};

const useUpdateStatusProviderInactive = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (data: any) => providerService.updateProviderStatusInactive(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: any,
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          toast.success("Inactive provider successfully");
          queryClient.invalidateQueries({ queryKey: ["providers"] });
          queryClient.invalidateQueries({ queryKey: ["api-permission"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(error?.message);
        },
      });
    },
  };
};

const useUpdateStatusProviderActive = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (data: any) => providerService.updateProviderStatusActive(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: any,
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          toast.success("Active provider successfully");
          queryClient.invalidateQueries({ queryKey: ["providers"] });
          queryClient.invalidateQueries({ queryKey: ["api-permission"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(error?.message);
        },
      });
    },
  };
};

const useDeleteProviders = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (data: any) => providerService.deleteProviders(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: any,
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          toast.success("Delete provider successfully");
          queryClient.invalidateQueries({ queryKey: ["providers"] });
          queryClient.invalidateQueries({ queryKey: ["report-count"] });
          queryClient.invalidateQueries({ queryKey: ["api-permission"] });
          closePopup();
          options?.onSuccess?.(data);
        },
        onError: (error: any) => {
          toast.error(error?.message);
        },
      });
    },
  };
};

export const useProviderMutation = {
  useCreateProvider,
  useFetchProviders,
  useUpdateProvider,
  useUpdateStatusProviderInactive,
  useUpdateStatusProviderActive,
  useDeleteProviders,
};

export default useProviderMutation;
