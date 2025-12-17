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
  totalCategories: number;
  totalMenuItems: number;
  totalQRScans: number;
  qrScansThisMonth: number;
  newUsersThisMonth: number;
  activeCategories: number;
  userGrowth: number;
  scanGrowth: number;
  avgCategoriesPerRestaurant: number;
  avgItemsPerCategory: number;
  avgScansPerRestaurant: number;
}

export interface RestaurantStats {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  createdAt: string;
  totalCategories: number;
  totalMenuItems: number;
  totalScans: number;
  scansThisMonth: number;
}

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get("/admin/users");
    return response.data.data.users;
  },

  updateUserRole: async (userId: string, role: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  getStats: async (): Promise<Stats> => {
    const response = await apiClient.get("/admin/stats");
    return response.data.data;
  },

  getRestaurantStats: async (): Promise<RestaurantStats[]> => {
    const response = await apiClient.get("/admin/stats/restaurants");
    return response.data.data;
  },
};
