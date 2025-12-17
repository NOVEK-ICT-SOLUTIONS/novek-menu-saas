export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

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

export interface CreateRestaurantRequest {
  name: string;
  slug: string;
}

export interface UpdateRestaurantRequest {
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

export interface CreateMenuItemRequest {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  sortOrder?: number;
}
