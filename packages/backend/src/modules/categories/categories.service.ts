import { tenantContext } from "../../core/context/tenant.context.ts";
import { ConflictError, ForbiddenError, NotFoundError } from "../../core/errors/base.error.ts";
import { categoriesRepository } from "./categories.repository.ts";
import type {
  CategoryResponse,
  CategoryWithItems,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./categories.types.ts";

export const categoriesService = {
  getAllByRestaurant: async (restaurantId: string): Promise<CategoryWithItems[]> => {
    const userId = tenantContext.getUserId();
    const restaurant = await categoriesRepository.getRestaurantOwnerId(restaurantId);

    if (!restaurant) {
      throw new NotFoundError("Restaurant");
    }

    if (restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this restaurant");
    }

    return categoriesRepository.findAllByRestaurant(restaurantId) as Promise<CategoryWithItems[]>;
  },

  getById: async (id: string): Promise<CategoryWithItems> => {
    const userId = tenantContext.getUserId();
    const category = await categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundError("Category");
    }

    if (category.restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this category");
    }

    return category as CategoryWithItems;
  },

  create: async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
    const userId = tenantContext.getUserId();
    const restaurant = await categoriesRepository.getRestaurantOwnerId(data.restaurantId);

    if (!restaurant) {
      throw new NotFoundError("Restaurant");
    }

    if (restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this restaurant");
    }

    const existingName = await categoriesRepository.nameExistsInRestaurant(data.restaurantId, data.name);
    if (existingName) {
      throw new ConflictError("Category with this name already exists in the restaurant");
    }

    return categoriesRepository.create(data);
  },

  update: async (id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
    const userId = tenantContext.getUserId();
    const category = await categoriesRepository.findByIdSimple(id);

    if (!category) {
      throw new NotFoundError("Category");
    }

    if (category.restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this category");
    }

    if (data.name) {
      const existingName = await categoriesRepository.nameExistsInRestaurant(category.restaurantId, data.name, id);
      if (existingName) {
        throw new ConflictError("Category with this name already exists in the restaurant");
      }
    }

    return categoriesRepository.update(id, data);
  },

  delete: async (id: string): Promise<void> => {
    const userId = tenantContext.getUserId();
    const category = await categoriesRepository.findByIdSimple(id);

    if (!category) {
      throw new NotFoundError("Category");
    }

    if (category.restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this category");
    }

    await categoriesRepository.delete(id);
  },
};
