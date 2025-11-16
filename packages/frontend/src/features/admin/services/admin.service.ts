import { apiClient } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  role: "OWNER" | "ADMIN" | "CUSTOMER";
  createdAt: string;
  _count: {
    restaurants: number;
  };
}

export interface Stats {
  totalUsers: number;
  totalRestaurants: number;
  totalMenus: number;
  totalMenuItems: number;
  totalQRScans?: number;
  qrScansThisMonth?: number;
  newUsersThisMonth?: number;
  activeMenus?: number;
  userGrowth?: number;
  scanGrowth?: number;
  avgMenusPerRestaurant?: number;
  avgItemsPerMenu?: number;
  avgScansPerRestaurant?: number;
}

export interface RestaurantStats {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  createdAt: string;
  totalMenus: number;
  totalCategories: number;
  totalMenuItems: number;
  totalScans: number;
  scansThisMonth: number;
}

export interface Menu {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  restaurant: {
    id?: string;
    name: string;
    slug?: string;
  };
  _count: {
    menuItems: number;
  };
}

export const adminService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get("/admin/users");
    return response.data.data.users;
  },

  // Update user role
  updateUserRole: async (userId: string, role: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  // Get admin stats
  getStats: async (): Promise<Stats> => {
    const response = await apiClient.get("/admin/stats");
    return response.data.data;
  },

  // Get all menus (admin only)
  getAllMenus: async (): Promise<Menu[]> => {
    const response = await apiClient.get("/admin/menus");
    return response.data.data.menus;
  },

  // Get restaurant stats (admin only)
  getRestaurantStats: async (): Promise<RestaurantStats[]> => {
    const response = await apiClient.get("/admin/stats/restaurants");
    return response.data.data;
  },
};
