import { apiClient } from "@/lib/api-client";

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  primaryColor: string;
  backgroundColor: string;
  logoUrl: string | null;
  headerImageUrl: string | null;
}

export interface RestaurantFormData {
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
  category: {
    id: string;
    name: string;
  } | null;
}

export interface Menu {
  id: string;
  name: string;
  isActive: boolean;
  menuItems: MenuItem[];
}

export interface RestaurantWithMenus extends Restaurant {
  menus: Menu[];
}

export const restaurantService = {
  // Get all restaurants for the current owner
  getAllRestaurants: async (): Promise<Restaurant[]> => {
    const response = await apiClient.get("/restaurants");
    return response.data.data.restaurants;
  },

  // Get a single restaurant by ID
  getRestaurantById: async (id: string): Promise<Restaurant> => {
    const response = await apiClient.get(`/restaurants/${id}`);
    return response.data.data.restaurant;
  },

  // Get a restaurant by slug (public endpoint)
  getRestaurantBySlug: async (slug: string): Promise<RestaurantWithMenus> => {
    const response = await apiClient.get(`/restaurants/slug/${slug}`);
    return response.data.data.restaurant;
  },

  // Update restaurant customization
  updateRestaurant: async (id: string, data: RestaurantFormData): Promise<Restaurant> => {
    const response = await apiClient.patch(`/restaurants/${id}`, data);
    return response.data.data.restaurant;
  },

  // Create a new restaurant
  createRestaurant: async (data: { name: string; slug: string }): Promise<Restaurant> => {
    const response = await apiClient.post("/restaurants", data);
    return response.data.data.restaurant;
  },

  // Delete a restaurant
  deleteRestaurant: async (id: string): Promise<void> => {
    await apiClient.delete(`/restaurants/${id}`);
  },
};
