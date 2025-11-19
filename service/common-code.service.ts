import {http} from '@/utils/http';
import {BaseResponse, CommonCodeResponse} from "@/lib/types/common";

const ServiceId = {
    GET_COMMON_CODE: '/api/wba/v1/common/codes',
}

const getCommonCode = async (code: string) => {
    const response = await http.get<BaseResponse<CommonCodeResponse>>(ServiceId.GET_COMMON_CODE, {
        params: {
            group_code: code
        }
    });
    return response.data?.data;
}

const commonCodeService = {
    getCommonCode
}

export default commonCodeService;