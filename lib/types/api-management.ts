import { Pagination } from "./common";

// API Management types

export interface ApiManagementItem {
  config_id: number;
  provider_name: string;
  method: string;
  url_endpoint: string;
  auth_config_name: string;
  description: string;
  service_id: string;
  last_modify: string;
  modify_by: string;
  status: string;
}

export interface ApiManagementDetail {
  provider_id: number;
  provider_name: string;
  config_id: number;
  config_name: string;
  api_name: string;
  service_id: string;
  description: string;
  method: string;
  is_enable: boolean;
  api_endpoint_url: string;
}

export interface CreateApiManagementFormData {
  provider_id: number;
  config_id: number;
  api_name: string;
  service_id: string;
  description?: string;
  method: string;
  is_enable: boolean;
  api_endpoint_url: string;
}

export interface ApiManagementResponse<T> {
  data: {
    api_managements?: ApiManagementItem[];
    pagination: Pagination;
    api_management_count?: {
      total: number;
      active: number;
      inactive: number;
    };
    api_management_count_by_date?: {
      [key: string]: number;
    };
  };
  status: {
    code: number;
    message: string;
  };
}

export interface AuthConfigResponse<T> {
  data: {
    auth_configs?: T[];
    pagination: Pagination;
  };
  status: {
    code: number;
    message: string;
  };
}

export interface AvailableApiManagement {
  config_id: number;
  api_name: string;
}

export interface UseInfiniteScrollParams {
  queryKey: string[];
  queryFn: (params: { pageParam: number; search?: string }) => Promise<ApiManagementResponse<any>>;
  searchValue?: string;
  enabled?: boolean;
}

// HTTP Method options for dropdown
export interface HttpMethodOption {
  value: string;
  label: string;
}

export const HTTP_METHODS: HttpMethodOption[] = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
  { value: "PATCH", label: "PATCH" },
  { value: "HEAD", label: "HEAD" },
  { value: "OPTIONS", label: "OPTIONS" },
];
