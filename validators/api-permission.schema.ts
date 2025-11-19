// schemas/api-permission.schema.ts

import { z } from 'zod';

export const assignApiPermissionSchema = z.object({
    partner_id: z
        .string()
        .min(1, 'Partner is required')
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val > 0, 'Invalid partner selection'),

    api_ids: z
        .array(z.string())
        .min(1, 'At least one API must be selected')
        .transform(val => val.map(id => parseInt(id, 10)))
        .refine(val => val.every(id => !isNaN(id) && id > 0), 'Invalid API selection'),

    status: z.boolean().default(true),
});

export type AssignApiPermissionInput = z.input<typeof assignApiPermissionSchema>;
export type AssignApiPermissionOutput = z.output<typeof assignApiPermissionSchema>;