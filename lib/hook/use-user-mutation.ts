import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import userService from "@/service/user.service";
import toast from "@/utils/toastService";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSessionStorage } from "@/lib/hook/use-session-storage";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { localStroageEnum } from "../enums/enums";
import { changeUserPassword } from "@/lib/types/user";
import { usePopupStore } from "@/lib/store";
import { useInfiniteScroll } from "./useInfiniteScroll";

const useCreateUser = () => {
  const { closePopup } = usePopupStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => userService.createUser(data),
    onError: (error: any) => {
      toast.error(error?.message);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["report-count"] });
      toast.success("Create user successfully");
      closePopup();
    },
  });

  return {
    mutation: mutation.mutate,
    isSuccess: mutation.isSuccess,
    isLoading: mutation.isPending,
  };
};

const useFetchUsers = () => {
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
      sort_columns: params.get("sort_columns") || "id:desc",
    }),
    [pageSize, params, storeValue]
  );

  const [userQuery] = useQueries({
    queries: [
      {
        queryKey: ["users", { requestParams }],
        queryFn: () => userService.getUsers(requestParams),
      },
    ],
  });

  return {
    userQuery,
  };
};

const useUsernameCheck = () => {
  const [apiError, setApiError] = useState<any>(null);
  const [suggestions, setApiSuggestions] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (data: any) => userService.usernameCheck(data),
    onError: (error: any) => {
      setApiError(error);
      if (error?.data && Array.isArray(error.data)) {
        setApiSuggestions(error.data);
      } else {
        setApiSuggestions([]);
      }
    },
    onSuccess: () => {
      setApiError(null);
      setApiSuggestions([]);
    },
  });

  return {
    mutation: mutation.mutate,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    apiError,
    suggestions,
  };
};

const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (data: any) => userService.updateUser(data),
    onError: (error: any) => {
      toast.error(error?.message);
    },
    onSuccess: (data: any) => {
      toast.success("Update user successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
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

const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (data: any) => userService.deleteUser(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: any,
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          toast.success("Delete user successfully");
          queryClient.invalidateQueries({ queryKey: ["users"] });
          queryClient.invalidateQueries({ queryKey: ["report-count"] });
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

const useUpdateStatusUserInactive = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (data: any) => userService.updateUserStatusInactive(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: any,
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          toast.success("Inactive user successfully");
          queryClient.invalidateQueries({ queryKey: ["users"] });
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

const useUpdateStatusUserActive = () => {
  const queryClient = useQueryClient();
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: (data: any) => userService.updateUserStatusActive(data),
  });

  return {
    ...mutation,
    mutation: (
      variables: any,
      options?: { onSuccess?: (data: any) => void }
    ) => {
      mutation.mutate(variables, {
        onSuccess: (data) => {
          toast.success("Active user successfully");
          queryClient.invalidateQueries({ queryKey: ["users"] });
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

const useResetUserPassword = () => {
  const { closePopup } = usePopupStore();
  const mutation = useMutation({
    mutationFn: ({
      userId,
      requestBody,
    }: {
      userId: number;
      requestBody: changeUserPassword;
    }) => userService.resetUserPassword(userId, requestBody),
    onError: (error: any) => {
      toast.error(error?.message);
    },
    onSuccess: (data: any) => {
      toast.success("Reset password user successfully");
      closePopup();
    },
  });

  return {
    mutation: mutation.mutate,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isLoading: mutation.isPending,
  };
};

/**
 * Hook to fetch users with infinite scroll for dropdown selection
 */
export const useUsers = (enabled: boolean = false) => {
  const [searchValue, setSearchValue] = useState("");

  const usersQuery = useInfiniteScroll({
    queryKey: ["users-dropdown"],
    queryFn: ({ pageParam, search }: { pageParam: number; search?: string }) =>
      userService.getUsersForDropdown({ pageParam, search: search || "" }) as any,
    searchValue,
    enabled,
  });

  return {
    ...usersQuery,
    searchValue,
    setSearchValue,
  };
};

export const useUserMutation = {
  useCreateUser,
  useFetchUsers,
  useUsernameCheck,
  useUpdateUser,
  useDeleteUser,
  useUpdateStatusUserInactive,
  useUpdateStatusUserActive,
  useResetUserPassword,
  useUsers,
};

export default useUserMutation;
