import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";

export interface RestaurantListItem {
  id: string;
  name: string;
  slug: string;
  qrCodeUrl: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    categories: number;
  };
}

export interface CategoryDetail {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  _count: {
    items: number;
  };
}

export interface RestaurantDetail {
  id: string;
  name: string;
  slug: string;
  qrCodeUrl: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  categories: CategoryDetail[];
}

export interface RestaurantsListResponse {
  restaurants: RestaurantListItem[];
}

export interface RestaurantDetailResponse {
  restaurant: RestaurantDetail;
}

const BASE_PATH = "/admin/restaurants";

export const AdminRestaurantsApi = {
  getAllRestaurants: async (): Promise<RestaurantListItem[]> => {
    const response = await apiClient.get<ApiResponse<RestaurantsListResponse>>(BASE_PATH);
    return response.data.data.restaurants;
  },

  getRestaurantById: async (restaurantId: string): Promise<RestaurantDetail> => {
    const response = await apiClient.get<ApiResponse<RestaurantDetailResponse>>(`${BASE_PATH}/${restaurantId}`);
    return response.data.data.restaurant;
  },

  calculateStats: (restaurants: RestaurantListItem[]) => ({
    total: restaurants.length,
    withQrCodes: restaurants.filter((r) => r.qrCodeUrl).length,
    totalCategories: restaurants.reduce((sum, r) => sum + r._count.categories, 0),
    avgCategoriesPerRestaurant:
      restaurants.length > 0
        ? (restaurants.reduce((sum, r) => sum + r._count.categories, 0) / restaurants.length).toFixed(1)
        : "0",
  }),
};
