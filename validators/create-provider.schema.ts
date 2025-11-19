import {z} from "zod";

export const createProviderSchema = z.object({
    name: z.string().nonempty("Provider name is required"),
    phone: z.string()
        .optional()
        .nullable()
        .refine(
            (value) => value === null || value === undefined || value === '' || /^\d{8,9}$/.test(value),
            { message: "Phone number must be 8 or 9 digits" }
        ),
    email: z.string().optional().refine(
        (value) => !value || z.string().email().safeParse(value).success,
        { message: "Please enter a valid email" }
    ),
    description: z.string().optional(),
});
