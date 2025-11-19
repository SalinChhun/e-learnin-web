import {z} from "zod";

export const createUserSchema = z.object({
    full_name: z.string().nonempty("Full name is required"),
    department: z.string().optional(),
    email: z.string().email("Please enter a valid email").nonempty("Email is required"),
    username: z.string().min(3, "Username must be at least 3 characters").nonempty("Username is required")  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores (_)"),
    password: z.string().nonempty("Password is required").refine(
        (value) => {
            //TODO: Check if password is at least 15 characters long (no additional requirements)
            if (value.length >= 15) return true;

            //TODO: If less than 15 but at least 8, check for letters, numbers, and special characters
            if (value.length >= 8) {
                const hasLetters = /[a-zA-Z]/.test(value);
                const hasNumbers = /\d/.test(value);
                const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

                //TODO: For your system-generated password (OBP!@#$%), we should allow it
                if (value.startsWith("OBP!@#$%")) return true;

                return hasLetters && hasNumbers && hasSpecialChars;
            }

            return false;
        },
        {
            message: "Password must be at least 8 characters with letters, numbers, and special characters",
        }
    ),
    confirm_password: z.string().optional(),
    image: z.any().optional(),
    role: z.union([z.string(), z.number()])
        .transform((val) => String(val))
        .refine((val) => val.trim() !== "", { message: "Role is required" }),
    status: z.string().nonempty("Status is required"),
    is_generated_password: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
    //TODO: Only validate password confirmation if not using generated password
    if (!data.is_generated_password && data.password !== data.confirm_password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Passwords must match",
            path: ["confirm_password"],
        });
    }
});


export const updateUserSchema = z.object({
    full_name: z.string().nonempty("Full name is required"),
    department: z.string().optional(),
    email: z.string().email("Please enter a valid email").nonempty("Email is required"),
    username: z.string().min(3, "Username must be at least 3 characters").nonempty("Username is required"),
    image: z.any().optional(),
    role: z.union([z.string(), z.number()])
        .transform((val) => String(val))
        .refine((val) => val.trim() !== "", { message: "Role is required" }),
    status: z.string().nonempty("Status is required"),
    image_removed: z.boolean().optional().default(false),
})