import { z } from "zod";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;
const MIN_SLUG_LENGTH = 3;
const MAX_SLUG_LENGTH = 50;
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

export const commonSchemas = {
  id: z.string().cuid(),

  email: z.string().email("Invalid email address").toLowerCase().trim(),

  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH, "Password too long"),

  slug: z
    .string()
    .min(MIN_SLUG_LENGTH, `Slug must be at least ${MIN_SLUG_LENGTH} characters`)
    .max(MAX_SLUG_LENGTH, `Slug must be at most ${MAX_SLUG_LENGTH} characters`)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),

  name: z
    .string()
    .min(MIN_NAME_LENGTH, "Name is required")
    .max(MAX_NAME_LENGTH, `Name must be at most ${MAX_NAME_LENGTH} characters`)
    .trim(),

  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`)
    .trim()
    .optional(),

  price: z.number().positive("Price must be positive"),

  url: z.string().url("Invalid URL").optional().or(z.literal("")),

  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),

  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),

  sortOrder: z.number().int().min(0).default(0),

  boolean: z.boolean().default(true),
} as const;
