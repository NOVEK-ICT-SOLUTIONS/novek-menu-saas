import { Router } from "express";
import { cacheMiddleware } from "../../core/middleware/cache.middleware.ts";
import { publicRateLimiter } from "../../core/middleware/rate-limit.middleware.ts";
import { validateParams } from "../../core/middleware/validation.middleware.ts";
import { restaurantsController } from "../../modules/restaurants/restaurants.controller.ts";
import { restaurantSlugParamSchema } from "../../modules/restaurants/restaurants.validation.ts";

const PUBLIC_CACHE_SECONDS = 300;

export const publicRouter = Router();

publicRouter.use(publicRateLimiter);

publicRouter.get(
  "/menu/:slug",
  validateParams(restaurantSlugParamSchema),
  cacheMiddleware(PUBLIC_CACHE_SECONDS),
  restaurantsController.getBySlug,
);
