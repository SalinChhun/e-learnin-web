import { Pagination } from "./common";

export interface Provider {
  provider_id: number;
  partner_name: string;
  partner_code: string | null;
}

export interface ApiItem {
  api_id: number;
  api_name: string;
  api_endpoint: string;
  category?: string;
}

export interface AssignApiPermissionFormData {
  partner_id: string;
  partner: Provider | null;
  api_ids: string[];
  apis: ApiItem[];
  status: boolean;
}


export interface ApiResponse<T> {
  data: {
    providers?: Provider[];
    apis?: ApiItem[];
    api_permissions?: any[];
    categories?: { id: number; category_name: string }[];
    pagination: Pagination;
  };
  status: {
    code: number;
    message: string;
  };
}


export interface UseInfiniteScrollParams {
    queryKey: string[];
    queryFn: (params: { pageParam: number; search?: string }) => Promise<ApiResponse<any>>;
    searchValue?: string;
    enabled?: boolean;
}

