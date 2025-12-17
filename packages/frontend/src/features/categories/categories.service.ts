import { apiClient } from "@/lib/api-client";

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithItems extends Category {
  items: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
    sortOrder: number;
  }[];
}

export interface CreateCategoryData {
  restaurantId: string;
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const categoryService = {
  getAllByRestaurant: async (restaurantId: string): Promise<CategoryWithItems[]> => {
    const response = await apiClient.get(`/categories/restaurant/${restaurantId}`);
    return response.data.data.categories;
  },

  getById: async (id: string): Promise<CategoryWithItems> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data.data.category;
  },

  create: async (data: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post("/categories", data);
    return response.data.data.category;
  },

  update: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data.data.category;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
