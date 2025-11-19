import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

// Create axios instance
const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track if a refresh is already in progress
let isRefreshing = false;
// Store failed requests to retry them after token refresh
let failedQueue: any[] = [];

// Process the failed queue when a new token is obtained
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Add a request interceptor to add auth token to all requests
http.interceptors.request.use(
    async (config) => {

        if (config.url && ['/api/wba/v1/auth/login', '/api/wba/v1/auth/refresh'].includes(config.url)) {
            return config;
        }

        try {
            const session = await getSession();
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }

            if (typeof window !== 'undefined') {
                config.headers['X-Client-User-Agent'] = window.navigator.userAgent;
            }

        } catch (error) {
            console.log('Error getting session:', error);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const response = error?.response;
        const originalRequest = error.config;

        if (error.response?.status === 401 &&
            originalRequest.url !== '/api/wba/v1/auth/login' &&
            originalRequest.url !== '/api/wba/v1/auth/refresh' &&
            !originalRequest._retry) {

            if (!isRefreshing) {
                isRefreshing = true;
                originalRequest._retry = true;

                try {
                    const session = await getSession() as Session;

                    if (session?.error) {
                        processQueue(new Error('Session expired'));

                        if (typeof window !== 'undefined') {
                            signOut({
                                callbackUrl: `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
                            });
                        }
                        return Promise.reject(error);
                    }

                    if (typeof window !== 'undefined') {
                        signOut({
                            callbackUrl: `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
                        });
                    }

                    return Promise.reject(error);
                } catch (refreshError) {
                    processQueue(refreshError);

                    if (typeof window !== 'undefined') {
                        signOut({
                            callbackUrl: `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
                        });
                    }

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return http(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
        } else {
            const data = response?.data
            const error = (data && data?.message) || response?.status?.text || data?.status?.message;

            return Promise.reject({
                message: error,
                data: data?.data,
                status: response?.status
            });
        }

        return Promise.reject(error);
    }
);

export { http };
