import { http } from "@/utils/http";
import { 
  ApiManagementResponse, 
  ApiManagementItem, 
  ApiManagementDetail,
  AvailableApiManagement,
  AuthConfigResponse
} from "@/lib/types/api-management";
import { Provider } from "@/lib/types/auth-config";

const ServiceId = {
  API_MANAGEMENT: "/api/wba/v1/api-managements",
  PROVIDER: "/api/wba/v1/providers",
  AUTH_CONFIG: "/api/wba/v1/auth-configs",
};

/**
 * Get all API managements with pagination and filtering
 */
const getApiManagements = async (params?: {
  page_number?: number;
  page_size?: number;
  search_value?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  sort_columns?: string;
}) => {
  const result = await http.get(ServiceId.API_MANAGEMENT, {
    params: { ...params },
  });

  return result.data?.data;
};

/**
 * Get available providers for dropdown selection
 */
const getProviders = async (params: {
  pageParam: number;
  search?: string;
  page_size?: number;
}): Promise<ApiManagementResponse<Provider>> => {
  const result = await http.get(ServiceId.PROVIDER + "/available", {
    params: {
      page_number: params.pageParam,
      page_size: params.page_size || 10,
      search_value: params.search || "",
    },
  });
  return result.data;
};

/**
 * Get available auth configs for dropdown selection
 */
const getAvailableAuthConfigs = async (params: {
  pageParam: number;
  search?: string;
  page_size?: number;
}): Promise<AuthConfigResponse<AvailableApiManagement>> => {
  const result = await http.get(ServiceId.AUTH_CONFIG + "/available", {
    params: {
      page_number: params.pageParam,
      page_size: params.page_size || 10,
      search_value: params.search || "",
    },
  });
  return result.data;
};

/**
 * Get available API managements for dropdown selection
 */
const getAvailableApiManagements = async (params: {
  pageParam: number;
  search?: string;
  page_size?: number;
}): Promise<ApiManagementResponse<AvailableApiManagement>> => {
  const result = await http.get(ServiceId.API_MANAGEMENT + "/available", {
    params: {
      page_number: params.pageParam,
      page_size: params.page_size || 10,
      search_value: params.search || "",
    },
  });
  return result.data;
};

/**
 * Create a new API management
 */
const createApiManagement = async (data: {
  provider_id: number;
  config_id: number;
  api_name: string;
  service_id: string;
  description?: string;
  method: string;
  is_enable: boolean;
  api_endpoint_url: string;
}) => {
  const result = await http.post(ServiceId.API_MANAGEMENT, {
    ...data,
    provider_id: typeof data.provider_id === 'number' ? data.provider_id : parseInt(data.provider_id, 10),
    config_id: typeof data.config_id === 'number' ? data.config_id : parseInt(data.config_id, 10)
  });
  return result.data;
};

/**
 * Update an existing API management
 */
const updateApiManagement = async (
  apiId: number,
  data: {
    provider_id: number;
    config_id: number;
    api_name: string;
    service_id: string;
    description?: string;
    method: string;
    is_enable: boolean;
    api_endpoint_url: string;
  }
) => {
  const result = await http.put(
    ServiceId.API_MANAGEMENT + `/${apiId}`,
    {
      ...data,
      provider_id: typeof data.provider_id === 'number' ? data.provider_id : parseInt(data.provider_id, 10),
      config_id: typeof data.config_id === 'number' ? data.config_id : parseInt(data.config_id, 10)
    }
  );
  return result.data;
};

/**
 * Update API management status (bulk operation)
 */
const updateApiManagementStatus = async (data: {
  config_ids: number[];
  is_enable: boolean;
}) => {
  const result = await http.patch(ServiceId.API_MANAGEMENT + "/status", {
    ids: data.config_ids,
    is_enable: data.is_enable,
  });
  return result.data;
};

/**
 * Delete API managements (bulk operation)
 */
const deleteApiManagements = async (configIds: number[]) => {
  const result = await http.delete(ServiceId.API_MANAGEMENT, {
    data: {
      ids: configIds,
    },
  });
  return result.data;
};

/**
 * Get API management by ID
 */
const getApiManagementById = async (apiId: number) => {
  const result = await http.get(ServiceId.API_MANAGEMENT + `/${apiId}`);
  return result.data?.data;
};

const apiManagementService = {
  getApiManagements,
  getProviders,
  getAvailableAuthConfigs,
  getAvailableApiManagements,
  createApiManagement,
  updateApiManagement,
  updateApiManagementStatus,
  deleteApiManagements,
  getApiManagementById,
};

export default apiManagementService;
