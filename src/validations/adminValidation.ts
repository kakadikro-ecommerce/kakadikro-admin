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
    .min(10, "Password must be at least 10 characters")
    .max(15, "Password cannot exceed 15 characters")
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
        "Password must include uppercase, lowercase, number, and special character"
    );

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

export const changePasswordSchema = z.object({
  currentPassword: z.string().trim().min(1, "Current password required"),
  newPassword: passwordSchema,
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Valid email is required")
    .email("Valid email is required"),

  password: z
    .string()
    .trim()
    .min(1, "Password is required"),
});
