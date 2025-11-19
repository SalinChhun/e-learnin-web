import { APIStatus } from "@/lib/enums/enums";
import { ApiItem, ApiResponse, Provider } from "@/lib/types/api-permission";
import { http } from "@/utils/http";

const ServiceId = {
  API_PERMISSION: "/api/wba/v1/api-permissions",
  CLIENT: "/api/wba/v1/partners",
};

const getApiPermissions = async (param?: any) => {
  const result = await http.get(ServiceId.API_PERMISSION, {
    params: { ...param },
  });

  return result.data?.data;
};

const getPartners = async (params: {
  pageParam: number;
  search?: string;
  page_size?: number;
}): Promise<ApiResponse<Provider>> => {
  const result = await http.get(ServiceId.CLIENT + "/available", {
    params: {
      page_number: params.pageParam,
      page_size: params.page_size || 10,
      search_value: params.search || "",
    },
  });
  return result.data;
};

const getAvailableApis = async (params: {
  pageParam: number;
  search?: string;
  page_size?: number;
  partner_id?: number;
  category_id?: number;
}): Promise<ApiResponse<ApiItem>> => {
  const result = await http.get(ServiceId.API_PERMISSION + "/available", {
    params: {
      page_number: params.pageParam,
      page_size: params.page_size || 10,
      search_value: params.search || "",
      partner_id: params.partner_id,
      category_id: params.category_id,
    },
  });
  return result.data;
};

const assignApiPermissions = async (data: {
  partner_id: number;
  api_id: number;
  is_enabled: boolean;
}) => {
  const result = await http.post(ServiceId.API_PERMISSION, data);
  return result.data;
};

const assignUpdatedApiPermissions = async (
  api_permission_id: number,
  data: {
    partner_id: number;
    api_id: number;
    is_enabled: boolean;
  }
) => {
  const result = await http.put(
    ServiceId.API_PERMISSION + `/${api_permission_id}`,
    data
  );
  return result.data;
};

const updateApiPermissionStatus = async (data: {
  api_permission_ids: number[];
  status: APIStatus;
}) => {
  const result = await http.patch(ServiceId.API_PERMISSION + "/status", data);
  return result.data;
};

const deleteApiPermission = async (apiPermissionIds: number[]) => {
  const result = await http.delete(ServiceId.API_PERMISSION, {
    data: { api_permission_ids: apiPermissionIds },
  });
  return result.data;
};

const getPartnerApiPermissions = async (partner_id: number) => {
  const result = await http.get(
    ServiceId.API_PERMISSION + `/partner/${partner_id}`
  );
  return result.data?.data;
};

const apiPermissionService = {
  getApiPermissions,
  getPartners,
  getAvailableApis,
  assignApiPermissions,
  updateApiPermissionStatus,
  deleteApiPermission,
  getPartnerApiPermissions,
  assignUpdatedApiPermissions,
};

export default apiPermissionService;
