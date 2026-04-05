import { z } from "zod";

export const adminSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .regex(/^[A-Za-z\s]+$/, "Name should contain only letters"),

    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),

    password: z
        .string()
        .min(10, "Password must be at least 10 characters")
        .max(10, "Password cannot exceed 10 characters"),
});