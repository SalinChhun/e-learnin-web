import { z } from 'zod';

export const optionSchema = z.object({
    option_text: z.string().min(1, 'Option text is required'),
    is_correct: z.boolean(),
    order_sequence: z.number().int().positive(),
});

export const questionSchema = z.object({
    question_text: z.string().min(1, 'Question text is required'),
    question_type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'], {
        errorMap: () => ({ message: 'Question type must be MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, or ESSAY' })
    }),
    points: z.number().int().positive('Points must be a positive number'),
    answer_explanation: z.string().optional(),
    order_sequence: z.number().int().positive(),
    image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    file_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    voice_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    options: z.array(optionSchema).optional().default([]),
}).superRefine((data, ctx) => {
    // For MULTIPLE_CHOICE and TRUE_FALSE, options are required
    if (data.question_type === 'MULTIPLE_CHOICE' || data.question_type === 'TRUE_FALSE') {
        if (!data.options || data.options.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'At least one option is required',
                path: []
            });
            return;
        }
        // At least one option must be correct
        if (!data.options.some(opt => opt.is_correct)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'At least one option must be marked as correct',
                path: []
            });
        }
    }
    // For SHORT_ANSWER and ESSAY, options are not required
});

export const createQuizSchema = z.object({
    title: z.string().min(1, 'Quiz title is required').max(200, 'Quiz title must be less than 200 characters'),
    description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
    type: z.enum(['1', '2'], {
        errorMap: () => ({ message: 'Quiz type must be selected' })
    }),
    course_id: z
        .union([z.string(), z.number()])
        .refine((v) => String(v).trim().length > 0, 'Course is required')
        .transform((v) => (typeof v === 'number' ? v : parseInt(v, 10)))
        .pipe(z.number().int('Course must be a number').positive('Course must be selected')),
    duration_minutes: z.number().int().positive('Duration must be a positive number'),
    passing_score: z.number().int().min(0, 'Passing score must be at least 0').max(100, 'Passing score cannot exceed 100'),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export type CreateQuizInput = z.input<typeof createQuizSchema>;
export type CreateQuizOutput = z.output<typeof createQuizSchema>;

