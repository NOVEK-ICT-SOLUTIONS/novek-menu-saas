export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}
