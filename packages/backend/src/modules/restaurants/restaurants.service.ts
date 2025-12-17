import { restaurantsRepository } from "./restaurants.repository.ts";
import type {
  CreateRestaurantRequest,
  OwnerStats,
  RestaurantResponse,
  RestaurantWithCategories,
  UpdateRestaurantRequest,
} from "./restaurants.types.ts";
import { ConflictError, ForbiddenError, NotFoundError } from "../../core/errors/base.error.ts";
import { tenantContext } from "../../core/context/tenant.context.ts";

export const restaurantsService = {
  getAll: async (): Promise<RestaurantResponse[]> => {
    const userId = tenantContext.getUserId();
    return restaurantsRepository.findAllByOwner(userId);
  },

  getById: async (id: string): Promise<RestaurantWithCategories> => {
    const userId = tenantContext.getUserId();
    const restaurant = await restaurantsRepository.findById(id);

    if (!restaurant) {
      throw new NotFoundError("Restaurant");
    }

    if (restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this restaurant");
    }

    return restaurant as RestaurantWithCategories;
  },

  getBySlug: async (slug: string): Promise<RestaurantWithCategories> => {
    const restaurant = await restaurantsRepository.findBySlug(slug);

    if (!restaurant) {
      throw new NotFoundError("Restaurant");
    }

    return restaurant as RestaurantWithCategories;
  },

  create: async (data: CreateRestaurantRequest): Promise<RestaurantResponse> => {
    const userId = tenantContext.getUserId();

    const existingSlug = await restaurantsRepository.slugExists(data.slug);
    if (existingSlug) {
      throw new ConflictError("Restaurant with this slug already exists");
    }

    return restaurantsRepository.create(userId, data.name, data.slug);
  },

  update: async (id: string, data: UpdateRestaurantRequest): Promise<RestaurantResponse> => {
    const userId = tenantContext.getUserId();
    const restaurant = await restaurantsRepository.findByIdSimple(id);

    if (!restaurant) {
      throw new NotFoundError("Restaurant");
    }

    if (restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this restaurant");
    }

    if (data.slug) {
      const existingSlug = await restaurantsRepository.slugExists(data.slug, id);
      if (existingSlug) {
        throw new ConflictError("Restaurant with this slug already exists");
      }
    }

    return restaurantsRepository.update(id, data);
  },

  delete: async (id: string): Promise<void> => {
    const userId = tenantContext.getUserId();
    const restaurant = await restaurantsRepository.findByIdSimple(id);

    if (!restaurant) {
      throw new NotFoundError("Restaurant");
    }

    if (restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this restaurant");
    }

    await restaurantsRepository.delete(id);
  },

  getStats: async (): Promise<OwnerStats> => {
    const userId = tenantContext.getUserId();
    return restaurantsRepository.getOwnerStats(userId);
  },

  trackQrScan: async (restaurantId: string, ipAddress?: string, userAgent?: string): Promise<void> => {
    await restaurantsRepository.trackQrScan(restaurantId, ipAddress, userAgent);
  },
};
