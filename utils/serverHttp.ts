// src/utils/server-http.ts
import axios, { AxiosRequestConfig } from 'axios';
import { cookies } from 'next/headers';

// Create a server-side axios instance
export const serverHttp = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Server-side request function with type safety
export async function serverRequest<T>(
    url: string,
    options: AxiosRequestConfig = {}
): Promise<T> {
    try {
        // Get cookies from the server context
        const cookieStore = cookies();
        const token = (await cookieStore).get('auth-token')?.value;

        // Add auth header if token exists
        const headers = {
            ...options.headers,
            ...(token && { Authorization: `Bearer ${token}` })
        };

        const response = await serverHttp({
            url,
            ...options,
            headers
        });

        return response.data;
    } catch (error) {
        console.error('Server request failed:', error);
        throw error;
    }
}