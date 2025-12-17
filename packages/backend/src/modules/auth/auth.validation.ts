import { z } from "zod";
import { commonSchemas } from "../../core/validation/schemas.ts";

export const registerSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
});

export const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
