import { tenantContext } from "../../core/context/tenant.context.ts";
import { ForbiddenError, NotFoundError } from "../../core/errors/base.error.ts";
import { menuItemsRepository } from "./menu-items.repository.ts";
import type { CreateMenuItemRequest, MenuItemResponse, UpdateMenuItemRequest } from "./menu-items.types.ts";

export const menuItemsService = {
  getAllByCategory: async (categoryId: string): Promise<MenuItemResponse[]> => {
    const userId = tenantContext.getUserId();
    const category = await menuItemsRepository.getCategoryOwnerId(categoryId);

    if (!category) {
      throw new NotFoundError("Category");
    }

    if (category.restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this category");
    }

    return menuItemsRepository.findAllByCategory(categoryId);
  },

  getById: async (id: string): Promise<MenuItemResponse> => {
    const userId = tenantContext.getUserId();
    const menuItem = await menuItemsRepository.findById(id);

    if (!menuItem) {
      throw new NotFoundError("Menu item");
    }

    if (menuItem.category.restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this menu item");
    }

    return menuItem;
  },

  create: async (data: CreateMenuItemRequest): Promise<MenuItemResponse> => {
    const userId = tenantContext.getUserId();
    const category = await menuItemsRepository.getCategoryOwnerId(data.categoryId);

    if (!category) {
      throw new NotFoundError("Category");
    }

    if (category.restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this category");
    }

    return menuItemsRepository.create(data);
  },

  update: async (id: string, data: UpdateMenuItemRequest): Promise<MenuItemResponse> => {
    const userId = tenantContext.getUserId();
    const menuItem = await menuItemsRepository.findByIdSimple(id);

    if (!menuItem) {
      throw new NotFoundError("Menu item");
    }

    if (menuItem.category.restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this menu item");
    }

    return menuItemsRepository.update(id, data);
  },

  delete: async (id: string): Promise<void> => {
    const userId = tenantContext.getUserId();
    const menuItem = await menuItemsRepository.findByIdSimple(id);

    if (!menuItem) {
      throw new NotFoundError("Menu item");
    }

    if (menuItem.category.restaurant.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this menu item");
    }

    await menuItemsRepository.delete(id);
  },
};
