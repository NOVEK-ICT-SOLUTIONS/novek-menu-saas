import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";

export interface RestaurantListItem {
  id: string;
  name: string;
  slug: string;
  qrCodeUrl: string | null;
  createdAt: string;
  owner: {
    id: string;
    email: string;
  };
  _count: {
    menus: number;
    categories: number;
  };
}

export interface RestaurantDetail {
  id: string;
  name: string;
  slug: string;
  qrCodeUrl: string | null;
  createdAt: string;
  owner: {
    id: string;
    email: string;
  };
  menus: Array<{
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    _count: {
      menuItems: number;
    };
  }>;
  categories: Array<{
    id: string;
    name: string;
    _count: {
      menuItems: number;
    };
  }>;
}

export interface RestaurantsListResponse {
  restaurants: RestaurantListItem[];
}

export interface RestaurantDetailResponse {
  restaurant: RestaurantDetail;
}

const BASE_PATH = "/admin/restaurants";

export const AdminRestaurantsApi = {
  async getAllRestaurants(): Promise<RestaurantListItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<RestaurantsListResponse>>(BASE_PATH);
      return response.data.data.restaurants;
    } catch (error) {
      console.error("[AdminRestaurantsApi] Failed to fetch restaurants:", error);
      throw new Error("Failed to fetch restaurants. Please try again.");
    }
  },

  async getRestaurantById(restaurantId: string): Promise<RestaurantDetail> {
    try {
      const response = await apiClient.get<ApiResponse<RestaurantDetailResponse>>(`${BASE_PATH}/${restaurantId}`);
      return response.data.data.restaurant;
    } catch (error) {
      console.error(`[AdminRestaurantsApi] Failed to fetch restaurant ${restaurantId}:`, error);
      throw new Error("Failed to fetch restaurant details. Please try again.");
    }
  },

  calculateStats(restaurants: RestaurantListItem[]) {
    return {
      total: restaurants.length,
      withQrCodes: restaurants.filter((r) => r.qrCodeUrl).length,
      totalMenus: restaurants.reduce((sum, r) => sum + r._count.menus, 0),
      avgMenusPerRestaurant:
        restaurants.length > 0
          ? (restaurants.reduce((sum, r) => sum + r._count.menus, 0) / restaurants.length).toFixed(1)
          : "0",
    };
  },
};
