import { z } from "zod";
import { commonSchemas } from "../../core/validation/schemas.ts";

const MAX_LOCATION_LENGTH = 255;

export const createRestaurantSchema = z.object({
  name: commonSchemas.name,
  slug: commonSchemas.slug,
});

export const updateRestaurantSchema = z.object({
  name: commonSchemas.name.optional(),
  slug: commonSchemas.slug.optional(),
  location: z.string().max(MAX_LOCATION_LENGTH, "Location too long").trim().optional().or(z.literal("")),
  contactEmail: commonSchemas.email.optional().or(z.literal("")),
  contactPhone: commonSchemas.phone,
  primaryColor: commonSchemas.hexColor.optional(),
  backgroundColor: commonSchemas.hexColor.optional(),
  logoUrl: commonSchemas.url,
  headerImageUrl: commonSchemas.url,
});

export const restaurantIdParamSchema = z.object({
  id: commonSchemas.id,
});

export const restaurantSlugParamSchema = z.object({
  slug: commonSchemas.slug,
});
