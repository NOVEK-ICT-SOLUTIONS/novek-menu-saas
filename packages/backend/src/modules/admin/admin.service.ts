import type { AdminRepository } from "@modules/admin/admin.repository";
import { logAction } from "@shared/utils/log-store";
import { logger } from "@shared/utils/logger";

export class AdminService {
  constructor(private adminRepository: AdminRepository) {}

  async getAllUsers() {
    logger.info("Admin: Fetching all users");
    return this.adminRepository.findAllUsers();
  }

  async getAllRestaurants() {
    logger.info("Admin: Fetching all restaurants");
    return this.adminRepository.findAllRestaurants();
  }

  async getRestaurantById(restaurantId: string) {
    logger.info(`Admin: Fetching restaurant ${restaurantId}`);
    return this.adminRepository.findRestaurantById(restaurantId);
  }

  async getAllMenus() {
    logger.info("Admin: Fetching all menus");
    return this.adminRepository.findAllMenus();
  }

  async getStats() {
    logger.info("Admin: Fetching system stats");
    return this.adminRepository.getSystemStats();
  }

  async getRestaurantStats() {
    logger.info("Admin: Fetching restaurant stats");
    return this.adminRepository.getRestaurantStats();
  }

  async updateUserRole(userId: string, role: string) {
    logger.info(`Admin: Updating user ${userId} role to ${role}`);
    const user = await this.adminRepository.updateUserRole(userId, role);

    // Log the action
    logAction("success", "User Role Updated", `User ${user.email} role changed to ${role}`, user.email);

    return user;
  }

  async getLogs(limit = 100) {
    logger.info("Admin: Fetching system logs");
    return this.adminRepository.getLogs(limit);
  }
}
