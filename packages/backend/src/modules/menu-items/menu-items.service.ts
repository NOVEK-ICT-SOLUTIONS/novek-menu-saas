import type { MenuItemsRepository } from "@modules/menu-items/menu-items.repository";
import type { CreateMenuItemRequest, UpdateMenuItemRequest } from "@modules/menu-items/menu-items.types";
import type { MenusRepository } from "@modules/menus/menus.repository";
import type { RestaurantsRepository } from "@modules/restaurants/restaurants.repository";
import { AppError } from "@shared/errors/app-error";
import { logger } from "@shared/utils/logger";

export class MenuItemsService {
  constructor(
    private menuItemsRepository: MenuItemsRepository,
    private menusRepository: MenusRepository,
    private restaurantsRepository: RestaurantsRepository,
  ) {}

  async getAllMenuItems(menuId: string, ownerId: string) {
    const menu = await this.menusRepository.findById(menuId);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(menu.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    return this.menuItemsRepository.findAllByMenu(menuId);
  }

  async getMenuItemById(id: string, ownerId: string) {
    const menuItem = await this.menuItemsRepository.findById(id);
    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(menuItem.menu.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    return menuItem;
  }

  async createMenuItem(menuId: string, ownerId: string, data: CreateMenuItemRequest) {
    const menu = await this.menusRepository.findById(menuId);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(menu.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    const menuItem = await this.menuItemsRepository.create(menuId, data);
    logger.info(`Menu item created: ${menuItem.id}`);
    return menuItem;
  }

  async updateMenuItem(id: string, ownerId: string, data: UpdateMenuItemRequest) {
    const menuItem = await this.menuItemsRepository.findById(id);
    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(menuItem.menu.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    return this.menuItemsRepository.update(id, data);
  }

  async deleteMenuItem(id: string, ownerId: string) {
    const menuItem = await this.menuItemsRepository.findById(id);
    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(menuItem.menu.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    await this.menuItemsRepository.delete(id);
  }
}
