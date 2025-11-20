import { http } from '@/utils/http';

const ServiceId = {
    CERTIFICATE_TEMPLATES: '/api/wba/v1/certificate-templates',
}

interface GetCertificateTemplatesParams {
    status?: string | number;
    sort_columns?: string;
    page_number?: number;
    page_size?: number;
}

export interface CertificateTemplate {
    id: number;
    name: string;
    description: string;
    template_image_url: string;
    status: string;
    courses_using_count: number;
    created_at: string;
    updated_at: string;
    course_ids?: number[];
}

export interface CertificateTemplatesSummary {
    draftTemplates: number;
    totalTemplates: number;
    coursesUsing: number;
    activeTemplates: number;
}

interface CertificateTemplatesResponse {
    summary: CertificateTemplatesSummary;
    templates: CertificateTemplate[];
    totalPages: number;
    pageSize: number;
    hasPrevious: boolean;
    hasNext: boolean;
    currentPage: number;
    totalElements: number;
}

const getCertificateTemplates = async (params?: GetCertificateTemplatesParams) => {
    const queryParams: Record<string, any> = {
        sort_columns: params?.sort_columns || 'id:desc',
        page_number: params?.page_number || 0,
        page_size: params?.page_size || 10,
    };
    
    // Only add status if provided (1=DRAFT, 2=ACTIVE, 9=DELETE)
    if (params?.status !== undefined) {
        queryParams.status = params.status;
    }
    
    const result = await http.get(ServiceId.CERTIFICATE_TEMPLATES, {
        params: queryParams
    });

    return result.data?.data as CertificateTemplatesResponse;
}

interface CreateCertificateTemplateRequest {
    name: string;
    description: string;
    template_image_url: string;
    status: string; // "1" = draft, "2" = active
    course_ids?: number[];
}

const getCertificateTemplateById = async (templateId: string | number) => {
    const result = await http.get(`${ServiceId.CERTIFICATE_TEMPLATES}/${templateId}`);
    return result.data?.data;
}

const createCertificateTemplate = async (data: CreateCertificateTemplateRequest) => {
    const result = await http.post(ServiceId.CERTIFICATE_TEMPLATES, data);
    return result.data;
}

const updateCertificateTemplate = async (templateId: string | number, data: CreateCertificateTemplateRequest) => {
    const result = await http.put(`${ServiceId.CERTIFICATE_TEMPLATES}/${templateId}`, data);
    return result.data;
}

const deleteCertificateTemplate = async (templateId: string | number) => {
    const result = await http.delete(`${ServiceId.CERTIFICATE_TEMPLATES}/${templateId}`);
    return result.data;
}

const certificateTemplateService = {
    getCertificateTemplates,
    getCertificateTemplateById,
    createCertificateTemplate,
    updateCertificateTemplate,
    deleteCertificateTemplate,
}

export default certificateTemplateService;
export type { CertificateTemplatesResponse, CreateCertificateTemplateRequest };

