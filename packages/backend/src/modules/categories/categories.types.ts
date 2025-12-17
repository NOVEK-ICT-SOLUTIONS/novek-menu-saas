export interface CreateCategoryRequest {
  restaurantId: string;
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryResponse {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithItems extends CategoryResponse {
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
