import { Pagination } from "./common";
// Auth config types

export interface Provider {
  provider_id: number;
  provider_name: string;
  partner_code: string | null;
}

export interface AuthConfigItem {
  config_id: number;
  config_name: string;
  client_name?: string;
  env: string;
  auth_type: string;
  base_url: string;
  created_at?: string;
  updated_at?: string;
  status: string;
}

export interface AuthConfigDetail {
  config_name: string;
  provider_id: number;
  provider_name: string;
  config_json: {
    client_id?: string;
    client_secret?: string;
    token_url?: string;
    baseUrl?: string;
    username?: string;
    password?: string;
  };
}

export interface CreateAuthConfigFormData {
  config_name: string;
  provider_id: string;
  auth_config_id: string;
  provider: Provider | null;
  env: string;
  is_enable: boolean;
  base_url: string;
  auth_type: string;
  client_id?: string;
  client_secret?: string;
  token_url?: string;
  username?: string;
  password?: string;
}

export interface AuthConfigResponse<T> {
  data: {
    providers?: Provider[];
    auth_configs?: AuthConfigItem[];
    pagination: Pagination;
    auth_config_count?: {
      total: number;
      enable: number;
      disable: number;
    };
    auth_config_count_by_date?: {
      today: number;
      this_week: number;
      this_month: number;
    };
  };
  status: {
    code: number;
    message: string;
  };
}

export interface UseInfiniteScrollParams {
    queryKey: string[];
    queryFn: (params: { pageParam: number; search?: string }) => Promise<AuthConfigResponse<any>>;
    searchValue?: string;
    enabled?: boolean;
}
