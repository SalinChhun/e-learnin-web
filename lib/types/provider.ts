export interface Provider {
    id: string;
    name?: string;
    phone: string;
    email: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProviderRequest {
    name: string;
    phone: string;
    email: string;
    description?: string;
}

export interface UpdateProviderRequest extends ProviderRequest {
    provider_id: string;
}
