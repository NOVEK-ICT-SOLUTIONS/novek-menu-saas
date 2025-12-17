import { adminRepository } from "./admin.repository.ts";
import type { UserRole } from "@prisma/client";

export const adminService = {
  getAllUsers: () => {
    return adminRepository.findAllUsers();
  },

  getAllRestaurants: () => {
    return adminRepository.findAllRestaurants();
  },

  getRestaurantById: (restaurantId: string) => {
    return adminRepository.findRestaurantById(restaurantId);
  },

  getStats: () => {
    return adminRepository.getSystemStats();
  },

  getRestaurantStats: () => {
    return adminRepository.getRestaurantStats();
  },

  updateUserRole: (userId: string, role: UserRole) => {
    return adminRepository.updateUserRole(userId, role);
  },
};
