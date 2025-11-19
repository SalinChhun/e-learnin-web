import {http} from '@/utils/http';
import {ProviderRequest, UpdateProviderRequest} from "@/lib/types/provider";

const ServiceId = {
    PROVIDER: '/api/wba/v1/providers',
}

const createProvider = (data: ProviderRequest) => {
    return http.post(ServiceId.PROVIDER, data);
}

const getProviders =  async (param?: any) =>{

    const result = await http.get(ServiceId.PROVIDER, {
        params: { ...param }
    });

    return result.data?.data;
}

const updateProvider = (data: UpdateProviderRequest) => {
    return http.put(ServiceId.PROVIDER + `/${data?.provider_id}`, data);
}

const updateProviderStatusInactive = (providerIds: number[]) => {
    return http.patch(
        ServiceId.PROVIDER+"/inactive",providerIds
    );
}

const updateProviderStatusActive = (providerIds: number[]) => {
    return http.patch(
        ServiceId.PROVIDER+"/active",providerIds
    );
}

const deleteProviders = (providerIds: any) => {
    return http.delete(
        ServiceId.PROVIDER,
        {
            data: providerIds
        }
    );
}

const getProvidersValue =  async (param?: any) =>{

    const result = await http.get(ServiceId.PROVIDER +'/available', {
        params: { ...param }
    });

    return result.data?.data;
}


const providerService = {
    createProvider,
    getProviders,
    updateProvider,
    updateProviderStatusActive,
    updateProviderStatusInactive,
    deleteProviders,
    getProvidersValue
}
export default providerService;
