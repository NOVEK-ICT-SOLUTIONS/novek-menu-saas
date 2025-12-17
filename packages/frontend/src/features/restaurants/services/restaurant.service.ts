import { apiClient } from "@/lib/api-client";

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  primaryColor: string | null;
  backgroundColor: string | null;
  logoUrl: string | null;
  headerImageUrl: string | null;
  qrCodeUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantFormData {
  name?: string;
  slug?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  primaryColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  headerImageUrl?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  imageUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  items: MenuItem[];
}

export interface RestaurantWithCategories extends Restaurant {
  categories: Category[];
}

export interface OwnerStats {
  restaurants: number;
  categories: number;
  menuItems: number;
  qrScans: number;
}

export const restaurantService = {
  getAll: async (): Promise<Restaurant[]> => {
    const response = await apiClient.get("/restaurants");
    return response.data.data.restaurants;
  },

  getById: async (id: string): Promise<RestaurantWithCategories> => {
    const response = await apiClient.get(`/restaurants/${id}`);
    return response.data.data.restaurant;
  },

  getBySlug: async (slug: string): Promise<RestaurantWithCategories> => {
    const response = await apiClient.get(`/public/menu/${slug}`);
    return response.data.data.restaurant;
  },

  create: async (data: { name: string; slug: string }): Promise<Restaurant> => {
    const response = await apiClient.post("/restaurants", data);
    return response.data.data.restaurant;
  },

  update: async (id: string, data: RestaurantFormData): Promise<Restaurant> => {
    const response = await apiClient.patch(`/restaurants/${id}`, data);
    return response.data.data.restaurant;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/restaurants/${id}`);
  },

  getStats: async (): Promise<OwnerStats> => {
    const response = await apiClient.get("/restaurants/stats");
    return response.data.data;
  },
};
