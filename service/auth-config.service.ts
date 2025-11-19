import { APIStatus } from "@/lib/enums/enums";
// Auth config service
import { AuthConfigItem, AuthConfigResponse, Provider } from "../lib/types/auth-config";
import { http } from "@/utils/http";

const ServiceId = {
  AUTH_CONFIG: "/api/wba/v1/auth-configs",
  PROVIDER: "/api/wba/v1/providers",
  AUTH_TYPES: "/api/wba/v1/auth-types",
};

const getAuthConfigs = async (param?: any) => {
  const result = await http.get(ServiceId.AUTH_CONFIG, {
    params: { ...param },
  });

  return result.data?.data;
};

const getProviders = async (params: {
  pageParam: number;
  search?: string;
  page_size?: number;
}): Promise<AuthConfigResponse<Provider>> => {
  const result = await http.get(ServiceId.PROVIDER + "/available", {
    params: {
      page_number: params.pageParam,
      page_size: params.page_size || 10,
      search_value: params.search || "",
    },
  });
  return result.data;
};

const getAvailableAuthConfigs = async (params: {
  pageParam: number;
  search?: string;
  page_size?: number;
}): Promise<AuthConfigResponse<AuthConfigItem>> => {
  const result = await http.get(ServiceId.AUTH_CONFIG + "/available", {
    params: {
      page_number: params.pageParam,
      page_size: params.page_size || 10,
      search_value: params.search || "",
    },
  });
  return result.data;
};

const getAuthTypes = async (): Promise<Array<{
  authTypeId: string;
  authTypeName: string;
  description?: string;
  isActive?: boolean;
  requiresEncryption?: boolean;
}>> => {
  const result = await http.get(ServiceId.AUTH_TYPES);
  // Assuming API returns { data: [...] } similar to other services
  return result.data?.data || result.data || [];
};

const createAuthConfig = async (data: {
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
}) => {
  const result = await http.post(ServiceId.AUTH_CONFIG, {
    ...data,
    provider_id: typeof data.provider_id === 'number' ? data.provider_id : parseInt(data.provider_id, 10)
  });
  return result.data;
};

const updateAuthConfig = async (
  configId: number,
  data: {
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
  }
) => {
  const result = await http.put(
    ServiceId.AUTH_CONFIG + `/${configId}`,
    {
      ...data,
      provider_id: typeof data.provider_id === 'number' ? data.provider_id : parseInt(data.provider_id, 10)
    }
  );
  return result.data;
};

const updateAuthConfigStatus = async (data: {
  config_ids: number[];
  is_enable: boolean;
}) => {
  const result = await http.patch(ServiceId.AUTH_CONFIG + "/status", {
    ids: data.config_ids,
    is_enable: data.is_enable,
  });
  return result.data;
};

const deleteAuthConfig = async (configIds: number[]) => {
  const result = await http.delete(ServiceId.AUTH_CONFIG, {
    data: {
      ids: configIds,
    },
  });
  return result.data;
};

const getAuthConfigById = async (configId: number) => {
  const result = await http.get(ServiceId.AUTH_CONFIG + `/${configId}`);
  return result.data?.data;
};

const authConfigService = {
  getAuthConfigs,
  getProviders,
  getAvailableAuthConfigs,
  getAuthTypes,
  createAuthConfig,
  updateAuthConfig,
  updateAuthConfigStatus,
  deleteAuthConfig,
  getAuthConfigById,
};

export default authConfigService;
