import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required").max(100, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required").max(100, "Name too long").optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  location: z.string().max(255, "Location too long").optional(),
  contactEmail: z.string().email("Invalid email").optional(),
  contactPhone: z.string().max(50, "Phone number too long").optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (use #RRGGBB)")
    .optional(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (use #RRGGBB)")
    .optional(),
  logoUrl: z.string().url("Invalid URL").optional(),
  headerImageUrl: z.string().url("Invalid URL").optional(),
});
