import type { CategoriesRepository } from "@modules/categories/categories.repository";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@modules/categories/categories.types";
import type { RestaurantsRepository } from "@modules/restaurants/restaurants.repository";
import { AppError } from "@shared/errors/app-error";
import { logger } from "@shared/utils/logger";

export class CategoriesService {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private restaurantsRepository: RestaurantsRepository,
  ) {}

  async getAllCategories(restaurantId: string, ownerId: string) {
    const hasOwnership = await this.restaurantsRepository.checkOwnership(restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    return this.categoriesRepository.findAllByRestaurant(restaurantId);
  }

  async getCategoryById(id: string, ownerId: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(category.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    return category;
  }

  async createCategory(restaurantId: string, ownerId: string, data: CreateCategoryRequest) {
    const hasOwnership = await this.restaurantsRepository.checkOwnership(restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    const category = await this.categoriesRepository.create(restaurantId, data);
    logger.info(`Category created: ${category.id}`);
    return category;
  }

  async updateCategory(id: string, ownerId: string, data: UpdateCategoryRequest) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(category.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    return this.categoriesRepository.update(id, data);
  }

  async deleteCategory(id: string, ownerId: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(category.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    await this.categoriesRepository.delete(id);
  }
}
