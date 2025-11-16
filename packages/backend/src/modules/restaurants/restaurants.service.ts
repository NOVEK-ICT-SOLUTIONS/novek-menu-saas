import type { RestaurantsRepository } from "@modules/restaurants/restaurants.repository";
import type { CreateRestaurantRequest, UpdateRestaurantRequest } from "@modules/restaurants/restaurants.types";
import { AppError } from "@shared/errors/app-error";
import { logger } from "@shared/utils/logger";

export class RestaurantsService {
  constructor(private restaurantsRepository: RestaurantsRepository) {}

  async getAllRestaurants(ownerId: string) {
    logger.info(`Fetching all restaurants for owner: ${ownerId}`);
    return this.restaurantsRepository.findAll(ownerId);
  }

  async getRestaurantById(id: string, ownerId: string) {
    logger.info(`Fetching restaurant: ${id}`);
    const restaurant = await this.restaurantsRepository.findById(id);
    if (!restaurant) {
      throw new AppError("Restaurant not found", 404);
    }
    if (restaurant.ownerId !== ownerId) {
      throw new AppError("Unauthorized to access this restaurant", 403);
    }
    return restaurant;
  }

  async getRestaurantBySlug(slug: string) {
    logger.info(`Fetching restaurant by slug: ${slug}`);
    const restaurant = await this.restaurantsRepository.findBySlug(slug);
    if (!restaurant) {
      throw new AppError("Restaurant not found", 404);
    }
    return restaurant;
  }

  async trackQRScan(restaurantId: string, ipAddress?: string, userAgent?: string) {
    logger.info(`Tracking QR scan for restaurant: ${restaurantId}`);
    await this.restaurantsRepository.trackQRScan(restaurantId, ipAddress, userAgent);
  }

  async createRestaurant(ownerId: string, data: CreateRestaurantRequest) {
    logger.info(`Creating restaurant: ${data.name} for owner: ${ownerId}`);
    const slugExists = await this.restaurantsRepository.checkSlugExists(data.slug);
    if (slugExists) {
      throw new AppError("Restaurant with this slug already exists", 409);
    }
    const restaurant = await this.restaurantsRepository.create(ownerId, data.name, data.slug);
    logger.info(`Restaurant created: ${restaurant.id}`);
    return restaurant;
  }

  async updateRestaurant(id: string, ownerId: string, data: UpdateRestaurantRequest) {
    logger.info(`Updating restaurant: ${id}`);
    const hasOwnership = await this.restaurantsRepository.checkOwnership(id, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized to update this restaurant", 403);
    }
    if (data.slug) {
      const existingRestaurant = await this.restaurantsRepository.findBySlug(data.slug);
      if (existingRestaurant && existingRestaurant.id !== id) {
        throw new AppError("Restaurant with this slug already exists", 409);
      }
    }
    const restaurant = await this.restaurantsRepository.update(id, data);
    logger.info(`Restaurant updated: ${id}`);
    return restaurant;
  }

  async deleteRestaurant(id: string, ownerId: string) {
    logger.info(`Deleting restaurant: ${id}`);
    const hasOwnership = await this.restaurantsRepository.checkOwnership(id, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized to delete this restaurant", 403);
    }
    await this.restaurantsRepository.delete(id);
    logger.info(`Restaurant deleted: ${id}`);
  }

  async getOwnerStats(ownerId: string) {
    logger.info(`Fetching stats for owner: ${ownerId}`);
    const stats = await this.restaurantsRepository.getOwnerStats(ownerId);
    return stats;
  }
}
