import type { MenusRepository } from "@modules/menus/menus.repository";
import type { CreateMenuRequest, UpdateMenuRequest } from "@modules/menus/menus.types";
import type { RestaurantsRepository } from "@modules/restaurants/restaurants.repository";
import { AppError } from "@shared/errors/app-error";
import { logger } from "@shared/utils/logger";

export class MenusService {
  constructor(
    private menusRepository: MenusRepository,
    private restaurantsRepository: RestaurantsRepository,
  ) {}

  async getAllMenus(restaurantId: string, ownerId: string) {
    const hasOwnership = await this.restaurantsRepository.checkOwnership(restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    return this.menusRepository.findAllByRestaurant(restaurantId);
  }

  async getMenuById(id: string, ownerId: string) {
    const menu = await this.menusRepository.findById(id);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(menu.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    return menu;
  }

  async createMenu(restaurantId: string, ownerId: string, data: CreateMenuRequest) {
    const hasOwnership = await this.restaurantsRepository.checkOwnership(restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    const menu = await this.menusRepository.create(restaurantId, data.name, data.isActive ?? true);
    logger.info(`Menu created: ${menu.id}`);
    return menu;
  }

  async updateMenu(id: string, ownerId: string, data: UpdateMenuRequest) {
    const menu = await this.menusRepository.findById(id);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(menu.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    return this.menusRepository.update(id, data);
  }

  async deleteMenu(id: string, ownerId: string) {
    const menu = await this.menusRepository.findById(id);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }
    const hasOwnership = await this.restaurantsRepository.checkOwnership(menu.restaurantId, ownerId);
    if (!hasOwnership) {
      throw new AppError("Unauthorized", 403);
    }
    await this.menusRepository.delete(id);
  }
}
