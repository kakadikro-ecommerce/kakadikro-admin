import { z } from "zod";

const nameSchema = z
    .string()
    .min(1, "Name is required")
    .regex(/^[A-Za-z\s]+$/, "Full name should contain only letters");

const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format");

const passwordSchema = z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password cannot exceed 32 characters");

export const adminCreateSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
});

export const adminUpdateSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema.optional(),
});
