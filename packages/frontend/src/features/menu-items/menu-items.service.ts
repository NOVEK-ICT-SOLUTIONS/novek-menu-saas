import { apiClient } from "@/lib/api-client";

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  sortOrder?: number;
}

export const menuItemService = {
  getAllByCategory: async (categoryId: string): Promise<MenuItem[]> => {
    const response = await apiClient.get(`/items/category/${categoryId}`);
    return response.data.data.menuItems;
  },

  getById: async (id: string): Promise<MenuItem> => {
    const response = await apiClient.get(`/items/${id}`);
    return response.data.data.menuItem;
  },

  create: async (data: CreateMenuItemData): Promise<MenuItem> => {
    const response = await apiClient.post("/items", data);
    return response.data.data.menuItem;
  },

  update: async (id: string, data: UpdateMenuItemData): Promise<MenuItem> => {
    const response = await apiClient.patch(`/items/${id}`, data);
    return response.data.data.menuItem;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
  },
};
