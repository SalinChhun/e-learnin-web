
export interface AuthRequest {
    username?: string;
    password?: string;
}

export interface AuthRefreshRequest {
    refresh_token: string;
}

export interface AuthResponse {
    data: {
        access_token: string;
        refresh_token: string;
        token_type: string;
    };
    status: {
        code: number;
        message: string;
    };
}

export interface AuthLoginOutRequest {
    access_token: string;
    refresh_token: string;
}