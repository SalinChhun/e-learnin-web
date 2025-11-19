import { AuthLoginOutRequest, AuthRefreshRequest, AuthRequest } from "@/lib/types/auth";
import { http } from '@/utils/http';

const ServiceId = {
    LOGIN: '/api/wba/v1/auth/login',
    REFRESH: '/api/wba/v1/auth/refresh',
    LOGOUT: '/api/wba/v1/auth/logout',
};

/**
 * Login with credentials
 * @param data Login request with username and password
 * @returns Response with tokens
 */
const login = (data: AuthRequest) => {
    return http.post(ServiceId.LOGIN, data);
};

/**
 * Refresh the access token
 * @param data Refresh token request
 * @returns Response with new tokens
 */
const refresh = (data: AuthRefreshRequest) => {
    return http.post(ServiceId.REFRESH, data);
};

/**
 * Set authorization header with token
 * @param token Access token to use for authorization
 */
const setAuthHeader = (token: string | null) => {
    if (token) {
        http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete http.defaults.headers.common['Authorization'];
    }
};

/**
 * Parse JWT token to get payload
 * @param token JWT token
 * @returns Decoded payload
 */
const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (error) {
        console.error('Failed to parse JWT', error);
        return {};
    }
};

const loginOut = (data: AuthLoginOutRequest) => {
    return http.post(ServiceId.LOGOUT, data);
};

export const authService = {
    login,
    refresh,
    setAuthHeader,
    parseJwt,
    loginOut
};

export default authService;