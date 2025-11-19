// schemas/auth-config.schema.ts

import { z } from 'zod';

export const createAuthConfigSchema = z.object({
    config_name: z
        .string()
        .trim()
        .min(1, 'Config name is required')
        .max(100, 'Config name must be less than 100 characters'),

    provider_id: z
        .union([z.string(), z.number()])
        .refine((v) => String(v).trim().length > 0, 'Provider is required')
        .transform((v) => (typeof v === 'number' ? v : parseInt(v, 10)))
        .pipe(z.number().int('Provider must be a number')),

    auth_config_id: z
        .string()
        .min(3, 'Auth config ID must be at least 3 characters long')
        .max(10, 'Auth config ID must be no more than 10 characters long')
        .regex(/^[A-Z0-9]+$/, 'Auth config ID must contain only uppercase letters and numbers (no spaces allowed)'),

    env: z
        .string()
        .min(1, 'Environment is required'),

    is_enable: z.boolean(),

    base_url: z
        .string()
        .min(1, 'Base URL is required')
        .regex(/^https?:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:\/.*)?$/, 'Enter a valid URL, e.g., https://api.example.com'),

    auth_type: z.string().optional(),

    // Optional fields based on auth type
    client_id: z.string().optional()
        .refine((val) => !val || val.trim().length >= 3, "Client ID must be at least 3 characters long")
        .refine((val) => !val || /^[a-zA-Z0-9_-]+$/.test(val), "Client ID can only contain letters, numbers, underscores, and hyphens"),
    
    client_secret: z.string().optional()
        .refine((val) => !val || val.length >= 8, "Client secret must be at least 8 characters long")
        .refine((val) => !val || val.length <= 128, "Client secret must be less than 128 characters")
        .refine((val) => !val || !/\s/.test(val), "Client secret cannot contain spaces"),
    
    token_url: z.string().optional()
        .refine((val) => !val || val.startsWith('/'), "Token URL must start with '/' (e.g., /api/v1, /v1/{id})")
        .refine((val) => !val || /^\/[a-zA-Z0-9\/_{}.-]*$/.test(val), "Token URL must be a valid endpoint path (e.g., /api/v1, /v1/{id})")
        .or(z.literal('')),
    
    username: z.string().optional()
        .refine((val) => !val || (val.trim().length >= 2 && val.trim().length <= 50), "Username must be 2-50 characters long")
        .refine((val) => !val || /^[a-zA-Z0-9._-]+$/.test(val), "Username can only contain letters, numbers, dots, underscores, and hyphens"),
    
    password: z.string().optional()
        .refine((val) => !val || (val.length >= 6 && val.length <= 100), "Password must be 6-100 characters long")
        .refine((val) => !val || !/\s/.test(val), "Password cannot contain spaces"),
}).refine((data) => {
    // If auth_type is 'jwt' or 'oauth2', client_id and client_secret are required
    if (data.auth_type === 'jwt' || data.auth_type === 'oauth2') {
        return data.client_id && data.client_secret && 
               data.client_id.trim().length > 0 && data.client_secret.length > 0;
    }
    // If auth_type is 'basic', username and password are required
    if (data.auth_type === 'basic') {
        return data.username && data.password && 
               data.username.trim().length > 0 && data.password.length > 0;
    }
    return true;
}, {
    message: "Required fields are missing for the selected auth type",
    path: ["auth_type"]
});

export type CreateAuthConfigInput = z.input<typeof createAuthConfigSchema>;
export type CreateAuthConfigOutput = z.output<typeof createAuthConfigSchema>;
