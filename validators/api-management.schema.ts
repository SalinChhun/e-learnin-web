import { z } from 'zod';

// HTTP method validation
const httpMethodSchema = z.enum([
  'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'
], {
  errorMap: () => ({ message: 'Invalid HTTP method' })
});

export const createApiManagementSchema = z.object({
  provider_id: z
    .union([z.string(), z.number()])
    .refine((v) => String(v).trim().length > 0, 'Provider is required')
    .transform((v) => (typeof v === 'number' ? v : parseInt(v, 10)))
    .pipe(z.number().int('Provider must be a number').positive('Provider must be a positive number')),

  config_id: z
    .union([z.string(), z.number()])
    .refine((v) => String(v).trim().length > 0, 'Auth config is required')
    .transform((v) => (typeof v === 'number' ? v : parseInt(v, 10)))
    .pipe(z.number().int('Auth config must be a number').positive('Auth config must be a positive number')),

  api_name: z
    .string()
    .min(1, 'API name is required')
    .max(100, 'API name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'API name can only contain letters, numbers, spaces, hyphens, and underscores'),

  service_id: z
    .string()
    .min(1, 'Service ID is required')
    .max(50, 'Service ID must be less than 50 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Service ID must be letters and numbers only (e.g., CEB001, Feb002)'),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  method: httpMethodSchema,

  is_enable: z.boolean(),

  api_endpoint_url: z
    .string()
    .min(1, 'API endpoint URL is required')
    .regex(/^\/[a-zA-Z0-9\/\{\}\-_]*$/, 'Endpoint must start with / and contain valid path characters (e.g., /api/v1/auth/login, /api/v1/users/{id})'),
});

export type CreateApiManagementInput = z.input<typeof createApiManagementSchema>;
export type CreateApiManagementOutput = z.output<typeof createApiManagementSchema>;

// Update schema (same as create for now)
export const updateApiManagementSchema = createApiManagementSchema;

export type UpdateApiManagementInput = z.input<typeof updateApiManagementSchema>;
export type UpdateApiManagementOutput = z.output<typeof updateApiManagementSchema>;

// Bulk status update schema
export const bulkStatusUpdateSchema = z.object({
  config_ids: z
    .array(z.number().int().positive())
    .min(1, 'At least one API management must be selected')
    .max(100, 'Cannot update more than 100 items at once'),
  
  is_enable: z.boolean(),
});

export type BulkStatusUpdateInput = z.input<typeof bulkStatusUpdateSchema>;
export type BulkStatusUpdateOutput = z.output<typeof bulkStatusUpdateSchema>;

// Bulk delete schema
export const bulkDeleteSchema = z
  .array(z.number().int().positive())
  .min(1, 'At least one API management must be selected')
  .max(100, 'Cannot delete more than 100 items at once');

export type BulkDeleteInput = z.input<typeof bulkDeleteSchema>;
export type BulkDeleteOutput = z.output<typeof bulkDeleteSchema>;
