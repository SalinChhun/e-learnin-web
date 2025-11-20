import { z } from 'zod';

export const createCourseSchema = z.object({
  courseTitle: z
    .string()
    .min(1, 'Course title is required')
    .max(200, 'Course title must be less than 200 characters'),

  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),

  instructions: z
    .string()
    .max(500, 'Instructions must be less than 500 characters')
    .optional(),

  category: z
    .union([z.string(), z.number()])
    .refine((v) => String(v).trim().length > 0, 'Category is required')
    .transform((v) => (typeof v === 'number' ? v : parseInt(v, 10)))
    .pipe(z.number().int('Category must be a number').positive('Category must be selected')),

  duration: z
    .string()
    .min(1, 'Duration is required'),
    // .refine((v) => {
    //   const durationLower = v.toLowerCase().trim();
    //   const daysMatch = durationLower.match(/(\d+)\s*days?/);
    //   const hoursMatch = durationLower.match(/(\d+)\s*hours?/);
    //   return (daysMatch && parseInt(daysMatch[1], 10) > 0) || (hoursMatch && parseInt(hoursMatch[1], 10) > 0);
    // }, 'Duration must be in format like "4 days" or "8 hours"'),

  startDate: z
    .string()
    .min(1, 'Start date is required')
    .refine((v) => {
      const date = new Date(v);
      return !isNaN(date.getTime());
    }, 'Start date must be a valid date'),

  endDate: z
    .string()
    .min(1, 'End date is required')
    .refine((v) => {
      const date = new Date(v);
      return !isNaN(date.getTime());
    }, 'End date must be a valid date'),

  assignmentType: z
    .enum(['Individual', 'Team'], {
      errorMap: () => ({ message: 'Assignment type must be Individual or Team' })
    }),

  selectedAssignees: z
    .array(z.string())
    .optional()
    .default([]),

  enableCertificate: z
    .boolean()
    .optional()
    .default(false),

  certificateTemplate: z
    .union([z.string(), z.number()])
    .optional()
    .default(''),

  courseContent: z
    .string()
    .optional()
    .default(''),
}).refine(
  (data) => {
    // If enableCertificate is true, certificateTemplate must be provided
    if (data.enableCertificate) {
      const templateValue = data.certificateTemplate;
      if (!templateValue) return false;
      // Check if it's a valid number (either already a number or a string that can be parsed)
      const numValue = typeof templateValue === 'number' 
        ? templateValue 
        : parseInt(String(templateValue), 10);
      return !isNaN(numValue) && numValue > 0;
    }
    return true;
  },
  {
    message: 'Certificate template is required when certificate is enabled',
    path: ['certificateTemplate'],
  }
);

export type CreateCourseInput = z.input<typeof createCourseSchema>;
export type CreateCourseOutput = z.output<typeof createCourseSchema>;

